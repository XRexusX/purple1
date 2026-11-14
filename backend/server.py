from http.server import HTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse
import json

from auth import change_password, forgot_password, login_user, register_user
from avatar import buy_avatar_item, get_avatar, save_avatar
from bets import get_leaderboard, get_race_detail, get_user_bets, list_races, place_bet, set_race_status, settle_race
from cart import add_to_cart, get_cart, remove_cart_item, update_cart_item
from categories import get_categories, get_colors, get_sizes, get_teams
from database import ensure_database_ready, test_connection
from orders import create_order
from payments_sim import simulate_payment
from products import filter_products, get_product_detail, get_products, search_products
from users import delete_user, get_user, list_users, update_user
from utils import json_default

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
HOST = "127.0.0.1"
PORT = 8000


class PurpleOneHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def read_json(self):
        length = int(self.headers.get("Content-Length", "0") or "0")
        if length == 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw) if raw else {}

    def send_json(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False, default=json_default).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, message, status=400):
        self.send_json({"success": False, "error": message}, status)

    def do_GET(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            return super().do_GET()
        try:
            self.route_get(parsed.path, parse_qs(parsed.query))
        except Exception as exc:
            self.send_error_json(str(exc), 500)

    def do_POST(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            return self.send_error_json("Ruta no encontrada.", 404)
        try:
            self.route_post(parsed.path, self.read_json())
        except Exception as exc:
            self.send_error_json(str(exc), 500)

    def do_PUT(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            return self.send_error_json("Ruta no encontrada.", 404)
        try:
            self.route_put(parsed.path, self.read_json())
        except Exception as exc:
            self.send_error_json(str(exc), 500)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if not parsed.path.startswith("/api/"):
            return self.send_error_json("Ruta no encontrada.", 404)
        try:
            self.route_delete(parsed.path, parse_qs(parsed.query), self.read_json())
        except Exception as exc:
            self.send_error_json(str(exc), 500)

    def route_get(self, path, params):
        if path == "/api/products":
            return self.send_json({"success": True, "products": get_products(params)})
        if path == "/api/products/search":
            return self.send_json({"success": True, "products": search_products(params)})
        if path == "/api/products/filter":
            return self.send_json({"success": True, "products": filter_products(params)})
        if path.startswith("/api/products/"):
            product_id = int(path.rsplit("/", 1)[1])
            product = get_product_detail(product_id)
            if not product:
                return self.send_error_json("Producto no encontrado.", 404)
            return self.send_json({"success": True, "product": product})
        if path == "/api/categories":
            return self.send_json({"success": True, "categories": get_categories()})
        if path == "/api/teams":
            return self.send_json({"success": True, "teams": get_teams()})
        if path == "/api/sizes":
            return self.send_json({"success": True, "sizes": get_sizes()})
        if path == "/api/colors":
            return self.send_json({"success": True, "colors": get_colors()})
        if path == "/api/users":
            return self.send_json({"success": True, "users": list_users()})
        if path.startswith("/api/users/"):
            user = get_user(int(path.rsplit("/", 1)[1]))
            if not user:
                return self.send_error_json("Usuario no encontrado.", 404)
            return self.send_json({"success": True, "user": user})
        if path == "/api/cart":
            user_id = int(params.get("user_id", [0])[0] or 0)
            if not user_id:
                return self.send_error_json("user_id es obligatorio.")
            return self.send_json({"success": True, "cart": get_cart(user_id)})
        if path == "/api/avatar":
            user_id = int(params.get("user_id", [0])[0] or 0)
            if not user_id:
                return self.send_error_json("user_id es obligatorio.")
            avatar = get_avatar(user_id)
            if not avatar:
                return self.send_error_json("Usuario no encontrado.", 404)
            return self.send_json({"success": True, "avatar": avatar})
        if path == "/api/races":
            return self.send_json({"success": True, "races": list_races(params)})
        if path == "/api/races/leaderboard":
            return self.send_json({"success": True, "leaderboard": get_leaderboard()})
        if path.startswith("/api/races/"):
            race_id = int(path.rsplit("/", 1)[1])
            user_id = int(params.get("user_id", [0])[0] or 0)
            race = get_race_detail(race_id, user_id)
            if not race:
                return self.send_error_json("Carrera no encontrada.", 404)
            return self.send_json({"success": True, "race": race})
        if path == "/api/bets":
            user_id = int(params.get("user_id", [0])[0] or 0)
            if not user_id:
                return self.send_error_json("user_id es obligatorio.")
            return self.send_json({"success": True, "bets": get_user_bets(user_id)})
        return self.send_error_json("Ruta no encontrada.", 404)

    def route_post(self, path, data):
        if path == "/api/auth/logout":
            return self.send_json({"success": True})
        if path == "/api/users":
            payload, error, status = register_user(data)
            if error:
                return self.send_error_json(error, status)
            return self.send_json(payload, status)
        if path.startswith("/api/races/") and path.endswith("/bet"):
            race_id = int(path.split("/")[3])
            payload, error, status = place_bet(race_id, data)
            if error:
                return self.send_error_json(error, status)
            return self.send_json(payload, status)
        if path.startswith("/api/races/") and path.endswith("/status"):
            race_id = int(path.split("/")[3])
            payload, error, status = set_race_status(race_id, data)
            if error:
                return self.send_error_json(error, status)
            return self.send_json(payload, status)
        if path.startswith("/api/races/") and path.endswith("/result"):
            race_id = int(path.split("/")[3])
            payload, error, status = settle_race(race_id, data)
            if error:
                return self.send_error_json(error, status)
            return self.send_json(payload, status)
        handlers = {
            "/api/auth/register": register_user,
            "/api/auth/login": login_user,
            "/api/auth/forgot-password": forgot_password,
            "/api/auth/change-password": change_password,
            "/api/cart/add": add_to_cart,
            "/api/orders": create_order,
            "/api/payments/simulate": simulate_payment,
            "/api/avatar/buy": buy_avatar_item,
        }
        handler = handlers.get(path)
        if not handler:
            return self.send_error_json("Ruta no encontrada.", 404)
        payload, error, status = handler(data)
        if error:
            return self.send_error_json(error, status)
        return self.send_json(payload, status)

    def route_put(self, path, data):
        if path.startswith("/api/users/"):
            user = update_user(int(path.rsplit("/", 1)[1]), data)
            if not user:
                return self.send_error_json("Usuario no encontrado.", 404)
            return self.send_json({"success": True, "user": user})
        if path == "/api/avatar":
            payload, error, status = save_avatar(data)
            if error:
                return self.send_error_json(error, status)
            return self.send_json(payload, status)
        if path == "/api/cart/update":
            payload, error, status = update_cart_item(data)
            if error:
                return self.send_error_json(error, status)
            return self.send_json(payload, status)
        return self.send_error_json("Ruta no encontrada.", 404)

    def route_delete(self, path, params, data):
        if path.startswith("/api/users/"):
            ok = delete_user(int(path.rsplit("/", 1)[1]))
            if not ok:
                return self.send_error_json("Usuario no encontrado.", 404)
            return self.send_json({"success": True})
        if path == "/api/cart/remove":
            user_id = int(data.get("user_id") or params.get("user_id", [0])[0] or 0)
            cart_item_id = int(data.get("cart_item_id") or data.get("item_id") or params.get("cart_item_id", [0])[0] or 0)
            if not user_id or not cart_item_id:
                return self.send_error_json("user_id y cart_item_id son obligatorios.")
            return self.send_json(remove_cart_item(user_id, cart_item_id))
        return self.send_error_json("Ruta no encontrada.", 404)


def run_server(host=HOST, port=PORT):
    if not FRONTEND_DIR.exists():
        print("No existe la carpeta frontend.", flush=True)
        return
    print("Probando conexion a MySQL...", flush=True)
    try:
        db_status = test_connection()
        ensure_database_ready()
    except Exception as exc:
        print(f"Conexion MySQL fallida: {exc}", flush=True)
        raise
    print(
        "Conexion MySQL exitosa: "
        f"database={db_status['database']} version={db_status['version']} "
        f"host={db_status['config']['host']} user={db_status['config']['user']} "
        f"port={db_status['config']['port']}",
        flush=True,
    )
    server = HTTPServer((host, port), PurpleOneHandler)
    print("Servidor Python puro iniciado", flush=True)
    print(f"Frontend: http://{host}:{port}/index.html", flush=True)
    print(f"API: http://{host}:{port}/api/products", flush=True)
    server.serve_forever()
