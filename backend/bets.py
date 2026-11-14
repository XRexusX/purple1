from database import db_cursor, execute_query, fetch_all, fetch_one
from utils import image_path

MIN_BET = 10
STARTING_COINS = 1000
VALID_STATUSES = {"SCHEDULED", "OPEN", "LOCKED", "CANCELLED"}
DEFAULT_RACE_IMAGE = "img/poster-formula-1-night-race-placeholder.png"


def _race_pool_map(race_id):
    rows = fetch_all(
        "SELECT option_id, SUM(amount) AS total FROM bets WHERE race_id = %s AND status != 'REFUNDED' GROUP BY option_id",
        (race_id,),
    )
    return {row["option_id"]: int(row["total"]) for row in rows}


def _decorate_options(race_id, options, user_bet=None):
    """Cuotas tipo 'pool' (parimutuel): se calculan en vivo repartiendo el bote total
    entre los PitCoins puestos en cada piloto, igual que en un mercado de prediccion.
    Nadie fija una cuota arbitraria: sube o baja segun a quien elija la gente."""
    pools = _race_pool_map(race_id)
    total_pool = sum(pools.values())
    for option in options:
        option["image_path"] = image_path(option.get("image_path") or option.get("team_logo"))
        pool = pools.get(option["id"], 0)
        option["pool"] = pool
        option["odds"] = round(total_pool / pool, 2) if pool > 0 else None
        option["is_user_pick"] = bool(user_bet and user_bet["option_id"] == option["id"])
    return options, total_pool


def _load_options(race_id):
    return fetch_all(
        """
        SELECT ro.id, ro.race_id, ro.driver_name, ro.team_id, ro.image_path,
               t.name AS team_name, t.logo_path AS team_logo
        FROM race_options ro
        LEFT JOIN teams t ON t.id = ro.team_id
        WHERE ro.race_id = %s
        ORDER BY ro.id
        """,
        (race_id,),
    )


def list_races(params=None):
    params = params or {}
    status = (params.get("status", [None])[0] or "").upper()
    user_id = int(params.get("user_id", [0])[0] or 0)
    where, args = "", ()
    if status:
        where, args = "WHERE status = %s", (status,)
    races = fetch_all(f"SELECT * FROM races {where} ORDER BY race_date ASC", args)
    for race in races:
        race["image_path"] = image_path(race.get("image_path") or DEFAULT_RACE_IMAGE)
        user_bet = fetch_one("SELECT * FROM bets WHERE race_id = %s AND user_id = %s", (race["id"], user_id)) if user_id else None
        options, total_pool = _decorate_options(race["id"], _load_options(race["id"]), user_bet)
        race["options"] = options
        race["total_pool"] = total_pool
        race["user_bet"] = user_bet
        participants = fetch_one("SELECT COUNT(DISTINCT user_id) AS c FROM bets WHERE race_id = %s", (race["id"],))
        race["participants"] = participants["c"] if participants else 0
    return races


def get_race_detail(race_id, user_id=0):
    race = fetch_one("SELECT * FROM races WHERE id = %s", (race_id,))
    if not race:
        return None
    race["image_path"] = image_path(race.get("image_path") or DEFAULT_RACE_IMAGE)
    user_bet = fetch_one("SELECT * FROM bets WHERE race_id = %s AND user_id = %s", (race_id, user_id)) if user_id else None
    options, total_pool = _decorate_options(race_id, _load_options(race_id), user_bet)
    race["options"] = options
    race["total_pool"] = total_pool
    race["user_bet"] = user_bet
    participants = fetch_one("SELECT COUNT(DISTINCT user_id) AS c FROM bets WHERE race_id = %s", (race_id,))
    race["participants"] = participants["c"] if participants else 0
    return race


def place_bet(race_id, data):
    user_id = int(data.get("user_id") or 0)
    option_id = int(data.get("option_id") or 0)
    try:
        amount = int(data.get("amount") or 0)
    except (TypeError, ValueError):
        amount = 0

    if not user_id or not option_id:
        return None, "user_id y option_id son obligatorios.", 400
    if amount < MIN_BET:
        return None, f"El pronostico minimo es de {MIN_BET} PitCoins.", 400

    race = fetch_one("SELECT * FROM races WHERE id = %s", (race_id,))
    if not race:
        return None, "Carrera no encontrada.", 404
    if race["status"] != "OPEN":
        return None, "Los pronosticos para esta carrera no estan abiertos.", 400
    option = fetch_one("SELECT id FROM race_options WHERE id = %s AND race_id = %s", (option_id, race_id))
    if not option:
        return None, "Piloto no encontrado en esta carrera.", 404

    error = None
    with db_cursor(dictionary=True) as (connection, cursor):
        cursor.execute("SELECT id, coins FROM users WHERE id = %s FOR UPDATE", (user_id,))
        user_row = cursor.fetchone()
        if not user_row:
            error = "Usuario no encontrado."
        else:
            cursor.execute("SELECT * FROM bets WHERE race_id = %s AND user_id = %s", (race_id, user_id))
            existing = cursor.fetchone()
            available = user_row["coins"] + (existing["amount"] if existing else 0)
            if amount > available:
                error = "No tienes suficientes PitCoins para este pronostico."
            else:
                cursor.execute("UPDATE users SET coins = %s WHERE id = %s", (available - amount, user_id))
                if existing:
                    cursor.execute(
                        "UPDATE bets SET option_id = %s, amount = %s, status = 'PENDING', payout = 0 WHERE id = %s",
                        (option_id, amount, existing["id"]),
                    )
                else:
                    cursor.execute(
                        "INSERT INTO bets (user_id, race_id, option_id, amount) VALUES (%s, %s, %s, %s)",
                        (user_id, race_id, option_id, amount),
                    )
        connection.rollback() if error else connection.commit()

    if error:
        return None, error, 400
    user = fetch_one("SELECT id, username, coins FROM users WHERE id = %s", (user_id,))
    return {"success": True, "race": get_race_detail(race_id, user_id), "user": user}, None, 200


def get_user_bets(user_id):
    return fetch_all(
        """
        SELECT b.id, b.race_id, b.option_id, b.amount, b.status, b.payout, b.created_at,
               r.name AS race_name, r.race_date, r.status AS race_status, r.winner_option_id,
               ro.driver_name
        FROM bets b
        JOIN races r ON r.id = b.race_id
        JOIN race_options ro ON ro.id = b.option_id
        WHERE b.user_id = %s
        ORDER BY b.created_at DESC
        """,
        (user_id,),
    )


def get_leaderboard(limit=10):
    return fetch_all(
        f"""
        SELECT id, username, first_name, last_name, coins
        FROM users WHERE is_active = TRUE
        ORDER BY coins DESC LIMIT {int(limit)}
        """
    )


def _require_staff(user_id):
    staff = fetch_one("SELECT is_staff FROM users WHERE id = %s", (user_id,))
    return bool(staff and staff["is_staff"])


def set_race_status(race_id, data):
    staff_id = int(data.get("user_id") or 0)
    new_status = (data.get("status") or "").upper()
    if not _require_staff(staff_id):
        return None, "Solo el staff puede administrar carreras.", 403
    if new_status not in VALID_STATUSES:
        return None, "Estado invalido.", 400
    race = fetch_one("SELECT status FROM races WHERE id = %s", (race_id,))
    if not race:
        return None, "Carrera no encontrada.", 404
    if race["status"] == "FINISHED":
        return None, "No puedes modificar una carrera ya finalizada.", 400
    execute_query("UPDATE races SET status = %s WHERE id = %s", (new_status, race_id))
    return {"success": True, "race": get_race_detail(race_id)}, None, 200


def settle_race(race_id, data):
    """Liquida la carrera: reparte todo el bote entre quienes acertaron el ganador,
    en proporcion a los PitCoins que pusieron (parimutuel). Si nadie acerto, cada
    quien recupera lo suyo."""
    staff_id = int(data.get("user_id") or 0)
    winner_option_id = int(data.get("winner_option_id") or 0)
    if not _require_staff(staff_id):
        return None, "Solo el staff puede cerrar una carrera.", 403
    race = fetch_one("SELECT * FROM races WHERE id = %s", (race_id,))
    if not race:
        return None, "Carrera no encontrada.", 404
    if race["status"] == "FINISHED":
        return None, "Esta carrera ya fue liquidada.", 400
    option = fetch_one("SELECT id FROM race_options WHERE id = %s AND race_id = %s", (winner_option_id, race_id))
    if not option:
        return None, "Piloto ganador invalido.", 400

    bets = fetch_all("SELECT * FROM bets WHERE race_id = %s AND status = 'PENDING'", (race_id,))
    total_pool = sum(b["amount"] for b in bets)
    winning_pool = sum(b["amount"] for b in bets if b["option_id"] == winner_option_id)

    with db_cursor(dictionary=True) as (connection, cursor):
        for bet in bets:
            if winning_pool == 0:
                # Nadie acerto: se devuelve a cada quien lo que puso.
                cursor.execute("UPDATE bets SET status = 'REFUNDED', payout = %s WHERE id = %s", (bet["amount"], bet["id"]))
                cursor.execute("UPDATE users SET coins = coins + %s WHERE id = %s", (bet["amount"], bet["user_id"]))
            elif bet["option_id"] == winner_option_id:
                payout = int(bet["amount"] * total_pool / winning_pool)
                cursor.execute("UPDATE bets SET status = 'WON', payout = %s WHERE id = %s", (payout, bet["id"]))
                cursor.execute("UPDATE users SET coins = coins + %s WHERE id = %s", (payout, bet["user_id"]))
            else:
                cursor.execute("UPDATE bets SET status = 'LOST', payout = 0 WHERE id = %s", (bet["id"],))
        cursor.execute(
            "UPDATE races SET status = 'FINISHED', winner_option_id = %s WHERE id = %s",
            (winner_option_id, race_id),
        )
        connection.commit()

    return {"success": True, "race": get_race_detail(race_id)}, None, 200
