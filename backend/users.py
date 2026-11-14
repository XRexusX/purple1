from database import execute_query, fetch_all, fetch_one


def get_user(user_id):
    return fetch_one(
        "SELECT id, username, email, first_name, last_name, phone, address, is_staff, coins, created_at FROM users WHERE id = %s",
        (user_id,),
    )


def update_user(user_id, data):
    user = fetch_one("SELECT * FROM users WHERE id = %s", (user_id,))
    if not user:
        return None
    first_name = (data.get("first_name") or user["first_name"] or "").strip()
    last_name = (data.get("last_name") or user["last_name"] or "").strip()
    phone = (data.get("phone") or "").strip()
    address = (data.get("address") or "").strip()
    execute_query(
        "UPDATE users SET first_name = %s, last_name = %s, phone = %s, address = %s WHERE id = %s",
        (first_name, last_name, phone, address, user_id),
    )
    return get_user(user_id)


def list_users():
    return fetch_all(
        "SELECT id, username, email, first_name, last_name, phone, address, is_staff, is_active, coins, created_at FROM users ORDER BY created_at DESC"
    )


def delete_user(user_id):
    user = fetch_one("SELECT id FROM users WHERE id = %s", (user_id,))
    if not user:
        return False
    execute_query("UPDATE users SET is_active = FALSE WHERE id = %s", (user_id,))
    return True
