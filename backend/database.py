import os
from contextlib import contextmanager

import mysql.connector
from mysql.connector import Error

from pathlib import Path


def _load_env_file():
    """Lee el archivo .env de la raiz del proyecto (si existe) y carga sus
    variables. Asi la contrasena de MySQL vive en .env (que no se sube a
    GitHub) y no dentro del codigo."""
    env_path = Path(__file__).resolve().parent.parent / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


_load_env_file()

DEFAULT_DB_CONFIG = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",  # se configura con la variable PURPLE1_DB_PASSWORD (ver .env.example)
    "database": "purple1",
    "port": 3306,
}


def _clean_host(host):
    value = (host or DEFAULT_DB_CONFIG["host"]).strip()
    if value.lower() == "localhost":
        return "127.0.0.1"
    return value


DB_CONFIG = {
    "host": _clean_host(os.getenv("PURPLE1_DB_HOST", DEFAULT_DB_CONFIG["host"])),
    "user": os.getenv("PURPLE1_DB_USER", DEFAULT_DB_CONFIG["user"]).strip(),
    "password": os.getenv("PURPLE1_DB_PASSWORD", DEFAULT_DB_CONFIG["password"]),
    "database": os.getenv("PURPLE1_DB_NAME", DEFAULT_DB_CONFIG["database"]).strip(),
    "port": int(os.getenv("PURPLE1_DB_PORT", str(DEFAULT_DB_CONFIG["port"]))),
}


def get_connection():
    config = {**DB_CONFIG, "host": _clean_host(DB_CONFIG.get("host"))}
    try:
        return mysql.connector.connect(**config, connection_timeout=5)
    except Error as exc:
        safe_config = dict(config)
        safe_config["password"] = "***"
        raise RuntimeError(f"Error conectando a MySQL con {safe_config}: {exc}") from exc


def close_connection(connection=None, cursor=None):
    if cursor is not None:
        cursor.close()
    if connection is not None and connection.is_connected():
        connection.close()


@contextmanager
def db_cursor(dictionary=True):
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=dictionary)
        yield connection, cursor
    except Error as exc:
        if connection:
            connection.rollback()
        raise RuntimeError(f"Error de base de datos: {exc}") from exc
    finally:
        close_connection(connection, cursor)


def fetch_all(sql, params=()):
    with db_cursor(dictionary=True) as (_, cursor):
        cursor.execute(sql, params)
        return cursor.fetchall()


def fetch_one(sql, params=()):
    rows = fetch_all(sql, params)
    return rows[0] if rows else None


def execute_query(sql, params=()):
    with db_cursor(dictionary=True) as (connection, cursor):
        cursor.execute(sql, params)
        connection.commit()
        return {"lastrowid": cursor.lastrowid, "rowcount": cursor.rowcount}


def test_connection():
    connection = None
    cursor = None
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT DATABASE(), VERSION()")
        database_name, version = cursor.fetchone()
        return {
            "success": True,
            "database": database_name,
            "version": version,
            "config": {**DB_CONFIG, "host": _clean_host(DB_CONFIG.get("host")), "password": "***"},
        }
    finally:
        close_connection(connection, cursor)


def ensure_database_ready():
    team_rows = [
        ("Ferrari", "ferrari", "Escuderia Ferrari.", "img/escudo-ferrari.jpeg"),
        ("Red Bull", "red-bull", "Oracle Red Bull Racing.", "img/escudo-redbull.jpeg"),
        ("Mercedes", "mercedes", "Mercedes-AMG Petronas Formula One Team.", "img/escudo-mercedes.jpeg"),
        ("McLaren", "mclaren", "McLaren Formula 1 Team.", "img/escudo-mclaren.jpeg"),
        ("Alpine", "alpine", "BWT Alpine Formula One Team.", "img/escudo-alpine.jpeg"),
        ("Cadillac", "cadillac", "Cadillac Formula 1 Team.", "img/escudo-cadillac.jpeg"),
    ]
    with db_cursor(dictionary=True) as (connection, cursor):
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS teams (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                slug VARCHAR(120) NOT NULL UNIQUE,
                description VARCHAR(200),
                logo_path VARCHAR(255),
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS product_teams (
                product_id INT NOT NULL,
                team_id INT NOT NULL,
                PRIMARY KEY (product_id, team_id),
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
            """
        )
        cursor.executemany(
            """
            INSERT INTO teams (name, slug, description, logo_path, is_active)
            VALUES (%s, %s, %s, %s, TRUE)
            ON DUPLICATE KEY UPDATE
                name = VALUES(name),
                description = VALUES(description),
                logo_path = VALUES(logo_path),
                is_active = TRUE
            """,
            team_rows,
        )
        cursor.execute(
            """
            INSERT IGNORE INTO product_teams (product_id, team_id)
            SELECT DISTINCT pc.product_id, t.id
            FROM product_categories pc
            JOIN categories c ON c.id = pc.category_id
            JOIN teams t ON t.slug = c.slug
            """
        )
        connection.commit()
    _ensure_betting_module()
    _ensure_avatar_module()


def _column_exists(table, column):
    row = fetch_one(
        """
        SELECT COUNT(*) AS c FROM information_schema.columns
        WHERE table_schema = DATABASE() AND table_name = %s AND column_name = %s
        """,
        (table, column),
    )
    return bool(row and row["c"])


def _ensure_betting_module():
    """Crea (si hace falta) el modulo de 'Pronosticos': monedas virtuales por
    usuario + carreras + opciones + pronosticos. No usa dinero real: los
    'PitCoins' son un saldo interno de juego, para que pronosticar cada carrera
    sea seguro y sin riesgo economico, al estilo de un modo prediccion/fantasy.
    (Las tablas conservan sus nombres internos: races, race_options, bets.)"""
    with db_cursor(dictionary=True) as (connection, cursor):
        if not _column_exists("users", "coins"):
            cursor.execute("ALTER TABLE users ADD COLUMN coins INT NOT NULL DEFAULT 1000")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS races (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(150) NOT NULL,
                circuit VARCHAR(150) NOT NULL,
                country VARCHAR(100),
                race_date DATETIME NOT NULL,
                image_path VARCHAR(255),
                status ENUM('SCHEDULED','OPEN','LOCKED','FINISHED','CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
                winner_option_id INT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS race_options (
                id INT AUTO_INCREMENT PRIMARY KEY,
                race_id INT NOT NULL,
                driver_name VARCHAR(100) NOT NULL,
                team_id INT NULL,
                image_path VARCHAR(255),
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL ON UPDATE CASCADE
            )
            """
        )
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS bets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                race_id INT NOT NULL,
                option_id INT NOT NULL,
                amount INT NOT NULL,
                status ENUM('PENDING','WON','LOST','REFUNDED') NOT NULL DEFAULT 'PENDING',
                payout INT NOT NULL DEFAULT 0,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (race_id) REFERENCES races(id) ON DELETE CASCADE ON UPDATE CASCADE,
                FOREIGN KEY (option_id) REFERENCES race_options(id) ON DELETE CASCADE ON UPDATE CASCADE,
                UNIQUE KEY uq_user_race (user_id, race_id),
                INDEX idx_bets_race (race_id)
            )
            """
        )
        connection.commit()

    race_count = fetch_one("SELECT COUNT(*) AS c FROM races")
    if race_count and race_count["c"]:
        return

    team_ids = {row["slug"]: row["id"] for row in fetch_all("SELECT id, slug FROM teams")}
    races_seed = [
        ("Gran Premio de Monza", "Autodromo Nazionale Monza", "Italia", "2026-09-06 14:00:00",
         [("Charles Leclerc", "ferrari"), ("Max Verstappen", "red-bull"), ("Lando Norris", "mclaren"), ("George Russell", "mercedes")]),
        ("Gran Premio de Singapur", "Marina Bay Street Circuit", "Singapur", "2026-09-20 13:00:00",
         [("Oscar Piastri", "mclaren"), ("Max Verstappen", "red-bull"), ("Charles Leclerc", "ferrari"), ("Lewis Hamilton", "ferrari")]),
        ("Gran Premio de Las Vegas", "Las Vegas Strip Circuit", "Estados Unidos", "2026-11-21 06:00:00",
         [("Max Verstappen", "red-bull"), ("Lando Norris", "mclaren"), ("George Russell", "mercedes"), ("Carlos Sainz", "cadillac")]),
    ]
    with db_cursor(dictionary=True) as (connection, cursor):
        for name, circuit, country, race_date, drivers in races_seed:
            cursor.execute(
                """
                INSERT INTO races (name, circuit, country, race_date, image_path, status)
                VALUES (%s, %s, %s, %s, %s, 'OPEN')
                """,
                (name, circuit, country, race_date, "img/poster-formula-1-night-race-placeholder.png"),
            )
            race_id = cursor.lastrowid
            for driver_name, team_slug in drivers:
                cursor.execute(
                    "INSERT INTO race_options (race_id, driver_name, team_id) VALUES (%s, %s, %s)",
                    (race_id, driver_name, team_ids.get(team_slug)),
                )
        connection.commit()


def _ensure_avatar_module():
    """Crea (si hace falta) lo que necesita el avatar del perfil: la columna
    users.avatar_config (que prendas tiene puestas, en JSON) y la tabla
    user_avatar_items (que prendas compro con PitCoins). El catalogo de
    prendas esta en avatar.py."""
    with db_cursor(dictionary=True) as (connection, cursor):
        if not _column_exists("users", "avatar_config"):
            cursor.execute("ALTER TABLE users ADD COLUMN avatar_config TEXT NULL")
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS user_avatar_items (
                user_id INT NOT NULL,
                item_id VARCHAR(60) NOT NULL,
                acquired_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, item_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
            )
            """
        )
        connection.commit()
