# F3 · Carrito y pago simulado

## Historia
Como comprador, quiero guardar productos en un carrito y pagarlos de forma clara para completar mi compra con confianza.

## Comportamiento
1. Desde el detalle, el usuario elige talla y color y toca **Añadir al carrito**.
2. En `cart.html` ve sus productos, cambia cantidades o los quita, y ve el total.
3. Al finalizar escribe los datos de la tarjeta; el sistema los valida, crea el pedido y aprueba o rechaza el pago.

## Criterios de aceptación
- [ ] Sin sesión iniciada, el carrito pide iniciar sesión.
- [ ] Al añadir un producto, aparece en el carrito con su talla, color y precio.
- [ ] Cambiar la cantidad actualiza el subtotal y el total.
- [ ] No se puede pedir más unidades de las que hay en stock.
- [ ] Con el carrito vacío no se puede pagar.
- [ ] Una tarjeta vencida o un CVV de menos de 3 dígitos rechaza el pago con el motivo.
- [ ] Un pago aprobado muestra la marca (Visa, Mastercard…) y solo los últimos 4 dígitos.
- [ ] Después de pagar, el carrito queda vacío.

## Fuera de alcance
Pagos reales, pasarela de pago, envíos con transportadora. Ningún dato de la tarjeta se guarda.

## Archivos relacionados
- Front: `frontend/cart.html`, `js/cart.js`, `js/product_detail.js`
- API: `backend/cart.py`, `backend/orders.py`, `backend/payments_sim.py`
