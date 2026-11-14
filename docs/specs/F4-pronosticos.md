# F4 · Pronósticos con PitCoins y ranking

## Historia
Como aficionado, quiero pronosticar quién gana cada Gran Premio con PitCoins para competir con otros y tener una razón para volver cada carrera.

## Comportamiento
1. En `races.html` el usuario ve las carreras, sus pilotos, el bote y las cuotas.
2. Elige un piloto, escribe cuántos PitCoins pone y confirma. Puede cambiar su pronóstico mientras la carrera esté abierta.
3. El staff cierra la carrera eligiendo al ganador. Los PitCoins se reparten entre quienes acertaron.
4. La tabla de posiciones ordena a los usuarios por PitCoins.

## Criterios de aceptación
- [ ] Un pronóstico de menos de 10 PitCoins se rechaza.
- [ ] No se puede poner más PitCoins de los que se tienen.
- [ ] Al pronosticar, el saldo de la barra baja en la cantidad puesta.
- [ ] Las cuotas cambian cuando otros usuarios pronostican.
- [ ] Solo una cuenta de staff ve el botón **Cerrar carrera**.
- [ ] Si nadie acierta, cada participante recupera sus PitCoins.
- [ ] Quien acierta recibe su parte del bote y su contador de aciertos sube.
- [ ] En ningún lugar se puede comprar PitCoins con dinero.

## Fuera de alcance
Dinero real, resultados automáticos desde una API de F1, pronósticos de posiciones distintas al ganador.

## Archivos relacionados
- Front: `frontend/races.html`, `js/races.js`
- API: `backend/bets.py` (`/api/races`, `/api/races/{id}/bet`, `/result`, `/leaderboard`)
