---
name: ui-componentes
description: Crear o modificar páginas y componentes de la interfaz de Purple 1 respetando su identidad visual. Úsala cada vez que la tarea toque HTML o CSS del front.
---

# Cómo construimos UI en Purple 1

1. Lee `docs/diseno/identidad-visual.md` antes de escribir estilos.
2. Usa solo los tokens de `frontend/css/global.css` (`var(--color-brand)`, `var(--color-text)`, `var(--font-site)`…). No escribas colores HEX sueltos.
3. Cada página tiene su HTML, su CSS en `frontend/css/` y su JS en `frontend/js/`, con el mismo nombre.
4. Cada página nueva incluye, en este orden, dentro de `<head>`:
   - `js/mock-data.js` y `js/mock-api.js` (para que funcione en Vercel)
   - `css/global.css`, Font Awesome y su propio CSS
   - `css/fx.css` y, al final del `<body>`, `js/navbar.js` y `js/fx.js`
5. Diseña primero para 390 px de ancho y luego amplía con `@media (min-width: …)`.
6. Accesibilidad mínima:
   - Contraste AA (4,5:1) en texto normal.
   - Botones con texto claro y área táctil de al menos 44 px.
   - Imágenes con `alt`; campos de formulario con `label`.
   - Respeta `prefers-reduced-motion`.
7. Estados: muestra siempre cargando, vacío y error (usa la clase `empty-products surface-card`).
8. Tono: tutea, frases cortas, y los errores dicen qué corregir. Nunca "apostar": se dice "pronosticar".
9. Al terminar, lista los archivos creados o cambiados y cómo verlos en el navegador.
