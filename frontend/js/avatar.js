/* Dibuja el avatar de Purple1 como SVG por capas.
 *
 * Uso:  PurpleAvatar.render({ skin, head, face, torso, legs, extra, bg }, { crop })
 * Cada parte es el objeto "style" que envia el backend (ver backend/avatar.py).
 * No guarda nada: solo convierte una combinacion de prendas en un dibujo.
 */
(function () {
    "use strict";

    const INK = "#1b1733";
    const HAIR = "#2a1f3d";

    // Recortes del lienzo (viewBox) para las miniaturas de cada tipo de prenda.
    const CROPS = {
        full: "0 0 200 260",
        skin: "42 6 116 96",
        head: "42 2 116 100",
        face: "52 22 96 70",
        torso: "26 70 148 108",
        legs: "44 148 112 96",
        extra: "56 58 124 118",
        bg: "0 0 200 260",
    };

    function clamp(n) {
        return Math.max(0, Math.min(255, Math.round(n)));
    }

    // Aclara (amount > 0) u oscurece (amount < 0) un color #rrggbb.
    function shade(hex, amount) {
        const value = String(hex || "#888888").replace("#", "");
        const full = value.length === 3 ? value.split("").map((c) => c + c).join("") : value;
        const num = parseInt(full, 16);
        const target = amount < 0 ? 0 : 255;
        const t = Math.abs(amount);
        const r = (num >> 16) & 255;
        const g = (num >> 8) & 255;
        const b = num & 255;
        const mix = (c) => clamp(c + (target - c) * t).toString(16).padStart(2, "0");
        return `#${mix(r)}${mix(g)}${mix(b)}`;
    }

    function rect(x, y, w, h, r, fill, extra) {
        return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${extra ? " " + extra : ""}/>`;
    }

    /* ---------- Fondo ---------- */
    function drawBackground(bg) {
        const color = bg.color || "#e9dcff";
        if (bg.kind === "night") {
            let lights = "";
            const dots = [[24, 40, 7], [58, 22, 4], [92, 46, 5], [140, 26, 6], [176, 52, 8], [38, 84, 4], [164, 96, 5], [118, 70, 3], [16, 122, 5], [186, 140, 4]];
            dots.forEach(([x, y, r], i) => {
                const tone = ["#ff5fd2", "#b48cff", "#ffd166", "#7bd8ff"][i % 4];
                lights += `<circle cx="${x}" cy="${y}" r="${r}" fill="${tone}" opacity="0.55"/>`;
            });
            return rect(0, 0, 200, 260, 0, color)
                + rect(0, 150, 200, 110, 0, "#24104f")
                + lights
                + rect(0, 222, 200, 38, 0, "#0d0720")
                + rect(0, 222, 200, 3, 0, "#7b2cff");
        }
        if (bg.kind === "podium") {
            let rays = "";
            for (let i = 0; i < 12; i += 1) {
                const a1 = (i / 12) * Math.PI * 2;
                const a2 = a1 + Math.PI / 12;
                const p = (a) => `${100 + Math.cos(a) * 260},${116 + Math.sin(a) * 260}`;
                rays += `<path d="M100 116 L${p(a1)} L${p(a2)} Z" fill="#ffffff" opacity="0.28"/>`;
            }
            return rect(0, 0, 200, 260, 0, color)
                + rays
                + rect(34, 232, 132, 28, 4, "#ffffff")
                + rect(34, 232, 132, 5, 2, shade(color, -0.25))
                + `<text x="100" y="255" text-anchor="middle" font-family="'Bebas Neue', Impact, sans-serif" font-size="20" fill="${shade(color, -0.35)}">1</text>`;
        }
        if (bg.kind === "grid") {
            let marks = "";
            for (let i = 0; i < 5; i += 1) {
                const y = 40 + i * 48;
                marks += rect(18, y, 44, 4, 2, "#ffffff", 'opacity="0.55"') + rect(138, y + 24, 44, 4, 2, "#ffffff", 'opacity="0.55"');
            }
            return rect(0, 0, 200, 260, 0, color)
                + rect(98, 0, 4, 260, 0, "#ffffff", 'opacity="0.18"')
                + marks;
        }
        return rect(0, 0, 200, 260, 0, color)
            + `<circle cx="100" cy="118" r="88" fill="#ffffff" opacity="0.45"/>`;
    }

    /* ---------- Piernas ---------- */
    function drawLegs(legs, skin) {
        const color = legs.color || "#3c4f8c";
        const dark = shade(color, -0.22);
        let out = "";
        if (legs.kind === "shorts") {
            out += rect(70, 160, 28, 62, 6, skin) + rect(102, 160, 28, 62, 6, skin);
            out += rect(68, 158, 31, 34, 6, color) + rect(101, 158, 31, 34, 6, color);
            out += rect(68, 186, 31, 6, 3, dark) + rect(101, 186, 31, 6, 3, dark);
        } else {
            out += rect(70, 160, 28, 64, 6, color) + rect(102, 160, 28, 64, 6, color);
            out += rect(96, 160, 8, 30, 3, dark);
            if (legs.kind === "suit") {
                const accent = legs.accent || "#ffffff";
                out += rect(70, 164, 6, 56, 3, accent) + rect(124, 164, 6, 56, 3, accent);
                out += rect(70, 196, 28, 5, 2, dark) + rect(102, 196, 28, 5, 2, dark);
            }
        }
        // Zapatos: botas de carrera con el traje, tenis con todo lo demas.
        const shoe = legs.kind === "suit" ? INK : "#ffffff";
        const sole = legs.kind === "suit" ? (legs.accent || "#7b2cff") : "#c9c2dd";
        out += rect(64, 216, 36, 16, 7, shoe) + rect(100, 216, 36, 16, 7, shoe);
        out += rect(64, 227, 36, 5, 2.5, sole) + rect(100, 227, 36, 5, 2.5, sole);
        return out;
    }

    /* ---------- Torso y brazos ---------- */
    function drawTorso(torso, skin) {
        const color = torso.color || "#7b2cff";
        const accent = torso.accent || "#ffffff";
        const dark = shade(color, -0.2);
        const kind = torso.kind || "tee";
        const longSleeves = kind === "hoodie" || kind === "suit";
        let out = "";

        // Brazos
        out += rect(40, 94, 23, 68, 9, skin) + rect(137, 94, 23, 68, 9, skin);
        if (longSleeves) {
            out += rect(40, 94, 23, 56, 9, color) + rect(137, 94, 23, 56, 9, color);
            out += rect(40, 142, 23, 8, 3, dark) + rect(137, 142, 23, 8, 3, dark);
            if (kind === "suit") {
                out += rect(40, 104, 23, 6, 0, accent) + rect(137, 104, 23, 6, 0, accent);
                // Guantes
                out += rect(40, 148, 23, 14, 7, INK) + rect(137, 148, 23, 14, 7, INK);
            }
        } else {
            out += rect(40, 94, 23, 30, 9, color) + rect(137, 94, 23, 30, 9, color);
            out += rect(40, 118, 23, 6, 3, dark) + rect(137, 118, 23, 6, 3, dark);
        }

        // Cuello
        out += rect(89, 80, 22, 18, 5, shade(skin, -0.08));

        // Tronco
        if (kind === "hoodie") {
            out += rect(72, 78, 56, 24, 12, dark);
        }
        out += rect(63, 92, 74, 76, 9, color);

        if (kind === "tee") {
            out += `<path d="M88 92 Q100 104 112 92 Z" fill="${shade(skin, -0.08)}"/>`;
            out += `<path d="M88 92 Q100 104 112 92" fill="none" stroke="${dark}" stroke-width="3" stroke-linecap="round"/>`;
            if (torso.print) {
                out += `<text x="100" y="140" text-anchor="middle" font-family="'Bebas Neue', Impact, sans-serif" font-size="30" letter-spacing="1" fill="${accent}">${torso.print}</text>`;
            }
        } else if (kind === "polo") {
            out += `<path d="M100 104 L84 92 L88 88 L100 96 L112 88 L116 92 Z" fill="${accent}"/>`;
            out += rect(98, 100, 4, 22, 2, accent);
            out += rect(63, 128, 74, 9, 0, accent);
            out += rect(63, 137, 74, 3, 0, dark);
            out += `<circle cx="100" cy="110" r="1.6" fill="${dark}"/><circle cx="100" cy="117" r="1.6" fill="${dark}"/>`;
        } else if (kind === "hoodie") {
            out += `<path d="M84 92 Q100 112 116 92 Z" fill="${shade(skin, -0.08)}"/>`;
            out += `<path d="M82 92 Q100 114 118 92" fill="none" stroke="${dark}" stroke-width="5" stroke-linecap="round"/>`;
            out += rect(92, 104, 3, 20, 1.5, accent) + rect(105, 104, 3, 20, 1.5, accent);
            out += rect(80, 136, 40, 24, 8, dark);
        } else if (kind === "suit") {
            out += rect(84, 88, 32, 9, 4.5, accent);
            out += rect(63, 100, 12, 62, 0, accent) + rect(125, 100, 12, 62, 0, accent);
            out += rect(104, 108, 16, 9, 2, accent);
            out += rect(80, 108, 14, 4, 2, accent) + rect(80, 116, 10, 4, 2, accent);
            out += rect(63, 156, 74, 9, 0, INK);
            out += rect(95, 155, 10, 11, 2, shade(accent, -0.1));
        }
        return out;
    }

    /* ---------- Cabeza, cara y lo que va encima ---------- */
    function drawFace() {
        return `<ellipse cx="85" cy="57" rx="4.6" ry="5.6" fill="${INK}"/>`
            + `<ellipse cx="115" cy="57" rx="4.6" ry="5.6" fill="${INK}"/>`
            + `<circle cx="86.6" cy="55" r="1.5" fill="#ffffff"/><circle cx="116.6" cy="55" r="1.5" fill="#ffffff"/>`
            + `<path d="M87 71 Q100 81 113 71" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
    }

    function drawFaceItem(face) {
        if (face.kind === "sunglasses") {
            const c = face.color || INK;
            return rect(70, 48, 26, 17, 7, c) + rect(104, 48, 26, 17, 7, c)
                + rect(94, 53, 12, 4, 2, c)
                + rect(62, 52, 10, 3, 1.5, c) + rect(128, 52, 10, 3, 1.5, c)
                + rect(74, 51, 9, 3, 1.5, "#ffffff", 'opacity="0.35"') + rect(108, 51, 9, 3, 1.5, "#ffffff", 'opacity="0.35"');
        }
        if (face.kind === "visor") {
            const c = face.color || "#7b2cff";
            const a = face.accent || "#ff5fd2";
            return rect(62, 46, 76, 20, 9, c, 'opacity="0.9"')
                + rect(100, 46, 38, 20, 9, a, 'opacity="0.55"')
                + rect(68, 49, 30, 3, 1.5, "#ffffff", 'opacity="0.6"');
        }
        return "";
    }

    function drawHair() {
        return `<path d="M60 52 V38 Q60 16 82 16 H118 Q140 16 140 38 V52 Q134 36 118 34 H82 Q66 36 60 52 Z" fill="${HAIR}"/>`;
    }

    function drawHead(head, face, skin) {
        const kind = head.kind || "none";
        const color = head.color || "#7b2cff";
        const accent = head.accent || "#ffffff";
        const dark = shade(color, -0.22);
        let out = "";

        if (kind === "helmet") {
            // El casco cubre toda la cabeza: no se dibujan pelo ni accesorios de cara.
            out += rect(52, 10, 96, 84, 32, color);
            out += rect(92, 10, 16, 30, 4, accent);
            out += rect(52, 70, 96, 8, 0, dark);
            out += rect(62, 40, 76, 28, 12, INK);
            out += rect(68, 44, 36, 4, 2, "#ffffff", 'opacity="0.45"');
            out += rect(88, 82, 24, 4, 2, dark);
            return out;
        }

        out += rect(62, 22, 76, 66, 18, skin);
        out += drawFace();
        out += drawFaceItem(face);

        if (kind === "cap") {
            out += rect(58, 44, 6, 12, 3, HAIR) + rect(136, 44, 6, 12, 3, HAIR);
            out += `<path d="M58 44 V36 Q58 12 84 12 H116 Q142 12 142 36 V44 Z" fill="${color}"/>`;
            out += rect(54, 40, 92, 10, 5, dark);
            out += `<circle cx="100" cy="27" r="8" fill="${accent}"/>`;
            out += `<circle cx="100" cy="12.5" r="3.5" fill="${dark}"/>`;
        } else {
            out += drawHair();
            if (kind === "headset") {
                out += `<path d="M58 54 V40 Q58 10 100 10 Q142 10 142 40 V54" fill="none" stroke="${color}" stroke-width="7" stroke-linecap="round"/>`;
                out += rect(50, 46, 15, 28, 6, color) + rect(135, 46, 15, 28, 6, color);
                out += rect(53, 52, 5, 16, 2.5, accent) + rect(142, 52, 5, 16, 2.5, accent);
                out += `<path d="M58 72 Q62 86 82 80" fill="none" stroke="${color}" stroke-width="3.5" stroke-linecap="round"/>`;
                out += rect(80, 75, 11, 8, 4, accent);
            }
        }
        return out;
    }

    /* ---------- Accesorio (cuello o mano) ---------- */
    function drawExtra(extra) {
        const gold = extra.color || "#f5b942";
        if (extra.kind === "medal") {
            return `<path d="M88 96 L100 124 L112 96" fill="none" stroke="#e02440" stroke-width="5" stroke-linejoin="round"/>`
                + `<circle cx="100" cy="130" r="10" fill="${gold}"/>`
                + `<circle cx="100" cy="130" r="6" fill="${shade(gold, 0.35)}"/>`;
        }
        if (extra.kind === "trophy") {
            const edge = shade(gold, -0.3);
            return `<path d="M134 96 H164 V108 Q164 126 149 128 Q134 126 134 108 Z" fill="${gold}" stroke="${edge}" stroke-width="1.5"/>`
                + `<path d="M134 100 Q124 100 126 110 Q128 118 137 117" fill="none" stroke="${gold}" stroke-width="4"/>`
                + `<path d="M164 100 Q174 100 172 110 Q170 118 161 117" fill="none" stroke="${gold}" stroke-width="4"/>`
                + rect(145, 127, 8, 14, 2, shade(gold, -0.15))
                + rect(137, 140, 24, 8, 3, shade(gold, -0.3))
                + rect(139, 100, 5, 18, 2.5, "#ffffff", 'opacity="0.5"');
        }
        if (extra.kind === "flag") {
            let squares = "";
            for (let row = 0; row < 4; row += 1) {
                for (let col = 0; col < 5; col += 1) {
                    squares += rect(152 + col * 8, 62 + row * 8, 8, 8, 0, (row + col) % 2 === 0 ? INK : "#ffffff");
                }
            }
            return rect(148, 58, 4, 100, 2, "#8f89a6") + squares
                + `<rect x="152" y="62" width="40" height="32" fill="none" stroke="${INK}" stroke-width="1.5"/>`;
        }
        return "";
    }

    /* ---------- API publica ---------- */
    function render(parts, options) {
        const p = parts || {};
        const opts = options || {};
        const skin = (p.skin && p.skin.color) || "#f6d2b5";
        const viewBox = CROPS[opts.crop] || CROPS.full;
        const label = opts.label ? ` role="img" aria-label="${opts.label}"` : ' aria-hidden="true"';
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" preserveAspectRatio="xMidYMid slice"${label}>`
            + drawBackground(p.bg || {})
            + `<ellipse cx="100" cy="236" rx="54" ry="8" fill="${INK}" opacity="0.18"/>`
            + drawLegs(p.legs || {}, skin)
            + drawTorso(p.torso || {}, skin)
            + drawHead(p.head || {}, p.face || {}, skin)
            + drawExtra(p.extra || {})
            + "</svg>";
    }

    window.PurpleAvatar = { render, CROPS };
})();
