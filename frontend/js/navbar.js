document.addEventListener("DOMContentLoaded", function () {
    const userMenu = document.querySelector(".nav-user-menu");
    if (!userMenu) return;

    const toggle = userMenu.querySelector(".nav-user-toggle");
    const dropdown = userMenu.querySelector(".nav-user-dropdown");

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem("purple1_user"));
        } catch (error) {
            return null;
        }
    }

    function renderUserMenu() {
        const user = getUser();

        if (!dropdown) return;

        if (user && user.id) {
            const displayName = user.first_name || user.email || "Mi cuenta";
            dropdown.innerHTML = `
                <div class="nav-user-greeting">Hola, ${displayName}</div>
                <a href="profile.html">Mi perfil</a>
                <a href="change_password.html">Cambiar contrasena</a>
                <a href="#" data-logout="true">Cerrar sesion</a>
            `;
            toggle.classList.add("active");
        } else {
            dropdown.innerHTML = `
                <div class="nav-user-greeting">Mi cuenta</div>
                <a href="auth.html">Iniciar sesion</a>
            `;
            toggle.classList.remove("active");
        }
    }

    async function renderCoinBadge() {
        const user = getUser();
        const icons = document.querySelector(".nav-icons");
        if (!icons) return;
        let badge = icons.querySelector(".nav-coin-badge");
        if (!user || !user.id) {
            badge?.remove();
            return;
        }
        if (!badge) {
            badge = document.createElement("a");
            badge.href = "races.html";
            badge.className = "nav-coin-badge";
            badge.title = "Tus PitCoins";
            icons.insertBefore(badge, userMenu);
        }
        badge.innerHTML = `<i class="fa-solid fa-coins"></i> <span>${user.coins ?? "--"}</span>`;
        try {
            const res = await fetch(`/api/users/${user.id}`);
            const data = await res.json();
            if (data.success) {
                badge.innerHTML = `<i class="fa-solid fa-coins"></i> <span>${data.user.coins}</span>`;
            }
        } catch (error) {
            // Si falla, se mantiene el ultimo saldo conocido.
        }
    }

    renderUserMenu();
    renderCoinBadge();

    toggle.addEventListener("click", function (event) {
        event.stopPropagation();
        const isOpen = userMenu.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
    });

    dropdown?.addEventListener("click", async function (event) {
        const logout = event.target.closest("[data-logout]");
        if (!logout) return;

        event.preventDefault();
        try {
            await fetch("/api/auth/logout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
        } catch (error) {
            // La sesion del frontend se limpia aunque el endpoint no responda.
        }
        localStorage.removeItem("purple1_user");
        renderUserMenu();
        renderCoinBadge();
        window.location.href = "auth.html";
    });

    document.addEventListener("click", function (event) {
        if (!userMenu.contains(event.target)) {
            userMenu.classList.remove("open");
            toggle.setAttribute("aria-expanded", "false");
        }
    });
});
