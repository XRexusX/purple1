from decimal import Decimal

from database import execute_query, fetch_all, fetch_one
from utils import image_path


def get_or_create_cart(user_id):
    cart = fetch_one("SELECT id FROM carts WHERE user_id = %s AND status = 'ACTIVE' ORDER BY id DESC LIMIT 1", (user_id,))
    if cart:
        return cart["id"]
    result = execute_query("INSERT INTO carts (user_id, status) VALUES (%s, 'ACTIVE')", (user_id,))
    return result["lastrowid"]


def get_cart(user_id):
    cart_id = get_or_create_cart(user_id)
    items = fetch_all(
        """
        SELECT ci.id, ci.inventory_id, ci.quantity, p.id AS product_id, p.name AS product_name,
               COALESCE(pi.image_path, 'placeholder-product.png') AS image_path,
               s.name AS size_name, c.name AS color_name,
               COALESCE(i.price_override, p.base_price) AS unit_price,
               ci.quantity * COALESCE(i.price_override, p.base_price) AS subtotal,
               i.stock
        FROM cart_items ci
        JOIN inventory i ON i.id = ci.inventory_id
        JOIN products p ON p.id = i.product_id
        LEFT JOIN sizes s ON s.id = i.size_id
        LEFT JOIN colors c ON c.id = i.color_id
        LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_main = TRUE
        WHERE ci.cart_id = %s
        ORDER BY ci.created_at
        """,
        (cart_id,),
    )
    for item in items:
        item["image_path"] = image_path(item.get("image_path"))
    total = sum(Decimal(str(item["subtotal"])) for item in items)
    return {"cart_id": cart_id, "items": items, "total": total}


def add_to_cart(data):
    user_id = int(data.get("user_id") or 0)
    inventory_id = int(data.get("inventory_id") or 0)
    quantity = int(data.get("quantity") or 1)
    if not user_id or not inventory_id:
        return None, "user_id e inventory_id son obligatorios.", 400
    inv = fetch_one("SELECT stock FROM inventory WHERE id = %s AND is_active = TRUE", (inventory_id,))
    if not inv:
        return None, "Inventario no encontrado.", 404
    if inv["stock"] < quantity:
        return None, "Stock insuficiente.", 400
    cart_id = get_or_create_cart(user_id)
    item = fetch_one("SELECT id, quantity FROM cart_items WHERE cart_id = %s AND inventory_id = %s", (cart_id, inventory_id))
    if item:
        new_quantity = item["quantity"] + quantity
        if inv["stock"] < new_quantity:
            return None, "Stock insuficiente.", 400
        execute_query("UPDATE cart_items SET quantity = %s WHERE id = %s", (new_quantity, item["id"]))
    else:
        execute_query("INSERT INTO cart_items (cart_id, inventory_id, quantity) VALUES (%s, %s, %s)", (cart_id, inventory_id, quantity))
    return {"success": True, "cart": get_cart(user_id)}, None, 200


def update_cart_item(data):
    user_id = int(data.get("user_id") or 0)
    cart_item_id = int(data.get("cart_item_id") or data.get("item_id") or 0)
    quantity = int(data.get("quantity") or 1)
    cart_id = get_or_create_cart(user_id)
    if quantity < 1:
        execute_query("DELETE FROM cart_items WHERE id = %s AND cart_id = %s", (cart_item_id, cart_id))
    else:
        item = fetch_one(
            """
            SELECT ci.id, i.stock FROM cart_items ci
            JOIN inventory i ON i.id = ci.inventory_id
            WHERE ci.id = %s AND ci.cart_id = %s
            """,
            (cart_item_id, cart_id),
        )
        if not item:
            return None, "Item no encontrado.", 404
        if item["stock"] < quantity:
            return None, "Stock insuficiente.", 400
        execute_query("UPDATE cart_items SET quantity = %s WHERE id = %s AND cart_id = %s", (quantity, cart_item_id, cart_id))
    return {"success": True, "cart": get_cart(user_id)}, None, 200


def remove_cart_item(user_id, cart_item_id):
    cart_id = get_or_create_cart(user_id)
    execute_query("DELETE FROM cart_items WHERE id = %s AND cart_id = %s", (cart_item_id, cart_id))
    return {"success": True, "cart": get_cart(user_id)}
