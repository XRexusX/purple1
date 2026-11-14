/* Efectos del cursor de Purple1.
 *
 * 1. Halo: una luz morada que sigue al mouse con un pequeno retraso.
 * 2. Tarjetas: un brillo morado que sigue al cursor dentro de cada tarjeta.
 *
 * Para cambiar el tono del halo, edita HUE (268 = morado de la marca).
 */
(function () {
    "use strict";

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const HUE = 268;

    function start() {
        document.documentElement.classList.add("fx-ready");

        const halo = document.createElement("div");
        halo.className = "fx-halo";
        halo.style.setProperty("--fx-hue", String(HUE));
        document.body.append(halo);

        const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        const haloPos = { x: mouse.x, y: mouse.y };
        let running = false;

        // El halo se acerca un 14% de la distancia que le falta en cada cuadro.
        function frame() {
            haloPos.x += (mouse.x - haloPos.x) * 0.14;
            haloPos.y += (mouse.y - haloPos.y) * 0.14;
            halo.style.transform = `translate3d(${haloPos.x}px, ${haloPos.y}px, 0)`;

            const settled = Math.abs(mouse.x - haloPos.x) < 0.5 && Math.abs(mouse.y - haloPos.y) < 0.5;
            if (settled) {
                running = false;
            } else {
                requestAnimationFrame(frame);
            }
        }

        window.addEventListener("pointermove", (event) => {
            if (event.pointerType && event.pointerType !== "mouse") return;
            mouse.x = event.clientX;
            mouse.y = event.clientY;
            halo.classList.add("is-on");

            // Brillo dentro de la tarjeta que este bajo el cursor.
            const card = event.target.closest && event.target.closest(".product-card, .team-card, .category-card, .race-card");
            if (card) {
                const box = card.getBoundingClientRect();
                card.style.setProperty("--fx-x", `${mouse.x - box.left}px`);
                card.style.setProperty("--fx-y", `${mouse.y - box.top}px`);
            }

            if (!running) {
                running = true;
                requestAnimationFrame(frame);
            }
        }, { passive: true });

        document.addEventListener("mouseleave", () => halo.classList.remove("is-on"));
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
