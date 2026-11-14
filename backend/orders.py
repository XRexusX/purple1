from decimal import Decimal

from cart import get_or_create_cart
from database import execute_query, fetch_all, fetch_one


def create_order(data):
    user_id = int(data.get("user_id") or 0)
    shipping_address = (data.get("shipping_address") or "").strip()
    if not user_id:
        return None, "user_id es obligatorio.", 400
    cart_id = get_or_create_cart(user_id)
    items = fetch_all(
        """
        SELECT ci.inventory_id, ci.quantity, p.name AS product_name, s.name AS size_name,
               c.name AS color_name, COALESCE(i.price_override, p.base_price) AS unit_price, i.stock
        FROM cart_items ci
        JOIN inventory i ON i.id = ci.inventory_id
        JOIN products p ON p.id = i.product_id
        LEFT JOIN sizes s ON s.id = i.size_id
        LEFT JOIN colors c ON c.id = i.color_id
        WHERE ci.cart_id = %s
        """,
        (cart_id,),
    )
    if not items:
        return None, "El carrito esta vacio.", 400
    for item in items:
        if item["stock"] < item["quantity"]:
            return None, f"Stock insuficiente para {item['product_name']}.", 400

    subtotal = sum(Decimal(str(item["unit_price"])) * item["quantity"] for item in items)
    result = execute_query(
        """INSERT INTO orders (user_id, status, subtotal, discount, shipping_cost, total, shipping_address)
           VALUES (%s, 'PENDING', %s, 0, 0, %s, %s)""",
        (user_id, subtotal, subtotal, shipping_address),
    )
    order_id = result["lastrowid"]
    for item in items:
        line_total = Decimal(str(item["unit_price"])) * item["quantity"]
        execute_query(
            """INSERT INTO order_items (order_id, inventory_id, product_name, size_name, color_name, unit_price, quantity, subtotal)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s)""",
            (order_id, item["inventory_id"], item["product_name"], item["size_name"], item["color_name"], item["unit_price"], item["quantity"], line_total),
        )
        execute_query("UPDATE inventory SET stock = stock - %s WHERE id = %s", (item["quantity"], item["inventory_id"]))
    execute_query("UPDATE carts SET status = 'CLOSED' WHERE id = %s", (cart_id,))
    order = fetch_one("SELECT * FROM orders WHERE id = %s", (order_id,))
    return {"success": True, "order": order}, None, 201
