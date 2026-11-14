# Arquitectura · Purple 1

> Los planos: con qué se construye y cómo se conectan las piezas.

## Visión general

```
Navegador (HTML + CSS + JS)  ⇄  Servidor Python (http.server)  ⇄  MySQL 8.4
        frontend/                   backend/  · puerto 8000         base purple1 · puerto 3306
```

Cliente-servidor en tres capas: cada capa habla solo con la de al lado. El navegador pide datos en JSON a `/api/...`; el servidor aplica las reglas de negocio y consulta MySQL con SQL parametrizado.

## Dos formas de correr el proyecto

| Modo | Dónde | Datos | Para qué |
|---|---|---|---|
| **Completo** | Local: `python main.py` → http://127.0.0.1:8000 | MySQL real | Desarrollo y demostración completa |
| **Demo (mock)** | Vercel (URL pública) | `frontend/js/mock-data.js` + `localStorage` | Que cualquiera pruebe el front sin instalar nada |

En Vercel no hay servidor Python ni MySQL. Por eso `frontend/js/mock-api.js` intercepta las llamadas a `/api/...` y las responde en el navegador **con la misma forma** que la API real (mismas rutas, mismos campos, mismos mensajes de error). Los datos de prueba se generan desde `database/seed.sql` con `python tools/generar_mock.py`, así que la demo muestra los mismos productos que la base real.

- Se usa la API real solo en `127.0.0.1:8000`. En cualquier otro lugar se usa el mock.
- Se puede forzar con `?mock=1` (siempre mock) o `?mock=0` (siempre API real).
- La demo muestra una etiqueta "Demo · datos de prueba" con un botón **Reiniciar**.

## Front

- HTML5, CSS3 y JavaScript sin frameworks. 10 páginas en `frontend/`.
- Un archivo CSS y uno JS por página; tokens de diseño en `frontend/css/global.css`.
- WebGL directo para el carro 3D de la intro (`js/intro.js`) y SVG para el avatar (`js/avatar.js`).
- `fetch` para hablar con la API; sesión del usuario en `localStorage` (`purple1_user`).
- Íconos: Font Awesome 6.5 (CDN). Tipografías: Google Fonts.

## Back

- Python 3 con `http.server` (librería estándar). Rutas en `backend/server.py`.
- Un módulo por dominio: `auth`, `users`, `products`, `categories`, `cart`, `orders`, `payments_sim`, `bets`, `avatar`.
- Contraseñas con PBKDF2-SHA256 (600.000 iteraciones y sal).
- Única dependencia externa: `mysql-connector-python`.

## Datos

Entidades principales:

- **Usuario** 1 — N **Pedido** · 1 — 1 **Carrito** · 1 — N **Pronóstico** · 1 — 1 **Avatar**
- **Producto** N — N **Categoría** · N — N **Escudería** · 1 — N **Inventario** (talla, color, stock)
- **Carrito** 1 — N **ItemCarrito** · **Pedido** 1 — N **ItemPedido** · **Pedido** 1 — 0..1 **Pago**
- **Carrera** 1 — N **OpciónCarrera** (piloto) · **Pronóstico** N — 1 **OpciónCarrera**

Reglas que protegen los PitCoins:

- Al pronosticar, el saldo del usuario se bloquea (`SELECT … FOR UPDATE`) y todo va en una transacción.
- Pronóstico mínimo: 10 PitCoins. Cada usuario empieza con 1.000.
- Cuotas parimutuel: el bote se reparte entre quienes acertaron, en proporción a lo que pusieron. Si nadie acierta, se devuelve todo.
- Estados de la carrera: `SCHEDULED → OPEN → LOCKED → FINISHED` (o `CANCELLED`). Solo el staff la cierra.

Esquema completo en `database/schema.sql`; datos iniciales en `database/seed.sql`.

## Despliegue

- **Código:** GitHub.
- **Front:** Vercel publica la carpeta `frontend/` (ver `vercel.json`). Cada `git push` a `main` publica una versión nueva.
- **Back y base de datos:** por ahora locales. Publicarlos es un paso siguiente (ver `tareas.md`).

## Comparación con la arquitectura de referencia del diplomado

| Capa | Referencia del diplomado | Purple 1 | Equivalencia |
|---|---|---|---|
| Front | Next.js + TypeScript + Tailwind | HTML, CSS y JS sin frameworks | Misma responsabilidad, sin framework |
| Back | Spring Boot (Java), API REST | Python `http.server`, API REST en JSON | Misma responsabilidad, otro lenguaje |
| Datos | MySQL | MySQL 8.4 | **Igual** |
| Acceso a datos | JPA / Hibernate | SQL parametrizado con `mysql-connector-python` | Equivalente, escrito a mano |
| Seguridad | Spring Security | Hash PBKDF2 + validación de staff en el servidor | Equivalente en función |
| Despliegue front | Vercel | Vercel | **Igual** |
| Nube back | AWS (U6) | Pendiente | — |

**Por qué no Next.js:** el proyecto empezó en la materia de Requerimientos de Software antes del módulo de IA, construido desde cero para entender cada capa. Migrarlo ahora pondría en riesgo lo que ya funciona; se documenta como mejora futura en `decisiones.md`.
