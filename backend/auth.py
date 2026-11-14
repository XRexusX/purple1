from database import execute_query, fetch_one
from utils import check_password, hash_password, public_user, valid_email, validate_password


def register_user(data):
    first_name = (data.get("first_name") or data.get("name") or "").strip()
    last_name = (data.get("last_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    password_confirm = data.get("password_confirm") or password
    phone = (data.get("phone") or "").strip()
    address = (data.get("address") or "").strip()

    if not all([first_name, last_name, email, password]):
        return None, "Completa todos los campos obligatorios.", 400
    if not valid_email(email):
        return None, "Correo electronico invalido.", 400
    if password != password_confirm:
        return None, "Las contrasenas no coinciden.", 400
    ok, message = validate_password(password)
    if not ok:
        return None, message, 400
    if fetch_one("SELECT id FROM users WHERE LOWER(email) = LOWER(%s)", (email,)):
        return None, "Ya existe una cuenta con ese correo.", 400

    result = execute_query(
        """INSERT INTO users (username, email, password_hash, first_name, last_name, phone, address)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (email, email, hash_password(password), first_name, last_name, phone, address),
    )
    user = fetch_one(
        "SELECT id, username, email, first_name, last_name, phone, address, is_staff, coins, created_at FROM users WHERE id = %s",
        (result["lastrowid"],),
    )
    return {"success": True, "user": user}, None, 201


def login_user(data):
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    user = fetch_one("SELECT * FROM users WHERE LOWER(email) = LOWER(%s) AND is_active = TRUE", (email,))
    if not user or not check_password(password, user["password_hash"]):
        return None, "Correo o contrasena incorrectos.", 401
    return {"success": True, "user": public_user(user)}, None, 200


def forgot_password(data):
    identifier = (data.get("identifier") or data.get("email") or "").strip().lower()
    new_password = data.get("new_password") or data.get("password") or ""
    password_confirm = data.get("password_confirm") or new_password
    if new_password != password_confirm:
        return None, "Las contrasenas no coinciden.", 400
    ok, message = validate_password(new_password)
    if not ok:
        return None, message, 400
    user = fetch_one(
        "SELECT id FROM users WHERE LOWER(username) = LOWER(%s) OR LOWER(email) = LOWER(%s)",
        (identifier, identifier),
    )
    if not user:
        return None, "No existe un usuario con ese correo o nombre de usuario.", 404
    execute_query("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(new_password), user["id"]))
    return {"success": True, "message": "Contrasena actualizada."}, None, 200


def change_password(data):
    user_id = data.get("user_id")
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""
    password_confirm = data.get("password_confirm") or new_password
    user = fetch_one("SELECT * FROM users WHERE id = %s", (user_id,))
    if not user:
        return None, "Usuario no encontrado.", 404
    if not check_password(current_password, user["password_hash"]):
        return None, "La contrasena actual no es correcta.", 401
    if new_password != password_confirm:
        return None, "Las contrasenas no coinciden.", 400
    ok, message = validate_password(new_password)
    if not ok:
        return None, message, 400
    execute_query("UPDATE users SET password_hash = %s WHERE id = %s", (hash_password(new_password), user_id))
    return {"success": True, "message": "Contrasena actualizada."}, None, 200
