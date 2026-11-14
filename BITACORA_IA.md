# Bitácora de IA · Purple 1

> Prompts clave, errores del agente y cómo los corregimos.
> Agente usado: Claude. Regla: si no podemos explicar el código generado, no lo aceptamos.

## Prompts clave

| Para qué | Prompt (resumen) | Resultado |
|---|---|---|
| Avatar en el perfil | "Quita los juegos 2D y pon un avatar en el perfil cuya ropa se desbloquee al acertar pronósticos y algunas prendas se compren" | `backend/avatar.py` (catálogo de prendas) y `js/avatar.js` (avatar en SVG) |
| Intro 3D | "Al abrir la página, haz un scroll donde un carro se mueva en 3D y luego se abra la tienda" | `js/intro.js` con WebGL directo, sin librerías 3D |
| Efecto del cursor | "Que el cursor muestre solo lo morado, sin destellos de estrellas" | `js/fx.js` quedó solo con el halo morado |
| Cierre de carreras | "¿Cómo sé si gané un pronóstico?" | Se explicó que el staff cierra la carrera desde el panel; se documentaron los comandos SQL de apoyo |
| Diseño en Figma | "Haz la interfaz para Figma y que sea funcional" | 6 pantallas en SVG con las conexiones entre ellas |
| Documentación SDD | "Organiza la documentación de problema y solución para el diplomado" | `docs/` con producto, arquitectura, identidad, specs, decisiones y tareas |
| Publicar en Vercel | "Necesito el front desplegado en Vercel" | Modo mock (`js/mock-api.js`) que responde como la API real |

## Errores del agente y del proceso, y cómo se corrigieron

| Qué pasó | Causa | Corrección |
|---|---|---|
| La contraseña real de MySQL estaba escrita en `backend/database.py` | Se configuró rápido para que funcionara en local | Se movió a `.env` (en `.gitignore`) con `.env.example` de guía, antes de subir a GitHub |
| A la compañera le salía "Access denied" en MySQL | Usaba la contraseña de otra instalación | Cada quien pone la contraseña de su propio MySQL |
| La terminal no encontraba `main.py` | El zip venía con carpetas anidadas | Entrar con `cd` a la carpeta interna antes de `python main.py` |
| Un `UPDATE` en Workbench cambió el registro equivocado | Se usó un `id` incorrecto | Consultar primero con `SELECT` y luego actualizar por `id` |
| El resultado del pronóstico "no aparecía" | La carrera no se había cerrado | El staff debe cerrar la carrera eligiendo al ganador |
| Vercel no puede correr el servidor Python ni MySQL | Vercel publica el front; la base de datos es local | Datos mock en el navegador con la misma forma que la API real |
| Instalar una librería de íconos por npm falló | Restricción de red del entorno del agente | Se dibujaron los íconos a mano en SVG; no se insistió con otros comandos |

## Qué aprendimos

- Con documentos claros (producto, specs, identidad) el agente inventa menos.
- Pedir una tarea pequeña a la vez y revisar el cambio antes de aceptarlo.
- Las llaves nunca van en el código, aunque el proyecto sea académico.
