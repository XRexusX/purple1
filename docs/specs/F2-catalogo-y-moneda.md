# F2 · Catálogo con filtros y precios en tu moneda

## Historia
Como comprador latinoamericano, quiero ver los productos con su precio en mi moneda para decidir sin hacer conversiones.

## Comportamiento
1. En `products.html` se ven las tarjetas de producto con foto, nombre y precio.
2. El usuario busca por texto o filtra por categoría, escudería, talla, color y rango de precio, y puede ordenar.
3. En la barra superior elige su moneda entre 9 (COP, USD, EUR, MXN, ARS, CLP, PEN, BRL, GBP).
4. Al abrir un producto ve fotos, descripción, tallas, colores y unidades disponibles.

## Criterios de aceptación
- [ ] El catálogo muestra los 12 productos de los datos iniciales.
- [ ] Filtrar por la escudería Ferrari deja solo productos de Ferrari.
- [ ] Ordenar "Precio menor a mayor" pone primero el producto más barato.
- [ ] Al cambiar la moneda, todos los precios cambian **sin recargar la página**.
- [ ] La moneda elegida se mantiene al pasar a otra página.
- [ ] En el detalle solo se pueden elegir combinaciones de talla y color que existen.
- [ ] Una búsqueda sin resultados muestra un mensaje, no una página en blanco.

## Fuera de alcance
Tasas de cambio en vivo (son fijas), reseñas de productos, lista de deseos.

## Archivos relacionados
- Front: `frontend/products.html`, `js/products.js`, `product_detail.html`, `js/product_detail.js`, `js/currency.js`
- API: `backend/products.py`, `backend/categories.py`
