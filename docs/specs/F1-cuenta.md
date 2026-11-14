# F1 · Cuenta: registro, inicio de sesión y contraseña

## Historia
Como aficionado, quiero crear mi cuenta e iniciar sesión para comprar, pronosticar y tener mi avatar.

## Comportamiento
1. En `auth.html` el usuario elige **Registrarse** y escribe nombre, apellido, correo y contraseña dos veces.
2. El sistema valida los datos y crea la cuenta con **1.000 PitCoins** de bienvenida.
3. El usuario inicia sesión con correo y contraseña y la barra superior muestra su saldo.
4. Si olvida la contraseña, la cambia en `forgot_password.html`; con sesión iniciada, en `change_password.html`.

## Criterios de aceptación
- [ ] Si falta un campo obligatorio, aparece "Completa todos los campos obligatorios." y no se crea la cuenta.
- [ ] Un correo sin formato válido muestra "Correo electronico invalido.".
- [ ] Si las dos contraseñas no coinciden, aparece "Las contrasenas no coinciden.".
- [ ] Una contraseña de menos de 8 caracteres se rechaza.
- [ ] No se puede registrar dos veces el mismo correo.
- [ ] Una cuenta nueva empieza con 1.000 PitCoins.
- [ ] Con correo o contraseña incorrectos aparece "Correo o contrasena incorrectos." y no inicia sesión.
- [ ] Al cerrar sesión, la barra vuelve a mostrar "Iniciar sesión".

## Fuera de alcance
Inicio de sesión con Google, verificación por correo, recuperación por enlace al correo.

## Archivos relacionados
- Front: `frontend/auth.html`, `js/auth.js`, `forgot_password.html`, `change_password.html`
- API: `backend/auth.py` (`/api/auth/register`, `/login`, `/forgot-password`, `/change-password`)
