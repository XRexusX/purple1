/* Intro de Purple1: un carro de F1 en 3D que se mueve con el scroll.
 *
 * Como funciona, en corto:
 *  - index.html pone la clase "intro-on" en <html> la primera vez de cada visita.
 *  - Mientras dura la intro hay una "pista" invisible muy alta (.p1-intro-track):
 *    lo que el usuario baja en ella se convierte en un avance p entre 0 y 1.
 *  - Con p se mueve la camara alrededor del carro, se encienden las 5 luces
 *    del semaforo y cambian las frases.
 *  - Al llegar al final las luces se apagan, el carro arranca y la escena se
 *    abre para mostrar la tienda.
 *
 * El 3D esta hecho con WebGL directo (sin librerias externas), asi que funciona
 * sin internet. El carro se arma con cajas y cilindros en buildCar().
 * Para volver a ver la intro: abre index.html?intro=1
 */
(function () {
    "use strict";

    const root = document.documentElement;
    const intro = document.getElementById("p1-intro");
    const track = document.getElementById("p1-intro-track");
    if (!intro || !track || !root.classList.contains("intro-on")) return;

    const canvas = intro.querySelector(".p1-intro__canvas");
    const fallbackImg = intro.querySelector(".p1-intro__fallback");
    const lights = Array.from(intro.querySelectorAll(".p1-intro__lights span"));
    const lines = Array.from(intro.querySelectorAll(".p1-intro__line"));
    const skipBtn = intro.querySelector(".p1-intro__skip");

    /* =====================================================
       Matematicas minimas (matrices 4x4 en orden de columnas)
    ===================================================== */
    function perspective(fovy, aspect, near, far) {
        const f = 1 / Math.tan(fovy / 2);
        const nf = 1 / (near - far);
        return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0];
    }

    function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
    function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
    function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
    function normalize(a) {
        const len = Math.hypot(a[0], a[1], a[2]) || 1;
        return [a[0] / len, a[1] / len, a[2] / len];
    }

    function lookAt(eye, target, up) {
        const z = normalize(sub(eye, target));
        const x = normalize(cross(up, z));
        const y = cross(z, x);
        return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
    }

    function multiply(a, b) {
        const out = new Array(16);
        for (let col = 0; col < 4; col += 1) {
            for (let row = 0; row < 4; row += 1) {
                out[col * 4 + row] = a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];
            }
        }
        return out;
    }

    function translation(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; }
    function scaling(x, y, z) { return [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1]; }
    function rotationX(a) {
        const c = Math.cos(a);
        const s = Math.sin(a);
        return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1];
    }

    function clamp01(v) { return Math.max(0, Math.min(1, v)); }
    function lerp(a, b, t) { return a + (b - a) * t; }

    /* =====================================================
       Constructor de geometria: todo son cajas deformadas
    ===================================================== */
    function hex(value, emissive) {
        const n = parseInt(value.replace("#", ""), 16);
        return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255, emissive || 0];
    }

    const COLOR = {
        body: hex("#7b2cff"),
        deep: hex("#4a12b8"),
        lilac: hex("#b48cff"),
        white: hex("#f0eaff"),
        carbon: hex("#17121f"),
        gold: hex("#f5b942"),
        pink: hex("#ff5fd2", 0.55),
        red: hex("#ff2d46", 1),
        tire: hex("#121018"),
        rim: hex("#cfc4ea"),
        rimDark: hex("#3a2f55"),
    };

    function createMesh() {
        return { pos: [], nrm: [], col: [] };
    }

    function pushTri(mesh, a, b, c, n, color) {
        mesh.pos.push(a[0], a[1], a[2], b[0], b[1], b[2], c[0], c[1], c[2]);
        for (let i = 0; i < 3; i += 1) {
            mesh.nrm.push(n[0], n[1], n[2]);
            mesh.col.push(color[0], color[1], color[2], color[3]);
        }
    }

    // Cara de 4 puntos. La normal se orienta hacia afuera del centro de la pieza,
    // asi no importa en que orden se pasen los vertices.
    function pushQuad(mesh, a, b, c, d, color, center) {
        let n = normalize(cross(sub(c, a), sub(d, b)));
        const mid = [(a[0] + b[0] + c[0] + d[0]) / 4, (a[1] + b[1] + c[1] + d[1]) / 4, (a[2] + b[2] + c[2] + d[2]) / 4];
        if (dot(n, sub(mid, center)) < 0) n = [-n[0], -n[1], -n[2]];
        pushTri(mesh, a, b, c, n, color);
        pushTri(mesh, a, c, d, n, color);
    }

    // Solido de 8 vertices: dos anillos de 4 puntos unidos entre si.
    function pushHull(mesh, v, color) {
        const center = [0, 0, 0];
        v.forEach((p) => { center[0] += p[0] / 8; center[1] += p[1] / 8; center[2] += p[2] / 8; });
        pushQuad(mesh, v[0], v[1], v[2], v[3], color, center);
        pushQuad(mesh, v[4], v[5], v[6], v[7], color, center);
        for (let i = 0; i < 4; i += 1) {
            const j = (i + 1) % 4;
            pushQuad(mesh, v[i], v[j], v[j + 4], v[i + 4], color, center);
        }
    }

    // "Loft": une secciones rectangulares a lo largo del eje Z.
    // Cada seccion es [z, centroX, medioAncho, yAbajo, yArriba].
    function loft(mesh, sections, color) {
        const ring = (s) => [
            [s[1] - s[2], s[3], s[0]], [s[1] + s[2], s[3], s[0]],
            [s[1] + s[2], s[4], s[0]], [s[1] - s[2], s[4], s[0]],
        ];
        for (let i = 0; i < sections.length - 1; i += 1) {
            pushHull(mesh, ring(sections[i]).concat(ring(sections[i + 1])), color);
        }
    }

    function box(mesh, cx, cy, cz, w, h, d, color) {
        loft(mesh, [[cz - d / 2, cx, w / 2, cy - h / 2, cy + h / 2], [cz + d / 2, cx, w / 2, cy - h / 2, cy + h / 2]], color);
    }

    // Barra de seccion cuadrada entre dos puntos cualesquiera.
    function beam(mesh, a, b, thickness, color) {
        const dir = normalize(sub(b, a));
        const helper = Math.abs(dir[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
        const u = normalize(cross(dir, helper)).map((c) => c * thickness / 2);
        const v = normalize(cross(dir, u)).map((c) => c * thickness / 2);
        const ring = (p) => [
            [p[0] - u[0] - v[0], p[1] - u[1] - v[1], p[2] - u[2] - v[2]],
            [p[0] + u[0] - v[0], p[1] + u[1] - v[1], p[2] + u[2] - v[2]],
            [p[0] + u[0] + v[0], p[1] + u[1] + v[1], p[2] + u[2] + v[2]],
            [p[0] - u[0] + v[0], p[1] - u[1] + v[1], p[2] - u[2] + v[2]],
        ];
        pushHull(mesh, ring(a).concat(ring(b)), color);
    }

    /* ---------- El carro (frente hacia -Z, medidas aproximadas en metros) ---------- */
    function buildCar() {
        const m = createMesh();

        // Piso
        box(m, 0, 0.10, 0.25, 1.5, 0.05, 4.1, COLOR.carbon);

        // Nariz + monocasco + caja de cambios
        const spine = [
            [-2.78, 0, 0.08, 0.30, 0.37],
            [-2.05, 0, 0.16, 0.27, 0.50],
            [-1.20, 0, 0.26, 0.20, 0.64],
            [-0.50, 0, 0.34, 0.14, 0.74],
            [0.55, 0, 0.37, 0.14, 0.78],
            [1.40, 0, 0.30, 0.16, 0.60],
            [2.15, 0, 0.15, 0.20, 0.44],
        ];
        loft(m, spine, COLOR.body);
        // Franja clara sobre la nariz
        loft(m, spine.slice(0, 4).map((s) => [s[0], 0, s[2] * 0.24 + 0.015, s[4] - 0.01, s[4] + 0.014]), COLOR.white);

        // Cabina, casco del piloto y toma de aire
        box(m, 0, 0.775, 0.10, 0.40, 0.03, 0.75, COLOR.carbon);
        loft(m, [[-0.08, 0, 0.10, 0.78, 0.92], [0.08, 0, 0.14, 0.78, 1.00], [0.30, 0, 0.12, 0.78, 0.94]], COLOR.gold);
        box(m, 0, 0.90, -0.09, 0.17, 0.06, 0.03, COLOR.carbon);
        loft(m, [[0.32, 0, 0.17, 0.78, 1.10], [0.75, 0, 0.17, 0.76, 1.06], [1.50, 0, 0.09, 0.58, 0.80], [2.10, 0, 0.04, 0.42, 0.56]], COLOR.deep);
        box(m, 0, 1.0, 0.31, 0.20, 0.12, 0.02, COLOR.carbon);
        loft(m, [[0.90, 0, 0.012, 0.95, 1.05], [2.05, 0, 0.012, 0.52, 0.68]], COLOR.lilac);

        // Halo
        beam(m, [0, 0.76, -0.62], [0, 1.0, -0.22], 0.06, COLOR.carbon);

        // Aleron delantero
        box(m, 0, 0.14, -2.74, 1.86, 0.03, 0.46, COLOR.white);

        // Aleron trasero
        loft(m, [[2.14, 0, 0.49, 0.98, 1.02], [2.50, 0, 0.49, 1.04, 1.08]], COLOR.deep);
        loft(m, [[2.42, 0, 0.49, 1.07, 1.10], [2.62, 0, 0.49, 1.12, 1.15]], COLOR.lilac);
        box(m, 0, 0.52, 2.34, 0.98, 0.03, 0.26, COLOR.carbon);
        box(m, 0, 0.72, 2.26, 0.05, 0.56, 0.14, COLOR.carbon);
        loft(m, [[1.90, 0, 0.55, 0.08, 0.14], [2.30, 0, 0.60, 0.10, 0.30]], COLOR.carbon);
        // Luz trasera
        box(m, 0, 0.36, 2.19, 0.07, 0.10, 0.04, COLOR.red);

        // Todo lo que existe a ambos lados (s = -1 izquierda, s = 1 derecha)
        [-1, 1].forEach((s) => {
            // Pontones
            loft(m, [[-0.50, s * 0.62, 0.26, 0.16, 0.62], [0.50, s * 0.63, 0.30, 0.14, 0.60], [1.30, s * 0.50, 0.22, 0.14, 0.44], [1.95, s * 0.36, 0.12, 0.16, 0.32]], COLOR.body);
            box(m, s * 0.62, 0.42, -0.505, 0.40, 0.26, 0.02, COLOR.carbon);
            loft(m, [[-0.45, s * 0.62, 0.09, 0.612, 0.632], [0.50, s * 0.63, 0.10, 0.592, 0.612], [1.30, s * 0.50, 0.07, 0.432, 0.452]], COLOR.lilac);
            // Borde luminoso del piso
            box(m, s * 0.76, 0.115, 0.30, 0.03, 0.06, 3.6, COLOR.pink);

            // Halo (brazos)
            beam(m, [s * 0.03, 1.0, -0.22], [s * 0.27, 1.03, 0.12], 0.06, COLOR.carbon);
            beam(m, [s * 0.27, 1.03, 0.12], [s * 0.33, 0.84, 0.52], 0.06, COLOR.carbon);

            // Espejos
            beam(m, [s * 0.34, 0.72, -0.38], [s * 0.50, 0.80, -0.34], 0.025, COLOR.carbon);
            box(m, s * 0.53, 0.81, -0.33, 0.12, 0.07, 0.05, COLOR.body);

            // Aleron delantero: flaps, derivas y soportes
            loft(m, [[-2.72, s * 0.56, 0.36, 0.20, 0.225], [-2.46, s * 0.56, 0.36, 0.26, 0.285]], COLOR.lilac);
            box(m, s * 0.94, 0.24, -2.70, 0.03, 0.26, 0.56, COLOR.body);
            box(m, s * 0.10, 0.22, -2.66, 0.03, 0.16, 0.20, COLOR.carbon);

            // Aleron trasero: derivas
            box(m, s * 0.50, 0.82, 2.36, 0.03, 0.68, 0.56, COLOR.body);

            // Suspension
            beam(m, [s * 0.20, 0.42, -1.60], [s * 0.72, 0.46, -1.78], 0.03, COLOR.carbon);
            beam(m, [s * 0.20, 0.30, -1.95], [s * 0.72, 0.28, -1.78], 0.03, COLOR.carbon);
            beam(m, [s * 0.22, 0.50, -1.95], [s * 0.72, 0.46, -1.78], 0.03, COLOR.carbon);
            beam(m, [s * 0.25, 0.40, 1.50], [s * 0.70, 0.44, 1.78], 0.03, COLOR.carbon);
            beam(m, [s * 0.20, 0.30, 2.00], [s * 0.70, 0.28, 1.78], 0.03, COLOR.carbon);
        });
        return m;
    }

    // Rueda de ancho 1 centrada en el origen, con el eje a lo largo de X.
    function buildWheel(radius) {
        const m = createMesh();
        const segments = 28;
        const rings = [
            [1.0, 0.86, COLOR.tire],
            [0.86, 0.79, COLOR.lilac],
            [0.79, 0.62, COLOR.tire],
        ];
        for (let i = 0; i < segments; i += 1) {
            const a0 = (i / segments) * Math.PI * 2;
            const a1 = ((i + 1) / segments) * Math.PI * 2;
            const am = (a0 + a1) / 2;
            const at = (a, r, x) => [x, Math.cos(a) * r * radius, Math.sin(a) * r * radius];
            // Banda de rodadura
            const tread = [0, Math.cos(am), Math.sin(am)];
            pushTri(m, at(a0, 1, -0.5), at(a1, 1, -0.5), at(a1, 1, 0.5), tread, COLOR.tire);
            pushTri(m, at(a0, 1, -0.5), at(a1, 1, 0.5), at(a0, 1, 0.5), tread, COLOR.tire);
            // Costados: llanta, franja de color y rin con radios
            [-0.5, 0.5].forEach((x) => {
                const side = [Math.sign(x), 0, 0];
                rings.forEach(([outer, inner, color]) => {
                    pushTri(m, at(a0, outer, x), at(a1, outer, x), at(a1, inner, x), side, color);
                    pushTri(m, at(a0, outer, x), at(a1, inner, x), at(a0, inner, x), side, color);
                });
                const spoke = i % 4 < 2 ? COLOR.rim : COLOR.rimDark;
                pushTri(m, at(a0, 0.62, x), at(a1, 0.62, x), [x, 0, 0], side, spoke);
            });
        }
        return m;
    }

    const WHEEL_RADIUS = 0.36;
    const WHEELS = [
        { x: -0.82, z: -1.78, width: 0.34 },
        { x: 0.82, z: -1.78, width: 0.34 },
        { x: -0.80, z: 1.78, width: 0.42 },
        { x: 0.80, z: 1.78, width: 0.42 },
    ];

    /* =====================================================
       Recorrido de la camara segun el avance p (0 a 1)
       angle: 180 = de frente, 90 = de lado, 0 = desde atras
    ===================================================== */
    const CAMERA_KEYS = [
        { p: 0.00, angle: 148, tilt: 9, dist: 9.2 },
        { p: 0.28, angle: 96, tilt: 5, dist: 9.0 },
        { p: 0.52, angle: 46, tilt: 13, dist: 8.8 },
        { p: 0.78, angle: 10, tilt: 30, dist: 9.8 },
        { p: 1.00, angle: 0, tilt: 9, dist: 7.6 },
    ];

    function catmull(p0, p1, p2, p3, t) {
        return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
    }

    function cameraAt(p) {
        let i = 0;
        while (i < CAMERA_KEYS.length - 2 && p > CAMERA_KEYS[i + 1].p) i += 1;
        const k1 = CAMERA_KEYS[i];
        const k2 = CAMERA_KEYS[i + 1];
        const k0 = CAMERA_KEYS[Math.max(0, i - 1)];
        const k3 = CAMERA_KEYS[Math.min(CAMERA_KEYS.length - 1, i + 2)];
        const t = clamp01((p - k1.p) / (k2.p - k1.p));
        const pick = (key) => catmull(k0[key], k1[key], k2[key], k3[key], t);
        return { angle: pick("angle"), tilt: Math.max(3, pick("tilt")), dist: pick("dist") };
    }

    /* =====================================================
       WebGL
    ===================================================== */
    const CAR_VS = `
        attribute vec3 aPos;
        attribute vec3 aNrm;
        attribute vec4 aCol;
        uniform mat4 uViewProj;
        uniform mat4 uModel;
        varying vec3 vNormal;
        varying vec3 vWorld;
        varying vec4 vColor;
        void main() {
            vec4 world = uModel * vec4(aPos, 1.0);
            vWorld = world.xyz;
            vNormal = (uModel * vec4(aNrm, 0.0)).xyz;
            vColor = aCol;
            gl_Position = uViewProj * world;
        }`;

    const CAR_FS = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform vec3 uEye;
        uniform vec3 uFogColor;
        uniform vec2 uFog;
        varying vec3 vNormal;
        varying vec3 vWorld;
        varying vec4 vColor;
        void main() {
            vec3 n = normalize(vNormal);
            vec3 v = normalize(uEye - vWorld);
            vec3 keyDir = normalize(vec3(0.45, 0.9, -0.35));
            vec3 backDir = normalize(vec3(-0.7, 0.25, 0.6));
            float key = max(dot(n, keyDir), 0.0);
            float back = max(dot(n, backDir), 0.0);
            vec3 ambient = mix(vec3(0.12, 0.06, 0.26), vec3(0.46, 0.40, 0.66), 0.5 + 0.5 * n.y);
            vec3 base = vColor.rgb;
            vec3 color = base * (ambient + key * vec3(1.0, 0.96, 0.92) + back * vec3(1.0, 0.35, 0.85) * 0.6);
            float spec = pow(max(dot(n, normalize(keyDir + v)), 0.0), 42.0);
            color += spec * 0.5;
            float rim = pow(1.0 - max(dot(n, v), 0.0), 3.0);
            color += rim * vec3(0.55, 0.30, 1.0) * 0.35;
            color = mix(color, base * 1.5 + 0.12, vColor.a);
            float fog = smoothstep(uFog.x, uFog.y, distance(uEye, vWorld));
            color = mix(color, uFogColor, fog);
            float alpha = 1.0 - fog * fog;
            gl_FragColor = vec4(color * alpha, alpha);
        }`;

    const GROUND_VS = `
        attribute vec3 aPos;
        uniform mat4 uViewProj;
        varying vec3 vWorld;
        void main() {
            vWorld = aPos;
            gl_Position = uViewProj * vec4(aPos, 1.0);
        }`;

    const GROUND_FS = `
        #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
        #else
        precision mediump float;
        #endif
        uniform vec3 uEye;
        uniform vec3 uFogColor;
        uniform vec2 uFog;
        uniform float uScroll;
        uniform vec2 uCar;
        varying vec3 vWorld;
        void main() {
            vec2 p = vWorld.xz;
            float z = p.y - uScroll;
            float ax = abs(p.x);
            float onTrack = 1.0 - smoothstep(5.15, 5.25, ax);
            vec3 color = mix(vec3(0.022, 0.012, 0.05), vec3(0.062, 0.042, 0.115), onTrack);

            // Pianos rojo y blanco a los lados de la pista
            float kerb = step(5.3, ax) * (1.0 - step(6.2, ax));
            vec3 kerbColor = mix(vec3(0.78, 0.10, 0.20), vec3(0.82, 0.80, 0.88), step(0.5, fract(z / 3.0)));
            color = mix(color, kerbColor * 0.6, kerb);

            // Bordes de neon y linea central discontinua
            float edge = 1.0 - smoothstep(0.05, 0.12, abs(ax - 5.2));
            color += edge * vec3(0.70, 0.30, 1.0);
            float dash = step(0.5, fract(z / 6.0)) * (1.0 - smoothstep(0.05, 0.10, ax));
            color += dash * vec3(0.50, 0.42, 0.78);
            float slot = 1.0 - smoothstep(0.03, 0.08, abs(fract(z / 8.0) - 0.5) * 8.0);
            color += slot * onTrack * vec3(0.22, 0.12, 0.45);

            // Sombra y resplandor bajo el carro
            vec2 q = p - uCar;
            float shadow = 1.0 - smoothstep(0.55, 1.05, length(q / vec2(1.25, 3.0)));
            float glow = 1.0 - smoothstep(0.7, 2.6, length(q / vec2(1.7, 3.3)));
            color += glow * vec3(0.30, 0.10, 0.60) * 0.55;
            color *= 1.0 - 0.8 * shadow;

            float fog = smoothstep(uFog.x, uFog.y, distance(uEye, vWorld));
            float alpha = 1.0 - fog;
            gl_FragColor = vec4(mix(color, uFogColor, fog) * alpha, alpha);
        }`;

    function compile(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader) || "shader");
        }
        return shader;
    }

    function createProgram(gl, vs, fs, uniforms) {
        const program = gl.createProgram();
        gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vs));
        gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fs));
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            throw new Error(gl.getProgramInfoLog(program) || "program");
        }
        const locations = {};
        uniforms.forEach((name) => { locations[name] = gl.getUniformLocation(program, name); });
        return { program, uniforms: locations };
    }

    function upload(gl, program, mesh) {
        const make = (name, data, size) => {
            const buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
            return { buffer, size, location: gl.getAttribLocation(program, name) };
        };
        const attributes = [make("aPos", mesh.pos, 3)];
        if (mesh.nrm) attributes.push(make("aNrm", mesh.nrm, 3));
        if (mesh.col) attributes.push(make("aCol", mesh.col, 4));
        return { attributes, count: mesh.pos.length / 3 };
    }

    function bind(gl, object) {
        object.attributes.forEach((attribute) => {
            if (attribute.location < 0) return;
            gl.bindBuffer(gl.ARRAY_BUFFER, attribute.buffer);
            gl.enableVertexAttribArray(attribute.location);
            gl.vertexAttribPointer(attribute.location, attribute.size, gl.FLOAT, false, 0, 0);
        });
    }

    function createScene() {
        const forceFallback = /[?&]nogl=1/.test(window.location.search);
        const gl = forceFallback ? null : canvas.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
        if (!gl) return null;

        const carProgram = createProgram(gl, CAR_VS, CAR_FS, ["uViewProj", "uModel", "uEye", "uFogColor", "uFog"]);
        const groundProgram = createProgram(gl, GROUND_VS, GROUND_FS, ["uViewProj", "uEye", "uFogColor", "uFog", "uScroll", "uCar"]);
        const car = upload(gl, carProgram.program, buildCar());
        const wheel = upload(gl, carProgram.program, buildWheel(WHEEL_RADIUS));
        const ground = upload(gl, groundProgram.program, {
            pos: [-90, 0, -420, 90, 0, -420, 90, 0, 90, -90, 0, -420, 90, 0, 90, -90, 0, 90],
        });

        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        const FOG_COLOR = [0.07, 0.035, 0.16];

        function resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
            const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
            gl.viewport(0, 0, width, height);
            return width / height;
        }

        // state: { p, time, launch (0..1), carZ, wheelAngle, groundScroll }
        function draw(state) {
            const aspect = resize();
            const cam = cameraAt(state.p);
            const angle = (cam.angle + Math.sin(state.time * 0.45) * 2.2) * Math.PI / 180;
            const tilt = cam.tilt * Math.PI / 180;
            // En pantallas angostas la camara se aleja para que el carro quepa.
            const dist = cam.dist * Math.max(1, Math.min(2.6, 1.45 / aspect));
            const shake = state.launch > 0 ? (1 - state.launch) * 0.05 : 0;
            const eye = [
                Math.sin(angle) * Math.cos(tilt) * dist + Math.sin(state.time * 61) * shake,
                Math.sin(tilt) * dist + 0.35 + Math.cos(state.time * 47) * shake,
                Math.cos(angle) * Math.cos(tilt) * dist,
            ];
            const target = [0, 0.25, state.carZ * 0.12];
            const fov = lerp(38, 54, state.launch) * Math.PI / 180;
            // El carro se dibuja corrido hacia la derecha y arriba para dejarle
            // la esquina inferior izquierda a las frases (en celular, solo arriba).
            const settle = 1 - state.launch;
            const frameShift = aspect > 1.15 ? translation(0.24 * settle, 0.22 * settle, 0) : translation(0, 0.34 * settle, 0);
            const viewProj = multiply(frameShift, multiply(perspective(fov, aspect, 0.1, 600), lookAt(eye, target, [0, 1, 0])));
            const fog = [18, 70 + state.launch * 120];

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.useProgram(groundProgram.program);
            bind(gl, ground);
            gl.uniformMatrix4fv(groundProgram.uniforms.uViewProj, false, new Float32Array(viewProj));
            gl.uniform3fv(groundProgram.uniforms.uEye, eye);
            gl.uniform3fv(groundProgram.uniforms.uFogColor, FOG_COLOR);
            gl.uniform2fv(groundProgram.uniforms.uFog, fog);
            gl.uniform1f(groundProgram.uniforms.uScroll, state.groundScroll % 240);
            gl.uniform2f(groundProgram.uniforms.uCar, 0, state.carZ);
            gl.drawArrays(gl.TRIANGLES, 0, ground.count);

            gl.useProgram(carProgram.program);
            gl.uniformMatrix4fv(carProgram.uniforms.uViewProj, false, new Float32Array(viewProj));
            gl.uniform3fv(carProgram.uniforms.uEye, eye);
            gl.uniform3fv(carProgram.uniforms.uFogColor, FOG_COLOR);
            gl.uniform2fv(carProgram.uniforms.uFog, fog);

            const carMatrix = translation(0, 0, state.carZ);
            bind(gl, car);
            gl.uniformMatrix4fv(carProgram.uniforms.uModel, false, new Float32Array(carMatrix));
            gl.drawArrays(gl.TRIANGLES, 0, car.count);

            bind(gl, wheel);
            WHEELS.forEach((w) => {
                const model = multiply(carMatrix, multiply(translation(w.x, WHEEL_RADIUS, w.z), multiply(rotationX(state.wheelAngle), scaling(w.width, 1, 1))));
                gl.uniformMatrix4fv(carProgram.uniforms.uModel, false, new Float32Array(model));
                gl.drawArrays(gl.TRIANGLES, 0, wheel.count);
            });
        }

        function destroy() {
            const lose = gl.getExtension("WEBGL_lose_context");
            if (lose) lose.loseContext();
        }

        return { draw, destroy };
    }

    /* =====================================================
       Control: scroll -> avance, luces, frases y cierre
    ===================================================== */
    let scene = null;
    try {
        scene = createScene();
    } catch (error) {
        scene = null;
    }
    if (!scene) intro.classList.add("no-webgl");

    const LAUNCH_AT = 0.985;      // avance en el que se apagan las luces
    const state = { p: 0, time: 0, launch: 0, carZ: 0, wheelAngle: 0, groundScroll: 0 };
    let target = 0;               // avance segun el scroll (sin suavizar)
    let finishing = false;
    let launchStart = 0;
    let launchDuration = 1300;
    let opened = false;
    let lastFrame = performance.now();
    let frameId = 0;

    function jumpToTop() {
        try {
            window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        } catch (error) {
            window.scrollTo(0, 0);
        }
    }

    function readScroll() {
        if (finishing) return;
        const max = track.offsetHeight - window.innerHeight;
        target = max > 0 ? clamp01(window.scrollY / max) : 0;
        if (target > 0.02) intro.classList.add("is-moving");
    }

    function updateOverlay(p) {
        lights.forEach((light, index) => {
            light.classList.toggle("is-on", !finishing && p >= (index + 1) * 0.165);
        });
        lines.forEach((line) => {
            const from = Number(line.dataset.from);
            const to = Number(line.dataset.to);
            line.classList.toggle("is-on", p >= from && p < to);
        });
    }

    function drawFallback() {
        const p = state.p;
        const turn = lerp(-42, 42, p);
        const scale = lerp(0.72, 1.08, p) + state.launch * 0.6;
        const slide = state.launch * state.launch * 160;
        fallbackImg.style.transform = `translate(-50%, -50%) translateX(${slide}vw) perspective(1100px) rotateY(${turn}deg) rotateZ(${lerp(-3, 2, p)}deg) scale(${scale})`;
    }

    function cleanup() {
        cancelAnimationFrame(frameId);
        window.removeEventListener("scroll", readScroll);
        window.removeEventListener("resize", readScroll);
        document.removeEventListener("keydown", onKey);
        if (scene) scene.destroy();
        intro.remove();
        root.classList.remove("intro-on", "intro-lock");
        if ("scrollRestoration" in history) history.scrollRestoration = "auto";
    }

    function finish(fast) {
        if (finishing) return;
        finishing = true;
        launchStart = performance.now();
        launchDuration = fast ? 420 : 1300;
        try {
            sessionStorage.setItem("purple1_intro_seen", "1");
        } catch (error) {
            // Sin sessionStorage la intro simplemente se vera en cada visita.
        }
        intro.classList.add("is-launching");
        // La tienda queda lista debajo (arriba del todo) mientras el carro arranca.
        root.classList.add("intro-lock");
        track.remove();
        jumpToTop();
    }

    function onKey(event) {
        if (event.key === "Escape") finish(true);
    }

    function frame(now) {
        const dt = Math.min(0.05, (now - lastFrame) / 1000);
        lastFrame = now;
        state.time += dt;

        if (!finishing) {
            state.p += (target - state.p) * Math.min(1, dt * 6.5);
            if (state.p >= LAUNCH_AT) finish(false);
        } else {
            state.p += (1 - state.p) * Math.min(1, dt * 8);
            state.launch = clamp01((now - launchStart) / launchDuration);
            state.carZ = -170 * Math.pow(state.launch, 3);
            if (!opened && state.launch >= 0.5) {
                opened = true;
                intro.classList.add("is-open");
                setTimeout(cleanup, 950);
            }
        }

        // El carro siempre va "rodando": mas rapido cuanto mas se avanza.
        const speed = 5 + 32 * state.p + 260 * state.launch * state.launch;
        state.groundScroll += speed * dt;
        state.wheelAngle -= (speed * dt) / WHEEL_RADIUS;

        updateOverlay(state.p);
        if (scene) scene.draw(state); else drawFallback();
        frameId = requestAnimationFrame(frame);
    }

    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    jumpToTop();
    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);
    document.addEventListener("keydown", onKey);
    skipBtn.addEventListener("click", () => finish(true));
    frameId = requestAnimationFrame(frame);
})();
