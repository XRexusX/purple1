# Decisiones

> La bitácora de por qué se hizo cada cosa. Una fila por decisión.

| Cuándo | Decisión | Por qué |
|---|---|---|
| Inicio del proyecto | Tienda de merch de F1 con precios en la moneda del comprador | Es el problema principal: los precios en USD/EUR frenan la compra |
| Inicio del proyecto | Pronósticos con PitCoins, sin dinero real | Dan una razón para volver cada carrera sin ser apuestas (Ley 643 de 2001) |
| Inicio del proyecto | Pago simulado que no guarda la tarjeta | Un prototipo no debe manejar datos bancarios reales |
| Inicio del proyecto | Python + MySQL sin frameworks | Entender cada capa construyéndola; una sola dependencia externa |
| Inicio del proyecto | Tasas de cambio fijas | Evita depender de una API externa con llave |
| Durante el desarrollo | Quitar el minijuego 2D y poner un avatar en el perfil | El avatar conecta mejor con los pronósticos y la tienda: la ropa se gana acertando o se compra |
| Durante el desarrollo | Intro con carro 3D al hacer scroll (WebGL directo) | Primera impresión de marca sin cargar librerías 3D |
| Durante el desarrollo | Efecto del cursor: solo halo morado, sin destellos | Los destellos distraían; el halo mantiene la identidad sin ruido |
| Durante el desarrollo | Cuotas parimutuel calculadas en vivo | Nadie fija cuotas a mano: salen de cómo pronostica la gente |
| Módulo de IA (U3) | Publicar el front en Vercel con datos mock | Vercel no corre Python ni MySQL; el mock deja probar todo el recorrido desde una URL |
| Módulo de IA (U3) | El mock responde con la misma forma que la API real | El front no cambia entre la demo y la versión completa |
| Módulo de IA (U3) | Contraseña de MySQL fuera del código, en `.env` | El repositorio es público; las llaves nunca van en el código |
| Módulo de IA (U3) | No migrar a Next.js por ahora | El sistema ya funciona y se sustenta así; migrar es una mejora futura |
