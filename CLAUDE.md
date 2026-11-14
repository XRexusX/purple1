# Proyecto: Purple 1

Tienda web de merch de Fórmula 1 con precios en la moneda del comprador, pronósticos con PitCoins (moneda virtual sin valor real) y un avatar personalizable en el perfil.

## Stack
- Front: HTML5 + CSS3 + JavaScript sin frameworks (`frontend/`). WebGL para la intro 3D, SVG para el avatar.
- Back: Python 3 con `http.server` (`backend/`), API REST en JSON en el puerto 8000.
- Datos: MySQL 8.4, base `purple1` (`database/schema.sql`, `database/seed.sql`).
- Despliegue: GitHub + Vercel (solo el front, con datos mock).

## Documentación (léela antes de cualquier cambio)
- Qué es el producto, el problema y qué NO entra: @docs/producto.md
- Funcionalidades y criterios de aceptación: docs/specs/
- Pantallas, colores y tono: @docs/diseno/identidad-visual.md
- Tecnología, capas y datos: @docs/arquitectura.md
- Por qué se decidió cada cosa: docs/decisiones.md
- Qué sigue: docs/tareas.md

## Reglas de trabajo
- Implementa UNA tarea de docs/tareas.md a la vez y márcala al terminar.
- No agregues funcionalidades que no estén en docs/specs/.
- Si el alcance cambia, propón primero el cambio en los docs.
- No toques archivos que la tarea no requiera.
- Nunca escribas contraseñas, llaves ni tokens en el código: van en `.env` (está en .gitignore).
- Si cambias una ruta o un campo de la API, actualiza también `frontend/js/mock-api.js` para que la demo de Vercel siga funcionando.
- Si cambias `database/seed.sql` o el catálogo del avatar, regenera los datos mock: `python tools/generar_mock.py`.
- Los pronósticos nunca usan dinero real: no agregues compra de PitCoins.
- Al terminar cada tarea, explica cómo probarla en el navegador.

## Convenciones
- Un HTML, un CSS y un JS por página (`frontend/products.html` → `css/products.css` → `js/products.js`).
- Colores y tipografías solo desde los tokens de `frontend/css/global.css`.
- Textos de la interfaz en español; se tutea al usuario.
- Un módulo de Python por dominio en `backend/`; SQL siempre con parámetros (`%s`), nunca concatenado.

## Cómo correrlo
- Completo (con MySQL): copiar `.env.example` como `.env`, poner la contraseña y ejecutar `python main.py` → http://127.0.0.1:8000
- Solo front (mock): abrir `frontend/index.html` con cualquier servidor estático, o la URL de Vercel.
