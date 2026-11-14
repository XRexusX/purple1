document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("purple1_user") || "null");
    const card = document.querySelector(".profile-card");
    if (!user) {
        card.innerHTML = '<div class="profile-info-banner"><p>Inicia sesion para ver tu perfil.</p><a href="auth.html" class="btn-primary">Iniciar sesion</a></div>';
        return;
    }

    initAvatarStudio(user);

    const response = await fetch(`/api/users/${user.id}`);
    const data = await response.json();
    if (!data.success) return;
    const current = data.user;
    document.querySelectorAll(".profile-field.readonly span")[0].textContent = current.first_name || "";
    document.querySelectorAll(".profile-field.readonly span")[1].textContent = current.last_name || "";
    document.querySelector(".profile-field--full.readonly span").textContent = current.email || "";
    document.querySelector('[name="phone"]').value = current.phone || "";
    document.querySelector('[name="address"]').value = current.address || "";
    document.querySelector(".profile-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const res = await fetch(`/api/users/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: document.querySelector('[name="phone"]').value, address: document.querySelector('[name="address"]').value })
        });
        const updated = await res.json();
        if (updated.success) {
            localStorage.setItem("purple1_user", JSON.stringify(updated.user));
            alert("Perfil actualizado correctamente.");
        }
    });
});

/* =========================================================
   AVATAR DEL PERFIL
   Muestra el avatar, deja cambiarle las prendas y comprar
   las que tienen precio. El dibujo lo hace js/avatar.js y
   las reglas (que tiene cada usuario) las decide el backend.
========================================================= */
function initAvatarStudio(user) {
    const figure = document.querySelector("#avatar-figure");
    const mini = document.querySelector("#profile-avatar-mini");
    const tabs = document.querySelector("#avatar-tabs");
    const grid = document.querySelector("#avatar-items");
    const status = document.querySelector("#avatar-status");
    const previewFlag = document.querySelector("#avatar-preview-flag");
    const winsEl = document.querySelector("#avatar-wins");
    const coinsEl = document.querySelector("#avatar-coins");
    if (!figure || !window.PurpleAvatar) return;

    let avatar = null;        // respuesta de /api/avatar
    let activeSlot = "head";  // pestana abierta
    let previewId = null;     // prenda que se esta probando sin tenerla
    let busy = false;

    const itemById = (id) => avatar.items.find((item) => item.id === id);

    // Convierte { slot: item_id } en { slot: style } para el dibujante.
    function partsFor(equipped) {
        const parts = {};
        Object.entries(equipped).forEach(([slot, id]) => {
            const item = itemById(id);
            if (item) parts[slot] = item.style;
        });
        return parts;
    }

    function say(message, tone) {
        status.textContent = message || "";
        status.className = `avatar-status${tone ? ` is-${tone}` : ""}`;
    }

    function syncCoins() {
        coinsEl.textContent = avatar.coins;
        const badge = document.querySelector(".nav-coin-badge span");
        if (badge) badge.textContent = avatar.coins;
        const stored = JSON.parse(localStorage.getItem("purple1_user") || "null");
        if (stored) localStorage.setItem("purple1_user", JSON.stringify({ ...stored, coins: avatar.coins }));
    }

    function renderStage() {
        const preview = previewId ? itemById(previewId) : null;
        const shown = preview ? { ...avatar.equipped, [preview.slot]: preview.id } : avatar.equipped;
        figure.innerHTML = PurpleAvatar.render(partsFor(shown), { label: "Tu avatar" });
        previewFlag.hidden = !preview;
        mini.innerHTML = PurpleAvatar.render(partsFor(avatar.equipped), { crop: "head" });
        mini.classList.add("has-avatar");
        winsEl.textContent = avatar.wins;
        syncCoins();
    }

    function renderTabs() {
        tabs.innerHTML = avatar.slots.map((slot) => `
            <button type="button" role="tab" class="avatar-tab${slot.id === activeSlot ? " is-active" : ""}"
                aria-selected="${slot.id === activeSlot}" data-slot="${slot.id}">${slot.label}</button>`).join("");
    }

    function tagFor(item) {
        if (avatar.equipped[item.slot] === item.id) return '<i class="fa-solid fa-check"></i> En uso';
        if (item.owned) return "Usar";
        if (item.unlock === "wins") return `<i class="fa-solid fa-lock"></i> ${Math.min(avatar.wins, item.wins)} de ${item.wins} ${item.wins === 1 ? "acierto" : "aciertos"}`;
        if (previewId === item.id) return `Comprar por ${item.price}`;
        return `<i class="fa-solid fa-coins"></i> ${item.price}`;
    }

    function renderItems() {
        const items = avatar.items.filter((item) => item.slot === activeSlot);
        // Las miniaturas usan el avatar actual con esa prenda puesta, sobre fondo claro.
        const plainBg = avatar.items.find((item) => item.slot === "bg" && item.unlock === "free");
        grid.innerHTML = items.map((item) => {
            const equipped = { ...avatar.equipped, [item.slot]: item.id };
            if (item.slot !== "bg" && plainBg) equipped.bg = plainBg.id;
            const classes = ["avatar-item"];
            if (avatar.equipped[item.slot] === item.id) classes.push("is-equipped");
            if (!item.owned) classes.push(item.unlock === "wins" ? "is-locked" : "is-buy");
            if (previewId === item.id) classes.push("is-preview");
            return `
                <button type="button" class="${classes.join(" ")}" data-item="${item.id}">
                    <span class="avatar-item__preview">${PurpleAvatar.render(partsFor(equipped), { crop: item.slot })}</span>
                    <span class="avatar-item__name">${item.name}</span>
                    <span class="avatar-item__tag">${tagFor(item)}</span>
                </button>`;
        }).join("");
    }

    function renderAll() {
        renderStage();
        renderTabs();
        renderItems();
    }

    async function request(url, method, body) {
        const res = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined,
        });
        const data = await res.json();
        if (!res.ok || !data.success) throw new Error(data.error || "No fue posible actualizar el avatar.");
        return data.avatar;
    }

    async function equip(item, message) {
        avatar = await request("/api/avatar", "PUT", { user_id: user.id, equipped: { ...avatar.equipped, [item.slot]: item.id } });
        previewId = null;
        renderAll();
        say(message || `Tu avatar ahora lleva "${item.name}".`, "ok");
    }

    async function buy(item) {
        avatar = await request("/api/avatar/buy", "POST", { user_id: user.id, item_id: item.id });
        renderAll();
        await equip(itemById(item.id), `Compraste "${item.name}" por ${item.price} PitCoins y ya esta en tu avatar.`);
    }

    tabs.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-slot]");
        if (!tab || !avatar) return;
        activeSlot = tab.dataset.slot;
        previewId = null;
        say("");
        renderAll();
    });

    grid.addEventListener("click", async (event) => {
        const tile = event.target.closest("[data-item]");
        if (!tile || !avatar || busy) return;
        const item = itemById(tile.dataset.item);
        if (!item) return;

        busy = true;
        try {
            if (item.owned) {
                if (avatar.equipped[item.slot] !== item.id) await equip(item);
            } else if (item.unlock === "wins") {
                // Se puede probar, pero solo se desbloquea acertando pronosticos.
                previewId = item.id;
                renderAll();
                const faltan = item.wins - avatar.wins;
                say(`"${item.name}" se desbloquea con ${item.wins} ${item.wins === 1 ? "pronostico acertado" : "pronosticos acertados"}. Te ${faltan === 1 ? "falta 1" : `faltan ${faltan}`}.`, "info");
            } else if (previewId === item.id) {
                await buy(item);
            } else {
                // Primer toque: se prueba la prenda. Segundo toque: se compra.
                previewId = item.id;
                renderAll();
                say(avatar.coins >= item.price
                    ? `"${item.name}" cuesta ${item.price} PitCoins. Toca de nuevo para comprarla.`
                    : `"${item.name}" cuesta ${item.price} PitCoins y tienes ${avatar.coins}. Acierta pronosticos para ganar mas.`, "info");
            }
        } catch (error) {
            say(error.message, "error");
        } finally {
            busy = false;
        }
    });

    (async () => {
        try {
            const res = await fetch(`/api/avatar?user_id=${user.id}`);
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data.error || "No fue posible cargar tu avatar.");
            avatar = data.avatar;
            renderAll();
        } catch (error) {
            say(error.message, "error");
        }
    })();
}
