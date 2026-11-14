# F5 · Avatar del perfil

## Historia
Como aficionado, quiero personalizar un piloto propio en mi perfil para mostrar lo que he ganado acertando pronósticos.

## Comportamiento
1. En `profile.html` el usuario ve su avatar y las prendas por parte: piel, cabeza, cara, torso, piernas, accesorio y fondo.
2. Hay prendas gratis, prendas que se desbloquean con aciertos y prendas que se compran una sola vez con PitCoins.
3. Al tocar una prenda que tiene, el avatar la muestra de inmediato y queda guardada.

## Criterios de aceptación
- [ ] Una cuenta nueva ve su avatar con las prendas gratis puestas.
- [ ] Las prendas bloqueadas muestran cuántos aciertos o PitCoins faltan.
- [ ] Con 1 acierto se desbloquea el **Casco de piloto**.
- [ ] Comprar una prenda descuenta su precio en PitCoins una sola vez.
- [ ] Si no alcanzan los PitCoins, aparece cuántos faltan y no se compra.
- [ ] Al recargar la página, el avatar sigue con las prendas elegidas.

## Fuera de alcance
Subir fotos propias, animaciones del avatar, intercambiar prendas entre usuarios.

## Archivos relacionados
- Front: `frontend/profile.html`, `js/profile.js`, `js/avatar.js`
- API: `backend/avatar.py` (`/api/avatar`, `/api/avatar/buy`)
