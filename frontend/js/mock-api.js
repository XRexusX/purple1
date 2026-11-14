/* =========================================================
   Purple 1 · API simulada (datos mock) para el front publicado
   ---------------------------------------------------------
   En Vercel no hay servidor Python ni MySQL, asi que este archivo
   intercepta las llamadas a /api/... y las responde en el navegador
   con la MISMA forma que la API real (backend/*.py). Los datos salen
   de js/mock-data.js (generado desde database/seed.sql) y se guardan
   en localStorage, asi que cada visitante tiene su propia copia.

   Cuando se usa la API real:
     - Al abrir el proyecto con `python main.py` (http://127.0.0.1:8000).
   Cuando se usa el mock:
     - En cualquier otro lugar (Vercel, Live Server, archivo local).
   Forzar a mano: ?mock=1 (siempre mock) o ?mock=0 (siempre API real).
========================================================= */
(function () {
    "use strict";

    var host = location.hostname;
    var isLocal = host === "localhost" || host === "127.0.0.1" || host === "";
    var forced = null;
    try {
        var q = new URLSearchParams(location.search);
        if (q.has("mock")) localStorage.setItem("purple1_mock", q.get("mock") === "0" ? "0" : "1");
        forced = localStorage.getItem("purple1_mock");
    } catch (e) { /* sin localStorage: decide por la URL */ }
    var MOCK = forced === "1" ? true : forced === "0" ? false : !(isLocal && location.port === "8000");
    window.PURPLE1_MOCK = MOCK;
    if (!MOCK || !window.PURPLE1_SEED) return;

    var SEED = window.PURPLE1_SEED;
    var STORE_KEY = "purple1_mockdb_v1";
    var MIN_BET = 10;
    var STARTING_COINS = 1000;
    var DEFAULT_RACE_IMAGE = "img/poster-formula-1-night-race-placeholder.png";
    var DEMO_PASSWORDS = { "demo@purpleone.com": "purple2026", "admin@purpleone.com": "admin2026" };
    var CATALOG = SEED.avatar.catalog;
    var ITEMS_BY_ID = {};
    CATALOG.forEach(function (item) { ITEMS_BY_ID[item.id] = item; });

    var realFetch = window.fetch.bind(window);

    /* ---------------- utilidades ---------------- */
    function now() { return new Date().toISOString().slice(0, 19); }
    function clone(x) { return JSON.parse(JSON.stringify(x)); }
    function byId(list, id) { id = Number(id); return list.find(function (r) { return r.id === id; }) || null; }
    function nextId(list) { return list.reduce(function (m, r) { return Math.max(m, r.id || 0); }, 0) + 1; }
    function money(n) { return Math.round(Number(n) * 100) / 100; }
    function lower(s) { return String(s || "").trim().toLowerCase(); }
    function imagePath(p) {
        if (!p) return "img/placeholder-product.png";
        var t = String(p).replace(/\\/g, "/");
        return /^(img\/|https?:\/\/|\/)/.test(t) ? t : "img/" + t;
    }
    function validEmail(e) { return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e || ""); }
    function validatePassword(p) {
        if (!p || p.length < 8) return "La contrasena debe tener minimo 8 caracteres.";
        return "";
    }
    async function hashPassword(password, salt) {
        salt = salt || Math.random().toString(16).slice(2) + Math.random().toString(16).slice(2);
        var data = new TextEncoder().encode(salt + ":" + password);
        var buf = await crypto.subtle.digest("SHA-256", data);
        var hex = Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
        return "mock_sha256$" + salt + "$" + hex;
    }
    async function checkPassword(password, encoded) {
        var parts = String(encoded || "").split("$");
        if (parts.length !== 3) return false;
        return (await hashPassword(password, parts[1])) === encoded;
    }
    function ok(payload, status) { return { status: status || 200, body: payload }; }
    function fail(message, status) { return { status: status || 400, body: { success: false, error: message } }; }

    /* ---------------- base de datos en localStorage ---------------- */
    var DB = null;
    async function seedDb() {
        var teamBySlug = {};
        SEED.teams.forEach(function (t) { teamBySlug[t.slug] = t.id; });
        var users = [];
        for (var i = 0; i < SEED.users.length; i++) {
            var u = SEED.users[i];
            users.push(Object.assign({}, u, {
                is_active: 1, coins: STARTING_COINS, avatar_config: null, created_at: now(),
                password_hash: await hashPassword(DEMO_PASSWORDS[u.email] || "purple2026")
            }));
        }
        var races = [], options = [];
        SEED.races.forEach(function (r) {
            races.push({ id: r.id, name: r.name, circuit: r.circuit, country: r.country, race_date: r.race_date,
                image_path: DEFAULT_RACE_IMAGE, status: "OPEN", winner_option_id: null, created_at: now(), updated_at: now() });
            r.drivers.forEach(function (d) {
                options.push({ id: options.length + 1, race_id: r.id, driver_name: d[0], team_id: teamBySlug[d[1]] || null, image_path: null, created_at: now() });
            });
        });
        return {
            users: users,
            categories: clone(SEED.categories), teams: clone(SEED.teams), sizes: clone(SEED.sizes), colors: clone(SEED.colors),
            product_types: clone(SEED.product_types), products: clone(SEED.products).map(function (p) { p.created_at = now(); return p; }),
            product_images: clone(SEED.product_images).map(function (x, i) { x.id = i + 1; return x; }),
            product_categories: clone(SEED.product_categories), product_teams: clone(SEED.product_teams),
            inventory: clone(SEED.inventory),
            carts: [], cart_items: [], orders: [], order_items: [], payments: [],
            races: races, race_options: options, bets: [], user_avatar_items: []
        };
    }
    async function getDb() {
        if (DB) return DB;
        try { DB = JSON.parse(localStorage.getItem(STORE_KEY) || "null"); } catch (e) { DB = null; }
        if (!DB) { DB = await seedDb(); save(); }
        return DB;
    }
    function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); } catch (e) { /* solo en memoria */ } }

    /* ---------------- productos ---------------- */
    function productSummary(p) {
        var inv = DB.inventory.filter(function (i) { return i.product_id === p.id && i.is_active; });
        var prices = inv.map(function (i) { return i.price_override != null ? i.price_override : p.base_price; });
        var imgs = DB.product_images.filter(function (x) { return x.product_id === p.id; })
            .sort(function (a, b) { return (a.display_order - b.display_order) || (a.id - b.id); });
        var main = imgs.find(function (x) { return x.is_main; }) || imgs[0];
        var cats = DB.product_categories.filter(function (pc) { return pc.product_id === p.id; })
            .map(function (pc) { return byId(DB.categories, pc.category_id).name; });
        var teams = DB.product_teams.filter(function (pt) { return pt.product_id === p.id; })
            .map(function (pt) { return byId(DB.teams, pt.team_id).name; });
        var uniq = function (a) { return Array.from(new Set(a)).sort(); };
        var type = byId(DB.product_types, p.product_type_id);
        return {
            id: p.id, name: p.name, slug: p.slug, description: p.description, base_price: p.base_price,
            is_featured: p.is_featured, product_type: type ? type.name : null,
            final_price: prices.length ? Math.min.apply(null, prices) : p.base_price,
            total_stock: inv.reduce(function (s, i) { return s + i.stock; }, 0),
            main_image: imagePath(main && main.image_path),
            categories: uniq(cats).join(", ") || null,
            teams: uniq(teams).join(", ") || null
        };
    }
    function sortProducts(list, sort) {
        var fn = {
            name: function (a, b) { return a.name.localeCompare(b.name); },
            price_asc: function (a, b) { return a.final_price - b.final_price; },
            price_desc: function (a, b) { return b.final_price - a.final_price; }
        }[sort] || function (a, b) { return a.id - b.id; };
        return list.sort(fn);
    }
    function matchesText(p, term) {
        var t = lower(term);
        if (!t) return true;
        var cats = DB.product_categories.filter(function (pc) { return pc.product_id === p.id; })
            .map(function (pc) { return lower(byId(DB.categories, pc.category_id).name); });
        return lower(p.name).includes(t) || lower(p.description).includes(t) || cats.some(function (c) { return c.includes(t); });
    }
    function activeProducts() { return DB.products.filter(function (p) { return p.is_active; }); }
    function getProducts(q) { return sortProducts(activeProducts().map(productSummary), q.get("sort")); }
    function searchProducts(q) {
        var term = (q.get("q") || "").trim();
        if (!term) return getProducts(q);
        return activeProducts().filter(function (p) { return matchesText(p, term); }).map(productSummary)
            .sort(function (a, b) { return a.name.localeCompare(b.name); });
    }
    function filterProducts(q) {
        var category = q.get("category"), team = q.get("team"), size = q.get("size"), color = q.get("color");
        var min = q.get("min_price"), max = q.get("max_price"), term = (q.get("q") || "").trim();
        var list = activeProducts().filter(function (p) {
            var inv = DB.inventory.filter(function (i) { return i.product_id === p.id && i.is_active; });
            var price = function (i) { return i.price_override != null ? i.price_override : p.base_price; };
            if (category && !DB.product_categories.some(function (pc) { return pc.product_id === p.id && byId(DB.categories, pc.category_id).slug === category; })) return false;
            if (team && !DB.product_teams.some(function (pt) { return pt.product_id === p.id && byId(DB.teams, pt.team_id).slug === team; })) return false;
            if (size && !inv.some(function (i) { var s = byId(DB.sizes, i.size_id); return s && s.name === size && i.stock > 0; })) return false;
            if (color && !inv.some(function (i) { var c = byId(DB.colors, i.color_id); return c && c.name === color && i.stock > 0; })) return false;
            if (min && !inv.some(function (i) { return price(i) >= Number(min); })) return false;
            if (max && !inv.some(function (i) { return price(i) <= Number(max); })) return false;
            if (term && !matchesText(p, term)) return false;
            return true;
        });
        return sortProducts(list.map(productSummary), q.get("sort"));
    }
    function productDetail(id) {
        var p = byId(DB.products, id);
        if (!p || !p.is_active) return null;
        var product = productSummary(p);
        product.images = DB.product_images.filter(function (x) { return x.product_id === p.id; })
            .sort(function (a, b) { return (a.display_order - b.display_order) || (a.id - b.id); })
            .map(function (x) { return { id: x.id, image_path: imagePath(x.image_path), alt_text: x.alt_text, is_main: x.is_main }; });
        product.inventory = DB.inventory.filter(function (i) { return i.product_id === p.id && i.is_active; }).map(function (i) {
            var s = byId(DB.sizes, i.size_id), c = byId(DB.colors, i.color_id);
            return { id: i.id, sku: i.sku, stock: i.stock, effective_price: i.price_override != null ? i.price_override : p.base_price,
                size_id: s ? s.id : null, size_name: s ? s.name : null, size_order: s ? s.visual_order : -1,
                color_id: c ? c.id : null, color_name: c ? c.name : null, hex_code: c ? c.hex_code : null };
        }).sort(function (a, b) {
            return (a.size_order - b.size_order) || String(a.color_name || "").localeCompare(String(b.color_name || "")) || (a.id - b.id);
        }).map(function (i) { delete i.size_order; return i; });
        var sizes = {}, colors = {};
        product.inventory.forEach(function (i) {
            if (i.size_name) sizes[i.size_name] = { id: i.size_id, name: i.size_name };
            if (i.color_name) colors[i.color_name] = { id: i.color_id, name: i.color_name, hex_code: i.hex_code };
        });
        product.sizes = Object.values(sizes);
        product.colors = Object.values(colors);
        return product;
    }

    /* ---------------- usuarios y autenticacion ---------------- */
    function publicUser(u) {
        if (!u) return null;
        var d = clone(u);
        delete d.password_hash;
        return d;
    }
    function userView(u) {
        if (!u) return null;
        return { id: u.id, username: u.username, email: u.email, first_name: u.first_name, last_name: u.last_name,
            phone: u.phone, address: u.address, is_staff: u.is_staff, coins: u.coins, created_at: u.created_at };
    }
    async function register(d) {
        var first = (d.first_name || d.name || "").trim(), last = (d.last_name || "").trim();
        var email = lower(d.email), password = d.password || "", confirm = d.password_confirm || password;
        if (!first || !last || !email || !password) return fail("Completa todos los campos obligatorios.");
        if (!validEmail(email)) return fail("Correo electronico invalido.");
        if (password !== confirm) return fail("Las contrasenas no coinciden.");
        var msg = validatePassword(password);
        if (msg) return fail(msg);
        if (DB.users.some(function (u) { return lower(u.email) === email; })) return fail("Ya existe una cuenta con ese correo.");
        var user = { id: nextId(DB.users), username: email, email: email, password_hash: await hashPassword(password),
            first_name: first, last_name: last, phone: (d.phone || "").trim(), address: (d.address || "").trim(),
            is_active: 1, is_staff: 0, coins: STARTING_COINS, avatar_config: null, created_at: now() };
        DB.users.push(user);
        return ok({ success: true, user: userView(user) }, 201);
    }
    async function login(d) {
        var email = lower(d.email);
        var user = DB.users.find(function (u) { return lower(u.email) === email && u.is_active; });
        if (!user || !(await checkPassword(d.password || "", user.password_hash))) return fail("Correo o contrasena incorrectos.", 401);
        return ok({ success: true, user: publicUser(user) });
    }
    async function forgot(d) {
        var id = lower(d.identifier || d.email), np = d.new_password || d.password || "", confirm = d.password_confirm || np;
        if (np !== confirm) return fail("Las contrasenas no coinciden.");
        var msg = validatePassword(np);
        if (msg) return fail(msg);
        var user = DB.users.find(function (u) { return lower(u.username) === id || lower(u.email) === id; });
        if (!user) return fail("No existe un usuario con ese correo o nombre de usuario.", 404);
        user.password_hash = await hashPassword(np);
        return ok({ success: true, message: "Contrasena actualizada." });
    }
    async function changePassword(d) {
        var user = byId(DB.users, d.user_id);
        if (!user) return fail("Usuario no encontrado.", 404);
        if (!(await checkPassword(d.current_password || "", user.password_hash))) return fail("La contrasena actual no es correcta.", 401);
        var np = d.new_password || "", confirm = d.password_confirm || np;
        if (np !== confirm) return fail("Las contrasenas no coinciden.");
        var msg = validatePassword(np);
        if (msg) return fail(msg);
        user.password_hash = await hashPassword(np);
        return ok({ success: true, message: "Contrasena actualizada." });
    }
    function updateUser(id, d) {
        var u = byId(DB.users, id);
        if (!u) return null;
        u.first_name = (d.first_name || u.first_name || "").trim();
        u.last_name = (d.last_name || u.last_name || "").trim();
        u.phone = (d.phone || "").trim();
        u.address = (d.address || "").trim();
        return userView(u);
    }

    /* ---------------- carrito, pedidos y pago simulado ---------------- */
    function cartId(userId) {
        var c = DB.carts.filter(function (x) { return x.user_id === userId && x.status === "ACTIVE"; }).pop();
        if (c) return c.id;
        var cart = { id: nextId(DB.carts), user_id: userId, status: "ACTIVE", created_at: now() };
        DB.carts.push(cart);
        return cart.id;
    }
    function cartLines(cid) {
        return DB.cart_items.filter(function (ci) { return ci.cart_id === cid; }).map(function (ci) {
            var i = byId(DB.inventory, ci.inventory_id), p = byId(DB.products, i.product_id);
            var s = byId(DB.sizes, i.size_id), c = byId(DB.colors, i.color_id);
            var img = DB.product_images.find(function (x) { return x.product_id === p.id && x.is_main; });
            var unit = i.price_override != null ? i.price_override : p.base_price;
            return { id: ci.id, inventory_id: ci.inventory_id, quantity: ci.quantity, product_id: p.id, product_name: p.name,
                image_path: imagePath(img ? img.image_path : "placeholder-product.png"), size_name: s ? s.name : null,
                color_name: c ? c.name : null, unit_price: unit, subtotal: money(ci.quantity * unit), stock: i.stock };
        });
    }
    function getCart(userId) {
        var cid = cartId(userId), items = cartLines(cid);
        return { cart_id: cid, items: items, total: money(items.reduce(function (s, x) { return s + x.subtotal; }, 0)) };
    }
    function addToCart(d) {
        var userId = Number(d.user_id || 0), invId = Number(d.inventory_id || 0), qty = Number(d.quantity || 1);
        if (!userId || !invId) return fail("user_id e inventory_id son obligatorios.");
        var inv = byId(DB.inventory, invId);
        if (!inv || !inv.is_active) return fail("Inventario no encontrado.", 404);
        if (inv.stock < qty) return fail("Stock insuficiente.");
        var cid = cartId(userId);
        var item = DB.cart_items.find(function (ci) { return ci.cart_id === cid && ci.inventory_id === invId; });
        if (item) {
            if (inv.stock < item.quantity + qty) return fail("Stock insuficiente.");
            item.quantity += qty;
        } else {
            DB.cart_items.push({ id: nextId(DB.cart_items), cart_id: cid, inventory_id: invId, quantity: qty, created_at: now() });
        }
        return ok({ success: true, cart: getCart(userId) });
    }
    function updateCartItem(d) {
        var userId = Number(d.user_id || 0), itemId = Number(d.cart_item_id || d.item_id || 0), qty = Number(d.quantity || 1);
        var cid = cartId(userId);
        if (qty < 1) {
            DB.cart_items = DB.cart_items.filter(function (ci) { return !(ci.id === itemId && ci.cart_id === cid); });
        } else {
            var item = DB.cart_items.find(function (ci) { return ci.id === itemId && ci.cart_id === cid; });
            if (!item) return fail("Item no encontrado.", 404);
            if (byId(DB.inventory, item.inventory_id).stock < qty) return fail("Stock insuficiente.");
            item.quantity = qty;
        }
        return ok({ success: true, cart: getCart(userId) });
    }
    function removeCartItem(userId, itemId) {
        var cid = cartId(userId);
        DB.cart_items = DB.cart_items.filter(function (ci) { return !(ci.id === itemId && ci.cart_id === cid); });
        return ok({ success: true, cart: getCart(userId) });
    }
    function createOrder(d) {
        var userId = Number(d.user_id || 0);
        if (!userId) return fail("user_id es obligatorio.");
        var cid = cartId(userId), items = cartLines(cid);
        if (!items.length) return fail("El carrito esta vacio.");
        for (var k = 0; k < items.length; k++) {
            if (items[k].stock < items[k].quantity) return fail("Stock insuficiente para " + items[k].product_name + ".");
        }
        var subtotal = money(items.reduce(function (s, x) { return s + x.unit_price * x.quantity; }, 0));
        var order = { id: nextId(DB.orders), user_id: userId, status: "PENDING", subtotal: subtotal, discount: 0, shipping_cost: 0,
            total: subtotal, shipping_address: (d.shipping_address || "").trim(), created_at: now(), updated_at: now() };
        DB.orders.push(order);
        items.forEach(function (x) {
            DB.order_items.push({ id: nextId(DB.order_items), order_id: order.id, inventory_id: x.inventory_id, product_name: x.product_name,
                size_name: x.size_name, color_name: x.color_name, unit_price: x.unit_price, quantity: x.quantity, subtotal: money(x.unit_price * x.quantity) });
            byId(DB.inventory, x.inventory_id).stock -= x.quantity;
        });
        byId(DB.carts, cid).status = "CLOSED";
        return ok({ success: true, order: clone(order) }, 201);
    }
    function validateCard(d) {
        var holder = (d.card_holder || "").trim();
        var number = String(d.card_number || "").replace(/\D/g, "");
        var expiry = (d.card_expiry || "").trim();
        var cvv = String(d.card_cvv || "").replace(/\D/g, "");
        if (!holder || holder.length < 3) return [false, "Falta el nombre del titular.", number];
        if (number.length < 13 || number.length > 19) return [false, "El numero de tarjeta esta incompleto.", number];
        var m = /^(\d{2})\/(\d{2})$/.exec(expiry);
        if (!m) return [false, "La fecha de vencimiento debe tener el formato MM/AA.", number];
        var month = Number(m[1]), year = 2000 + Number(m[2]);
        if (month < 1 || month > 12) return [false, "El mes de vencimiento no es valido.", number];
        var t = new Date();
        if (year < t.getFullYear() || (year === t.getFullYear() && month < t.getMonth() + 1)) return [false, "La tarjeta esta vencida.", number];
        if (cvv.length < 3 || cvv.length > 4) return [false, "El CVV debe tener 3 o 4 digitos.", number];
        return [true, null, number];
    }
    function brand(n) {
        var map = [["4", "Visa"], ["2", "Mastercard"], ["5", "Mastercard"], ["3", "American Express"]];
        for (var i = 0; i < map.length; i++) if (n.indexOf(map[i][0]) === 0) return map[i][1];
        return "Tarjeta";
    }
    function simulatePayment(d) {
        var v = validateCard(d), valid = v[0];
        var res = createOrder(d);
        if (res.status >= 400) return res;
        var order = byId(DB.orders, res.body.order.id);
        var ref = "SIM-" + Array.from(crypto.getRandomValues(new Uint8Array(4))).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("").toUpperCase();
        DB.payments.push({ id: nextId(DB.payments), order_id: order.id, method: "CARD", status: valid ? "APPROVED" : "REJECTED", amount: order.total, reference: ref, created_at: now() });
        order.status = valid ? "PAID" : "CANCELLED";
        return ok({ success: true, approved: valid, reason: valid ? null : v[1], payment_status: valid ? "APPROVED" : "REJECTED",
            card_brand: valid ? brand(v[2]) : "", card_last4: valid ? v[2].slice(-4) : "", reference: ref, order: clone(order) }, 201);
    }

    /* ---------------- pronosticos con PitCoins ---------------- */
    function loadOptions(raceId) {
        return DB.race_options.filter(function (o) { return o.race_id === raceId; }).map(function (o) {
            var t = byId(DB.teams, o.team_id);
            return { id: o.id, race_id: o.race_id, driver_name: o.driver_name, team_id: o.team_id, image_path: o.image_path,
                team_name: t ? t.name : null, team_logo: t ? t.logo_path : null };
        });
    }
    function decorate(raceId, options, userBet) {
        var pools = {};
        DB.bets.filter(function (b) { return b.race_id === raceId && b.status !== "REFUNDED"; })
            .forEach(function (b) { pools[b.option_id] = (pools[b.option_id] || 0) + b.amount; });
        var total = Object.values(pools).reduce(function (s, x) { return s + x; }, 0);
        options.forEach(function (o) {
            o.image_path = imagePath(o.image_path || o.team_logo);
            var pool = pools[o.id] || 0;
            o.pool = pool;
            o.odds = pool > 0 ? Math.round(total / pool * 100) / 100 : null;
            o.is_user_pick = !!(userBet && userBet.option_id === o.id);
        });
        return [options, total];
    }
    function raceView(r, userId) {
        var race = clone(r);
        race.image_path = imagePath(race.image_path || DEFAULT_RACE_IMAGE);
        var bet = userId ? DB.bets.find(function (b) { return b.race_id === r.id && b.user_id === userId; }) : null;
        var dec = decorate(r.id, loadOptions(r.id), bet);
        race.options = dec[0];
        race.total_pool = dec[1];
        race.user_bet = bet ? clone(bet) : null;
        race.participants = new Set(DB.bets.filter(function (b) { return b.race_id === r.id; }).map(function (b) { return b.user_id; })).size;
        return race;
    }
    function listRaces(q) {
        var status = (q.get("status") || "").toUpperCase(), userId = Number(q.get("user_id") || 0);
        return DB.races.filter(function (r) { return !status || r.status === status; })
            .sort(function (a, b) { return a.race_date.localeCompare(b.race_date); })
            .map(function (r) { return raceView(r, userId); });
    }
    function placeBet(raceId, d) {
        var userId = Number(d.user_id || 0), optionId = Number(d.option_id || 0), amount = parseInt(d.amount, 10) || 0;
        if (!userId || !optionId) return fail("user_id y option_id son obligatorios.");
        if (amount < MIN_BET) return fail("El pronostico minimo es de " + MIN_BET + " PitCoins.");
        var race = byId(DB.races, raceId);
        if (!race) return fail("Carrera no encontrada.", 404);
        if (race.status !== "OPEN") return fail("Los pronosticos para esta carrera no estan abiertos.");
        if (!DB.race_options.some(function (o) { return o.id === optionId && o.race_id === raceId; })) return fail("Piloto no encontrado en esta carrera.", 404);
        var user = byId(DB.users, userId);
        if (!user) return fail("Usuario no encontrado.");
        var existing = DB.bets.find(function (b) { return b.race_id === raceId && b.user_id === userId; });
        var available = user.coins + (existing ? existing.amount : 0);
        if (amount > available) return fail("No tienes suficientes PitCoins para este pronostico.");
        user.coins = available - amount;
        if (existing) {
            Object.assign(existing, { option_id: optionId, amount: amount, status: "PENDING", payout: 0, updated_at: now() });
        } else {
            DB.bets.push({ id: nextId(DB.bets), user_id: userId, race_id: raceId, option_id: optionId, amount: amount,
                status: "PENDING", payout: 0, created_at: now(), updated_at: now() });
        }
        return ok({ success: true, race: raceView(race, userId), user: { id: user.id, username: user.username, coins: user.coins } });
    }
    function isStaff(id) { var u = byId(DB.users, id); return !!(u && u.is_staff); }
    function setRaceStatus(raceId, d) {
        var status = String(d.status || "").toUpperCase();
        if (!isStaff(Number(d.user_id || 0))) return fail("Solo el staff puede administrar carreras.", 403);
        if (["SCHEDULED", "OPEN", "LOCKED", "CANCELLED"].indexOf(status) < 0) return fail("Estado invalido.");
        var race = byId(DB.races, raceId);
        if (!race) return fail("Carrera no encontrada.", 404);
        if (race.status === "FINISHED") return fail("No puedes modificar una carrera ya finalizada.");
        race.status = status;
        return ok({ success: true, race: raceView(race, 0) });
    }
    function settleRace(raceId, d) {
        var winner = Number(d.winner_option_id || 0);
        if (!isStaff(Number(d.user_id || 0))) return fail("Solo el staff puede cerrar una carrera.", 403);
        var race = byId(DB.races, raceId);
        if (!race) return fail("Carrera no encontrada.", 404);
        if (race.status === "FINISHED") return fail("Esta carrera ya fue liquidada.");
        if (!DB.race_options.some(function (o) { return o.id === winner && o.race_id === raceId; })) return fail("Piloto ganador invalido.");
        var bets = DB.bets.filter(function (b) { return b.race_id === raceId && b.status === "PENDING"; });
        var total = bets.reduce(function (s, b) { return s + b.amount; }, 0);
        var winning = bets.filter(function (b) { return b.option_id === winner; }).reduce(function (s, b) { return s + b.amount; }, 0);
        bets.forEach(function (b) {
            var u = byId(DB.users, b.user_id);
            if (winning === 0) { b.status = "REFUNDED"; b.payout = b.amount; u.coins += b.amount; }
            else if (b.option_id === winner) { b.status = "WON"; b.payout = Math.floor(b.amount * total / winning); u.coins += b.payout; }
            else { b.status = "LOST"; b.payout = 0; }
        });
        race.status = "FINISHED";
        race.winner_option_id = winner;
        return ok({ success: true, race: raceView(race, 0) });
    }
    function userBets(userId) {
        return DB.bets.filter(function (b) { return b.user_id === userId; }).map(function (b) {
            var r = byId(DB.races, b.race_id), o = byId(DB.race_options, b.option_id);
            return { id: b.id, race_id: b.race_id, option_id: b.option_id, amount: b.amount, status: b.status, payout: b.payout,
                created_at: b.created_at, race_name: r.name, race_date: r.race_date, race_status: r.status,
                winner_option_id: r.winner_option_id, driver_name: o.driver_name };
        }).reverse();
    }
    function leaderboard() {
        return DB.users.filter(function (u) { return u.is_active; }).sort(function (a, b) { return b.coins - a.coins; }).slice(0, 10)
            .map(function (u) { return { id: u.id, username: u.username, first_name: u.first_name, last_name: u.last_name, coins: u.coins }; });
    }

    /* ---------------- avatar del perfil ---------------- */
    function wins(userId) { return DB.bets.filter(function (b) { return b.user_id === userId && b.status === "WON"; }).length; }
    function purchased(userId) {
        return new Set(DB.user_avatar_items.filter(function (x) { return x.user_id === userId; }).map(function (x) { return x.item_id; }));
    }
    function owned(item, w, bought) { return item.price ? bought.has(item.id) : item.wins ? w >= item.wins : true; }
    function cleanEquipped(raw, w, bought) {
        var eq = clone(SEED.avatar.defaults);
        if (typeof raw === "string") { try { raw = JSON.parse(raw); } catch (e) { raw = {}; } }
        if (!raw || typeof raw !== "object") raw = {};
        Object.keys(raw).forEach(function (slot) {
            var item = ITEMS_BY_ID[raw[slot]];
            if (item && item.slot === slot && owned(item, w, bought)) eq[slot] = item.id;
        });
        return eq;
    }
    function getAvatar(userId) {
        var u = byId(DB.users, userId);
        if (!u) return null;
        var w = wins(userId), bought = purchased(userId);
        return {
            slots: SEED.avatar.slots,
            items: CATALOG.map(function (it) {
                return Object.assign({}, it, { unlock: it.price ? "buy" : it.wins ? "wins" : "free", owned: owned(it, w, bought) });
            }),
            equipped: cleanEquipped(u.avatar_config, w, bought), wins: w, coins: u.coins
        };
    }
    function saveAvatar(d) {
        var userId = Number(d.user_id || 0);
        if (!userId) return fail("user_id es obligatorio.");
        var u = byId(DB.users, userId);
        if (!u) return fail("Usuario no encontrado.", 404);
        var wanted = d.equipped;
        if (!wanted || typeof wanted !== "object") return fail("Falta la seleccion del avatar.");
        var w = wins(userId), bought = purchased(userId), slots = Object.keys(wanted);
        for (var i = 0; i < slots.length; i++) {
            var item = ITEMS_BY_ID[wanted[slots[i]]];
            if (!item || item.slot !== slots[i]) return fail("Esa prenda no existe.");
            if (!owned(item, w, bought)) return fail("Todavia no tienes \"" + item.name + "\".", 403);
        }
        u.avatar_config = JSON.stringify(cleanEquipped(wanted, w, bought));
        return ok({ success: true, avatar: getAvatar(userId) });
    }
    function buyAvatarItem(d) {
        var userId = Number(d.user_id || 0), item = ITEMS_BY_ID[d.item_id || ""];
        if (!userId) return fail("user_id es obligatorio.");
        if (!item) return fail("Esa prenda no existe.", 404);
        if (!item.price) return fail("Esta prenda no se compra: se desbloquea acertando pronosticos.");
        var u = byId(DB.users, userId);
        if (!u) return fail("Usuario no encontrado.", 404);
        if (purchased(userId).has(item.id)) return fail("Ya tienes esta prenda.");
        if (u.coins < item.price) return fail("Te faltan " + (item.price - u.coins) + " PitCoins para comprar \"" + item.name + "\".");
        u.coins -= item.price;
        DB.user_avatar_items.push({ user_id: userId, item_id: item.id, acquired_at: now() });
        return ok({ success: true, avatar: getAvatar(userId) });
    }

    /* ---------------- enrutador (mismo mapa que backend/server.py) ---------------- */
    async function route(method, path, q, data) {
        var m;
        if (method === "GET") {
            if (path === "/api/products") return ok({ success: true, products: getProducts(q) });
            if (path === "/api/products/search") return ok({ success: true, products: searchProducts(q) });
            if (path === "/api/products/filter") return ok({ success: true, products: filterProducts(q) });
            if ((m = /^\/api\/products\/(\d+)$/.exec(path))) {
                var p = productDetail(m[1]);
                return p ? ok({ success: true, product: p }) : fail("Producto no encontrado.", 404);
            }
            if (path === "/api/categories") return ok({ success: true, categories: DB.categories.filter(function (c) { return c.is_active && c.parent_id == null; }).sort(function (a, b) { return a.name.localeCompare(b.name); }) });
            if (path === "/api/teams") return ok({ success: true, teams: DB.teams.filter(function (t) { return t.is_active; }).sort(function (a, b) { return a.name.localeCompare(b.name); }) });
            if (path === "/api/sizes") return ok({ success: true, sizes: DB.sizes.slice().sort(function (a, b) { return a.visual_order - b.visual_order; }) });
            if (path === "/api/colors") return ok({ success: true, colors: DB.colors.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }) });
            if (path === "/api/users") return ok({ success: true, users: DB.users.map(function (u) { return Object.assign(userView(u), { is_active: u.is_active }); }) });
            if ((m = /^\/api\/users\/(\d+)$/.exec(path))) {
                var u = byId(DB.users, m[1]);
                return u ? ok({ success: true, user: userView(u) }) : fail("Usuario no encontrado.", 404);
            }
            if (path === "/api/cart") {
                var cu = Number(q.get("user_id") || 0);
                return cu ? ok({ success: true, cart: getCart(cu) }) : fail("user_id es obligatorio.");
            }
            if (path === "/api/avatar") {
                var au = Number(q.get("user_id") || 0);
                if (!au) return fail("user_id es obligatorio.");
                var av = getAvatar(au);
                return av ? ok({ success: true, avatar: av }) : fail("Usuario no encontrado.", 404);
            }
            if (path === "/api/races") return ok({ success: true, races: listRaces(q) });
            if (path === "/api/races/leaderboard") return ok({ success: true, leaderboard: leaderboard() });
            if ((m = /^\/api\/races\/(\d+)$/.exec(path))) {
                var r = byId(DB.races, m[1]);
                return r ? ok({ success: true, race: raceView(r, Number(q.get("user_id") || 0)) }) : fail("Carrera no encontrada.", 404);
            }
            if (path === "/api/bets") {
                var bu = Number(q.get("user_id") || 0);
                return bu ? ok({ success: true, bets: userBets(bu) }) : fail("user_id es obligatorio.");
            }
        }
        if (method === "POST") {
            if (path === "/api/auth/logout") return ok({ success: true });
            if (path === "/api/users" || path === "/api/auth/register") return register(data);
            if (path === "/api/auth/login") return login(data);
            if (path === "/api/auth/forgot-password") return forgot(data);
            if (path === "/api/auth/change-password") return changePassword(data);
            if (path === "/api/cart/add") return addToCart(data);
            if (path === "/api/orders") return createOrder(data);
            if (path === "/api/payments/simulate") return simulatePayment(data);
            if (path === "/api/avatar/buy") return buyAvatarItem(data);
            if ((m = /^\/api\/races\/(\d+)\/(bet|status|result)$/.exec(path))) {
                var rid = Number(m[1]);
                if (m[2] === "bet") return placeBet(rid, data);
                if (m[2] === "status") return setRaceStatus(rid, data);
                return settleRace(rid, data);
            }
        }
        if (method === "PUT") {
            if ((m = /^\/api\/users\/(\d+)$/.exec(path))) {
                var upd = updateUser(m[1], data);
                return upd ? ok({ success: true, user: upd }) : fail("Usuario no encontrado.", 404);
            }
            if (path === "/api/avatar") return saveAvatar(data);
            if (path === "/api/cart/update") return updateCartItem(data);
        }
        if (method === "DELETE") {
            if ((m = /^\/api\/users\/(\d+)$/.exec(path))) {
                var du = byId(DB.users, m[1]);
                if (!du) return fail("Usuario no encontrado.", 404);
                du.is_active = 0;
                return ok({ success: true });
            }
            if (path === "/api/cart/remove") {
                var ru = Number(data.user_id || q.get("user_id") || 0);
                var ri = Number(data.cart_item_id || data.item_id || q.get("cart_item_id") || 0);
                if (!ru || !ri) return fail("user_id y cart_item_id son obligatorios.");
                return removeCartItem(ru, ri);
            }
        }
        return fail("Ruta no encontrada.", 404);
    }

    window.fetch = async function (input, init) {
        var url = new URL(typeof input === "string" ? input : input.url, location.href);
        if (url.origin !== location.origin || url.pathname.indexOf("/api/") !== 0) return realFetch(input, init);
        init = init || {};
        var method = (init.method || (typeof input === "string" ? "GET" : input.method) || "GET").toUpperCase();
        var data = {};
        try { data = init.body ? JSON.parse(init.body) : {}; } catch (e) { data = {}; }
        await getDb();
        var res;
        try { res = await route(method, url.pathname, url.searchParams, data); }
        catch (err) { res = fail(String(err && err.message || err), 500); }
        save();
        await new Promise(function (r) { setTimeout(r, 120); });
        return new Response(JSON.stringify(res.body), { status: res.status, headers: { "Content-Type": "application/json; charset=utf-8" } });
    };

    window.PURPLE1_RESET_DEMO = function () {
        try { localStorage.removeItem(STORE_KEY); localStorage.removeItem("purple1_user"); } catch (e) { /* nada */ }
        location.reload();
    };

    /* Aviso discreto: deja claro que es una demo con datos de prueba */
    document.addEventListener("DOMContentLoaded", function () {
        if (document.documentElement.classList.contains("intro-on") && !document.querySelector(".site-body")) return;
        var tag = document.createElement("div");
        tag.className = "p1-demo-tag";
        tag.innerHTML = '<span class="p1-demo-dot"></span>Demo · datos de prueba <button type="button" title="Borra los datos de esta demo en este navegador">Reiniciar</button>';
        tag.querySelector("button").addEventListener("click", window.PURPLE1_RESET_DEMO);
        var css = document.createElement("style");
        css.textContent = ".p1-demo-tag{position:fixed;left:14px;bottom:14px;z-index:9000;display:flex;align-items:center;gap:8px;" +
            "padding:7px 8px 7px 12px;border-radius:999px;background:rgba(27,23,51,.88);color:#f0eaff;font:600 12px/1 Inter,sans-serif;" +
            "box-shadow:0 6px 18px rgba(27,23,51,.25);backdrop-filter:blur(6px)}" +
            ".p1-demo-dot{width:8px;height:8px;border-radius:50%;background:#9c5cff}" +
            ".p1-demo-tag button{border:0;border-radius:999px;padding:5px 10px;background:#7b2cff;color:#fff;font:600 11px Inter,sans-serif;cursor:pointer}" +
            ".p1-demo-tag button:focus-visible{outline:2px solid #fff;outline-offset:2px}";
        document.head.appendChild(css);
        document.body.appendChild(tag);
    });
})();
