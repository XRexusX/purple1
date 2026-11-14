document.addEventListener("DOMContentLoaded", async () => {
    const racesList = document.querySelector("#races-list");
    const leaderboardList = document.querySelector("#leaderboard-list");
    const walletAmount = document.querySelector("#wallet-amount");
    const walletHint = document.querySelector("#wallet-hint");

    function getUser() {
        try {
            return JSON.parse(localStorage.getItem("purple1_user"));
        } catch (error) {
            return null;
        }
    }

    function setUser(user) {
        localStorage.setItem("purple1_user", JSON.stringify(user));
    }

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function formatDate(value) {
        try {
            return new Date(value).toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch (error) {
            return value;
        }
    }

    const STATUS_LABEL = {
        SCHEDULED: "Proximamente",
        OPEN: "Pronosticos abiertos",
        LOCKED: "Pronosticos cerrados",
        FINISHED: "Finalizada",
        CANCELLED: "Cancelada",
    };

    let user = getUser();

    async function refreshWallet() {
        if (!user || !user.id) {
            walletAmount.textContent = "0";
            walletHint.textContent = "Inicia sesion para recibir tus primeros 1000 PitCoins.";
            return;
        }
        try {
            const res = await fetch(`/api/users/${user.id}`);
            const data = await res.json();
            if (data.success) {
                user = { ...user, coins: data.user.coins, is_staff: data.user.is_staff };
                setUser(user);
                walletAmount.textContent = data.user.coins;
                walletHint.textContent = "Disponibles para tu proximo pronostico.";
            }
        } catch (error) {
            walletAmount.textContent = user.coins ?? "--";
        }
    }

    function optionMarkup(race, option) {
        const maxPool = Math.max(1, ...race.options.map((o) => o.pool || 0));
        const barWidth = Math.round(((option.pool || 0) / maxPool) * 100);
        const selected = option.is_user_pick ? "selected" : "";
        const isWinner = race.status === "FINISHED" && race.winner_option_id === option.id ? "is-winner" : "";
        const oddsText = option.odds ? `<b>x${option.odds}</b>` : "sin pronosticos aun";
        return `
            <div class="race-option ${selected} ${isWinner}" data-option-id="${option.id}" data-race-id="${race.id}">
                <img src="${escapeHTML(option.image_path)}" alt="${escapeHTML(option.team_name || "")}">
                <div class="race-option__info">
                    <strong>${escapeHTML(option.driver_name)}</strong>
                    <span class="race-option__odds">${oddsText} &middot; ${option.pool || 0} PitCoins</span>
                </div>
                <div class="race-option__pool-bar" style="width:${barWidth}%"></div>
            </div>`;
    }

    function raceCard(race) {
        const canBet = race.status === "OPEN";
        const existingAmount = race.user_bet ? race.user_bet.amount : 10;
        const cta = race.user_bet ? "Actualizar pronostico" : "Pronosticar";
        const betPanel = canBet
            ? `<div class="race-bet-panel" data-race-id="${race.id}">
                    <input type="number" min="10" step="10" value="${existingAmount}" class="bet-amount-input" aria-label="PitCoins para este pronostico">
                    <button type="button" class="btn-primary bet-submit">${cta}</button>
                    <span class="race-bet-panel__note">${race.user_bet ? `Ya llevas ${race.user_bet.amount} PitCoins en esta carrera.` : "Elige un piloto arriba y define cuantos PitCoins pones."}</span>
               </div>`
            : race.status === "FINISHED"
                ? `<div class="race-bet-panel__note" style="grid-column:1/-1;color:var(--color-text-soft);">Carrera finalizada.${race.user_bet ? ` Tu resultado: ${race.user_bet.status === "WON" ? `acertaste y ganaste ${race.user_bet.payout} PitCoins` : race.user_bet.status === "LOST" ? "no acertaste esta vez" : "nadie acerto, recuperaste tus PitCoins"}.` : ""}</div>`
                : `<div class="race-bet-panel__note" style="grid-column:1/-1;color:var(--color-text-soft);">${STATUS_LABEL[race.status] || race.status}. Vuelve pronto para pronosticar.</div>`;

        // Solo staff: cerrar la carrera indicando el piloto ganador. Al hacerlo se
        // reparten los PitCoins y los aciertos cuentan para el avatar de cada usuario.
        const canSettle = user && user.is_staff && !["FINISHED", "CANCELLED"].includes(race.status);
        const staffPanel = canSettle
            ? `<div class="race-staff" data-race-id="${race.id}">
                    <label>Staff: piloto ganador
                        <select class="race-staff__winner">${race.options.map((o) => `<option value="${o.id}">${escapeHTML(o.driver_name)}</option>`).join("")}</select>
                    </label>
                    <button type="button" class="race-staff__settle">Cerrar carrera</button>
               </div>`
            : "";

        return `
            <article class="surface-card race-card race-card--${race.status.toLowerCase()}">
                <div class="race-card__head">
                    <div class="race-card__title">
                        <h3>${escapeHTML(race.name)}</h3>
                        <p><i class="fa-solid fa-location-dot"></i> ${escapeHTML(race.circuit)} &middot; ${formatDate(race.race_date)}</p>
                    </div>
                    <div style="text-align:right;">
                        <span class="race-status ${race.status}">${STATUS_LABEL[race.status] || race.status}</span>
                        <div class="race-pool">${race.total_pool} PitCoins en juego &middot; ${race.participants} ${race.participants === 1 ? "participante" : "participantes"}</div>
                    </div>
                </div>
                <div class="race-options">${race.options.map((option) => optionMarkup(race, option)).join("")}</div>
                ${betPanel}
                ${staffPanel}
            </article>`;
    }

    function selectedOptionFor(raceId) {
        const el = racesList.querySelector(`.race-option.selected[data-race-id="${raceId}"]`);
        return el ? Number(el.dataset.optionId) : null;
    }

    async function loadRaces() {
        try {
            const query = user && user.id ? `?user_id=${user.id}` : "";
            const response = await fetch(`/api/races${query}`);
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || "No fue posible cargar las carreras.");
            racesList.innerHTML = data.races.length
                ? data.races.map(raceCard).join("")
                : '<div class="surface-card empty-products"><h3>No hay carreras</h3><p>Vuelve pronto por nuevas fechas.</p></div>';
        } catch (error) {
            racesList.innerHTML = `<div class="surface-card empty-products"><h3>Error</h3><p>${escapeHTML(error.message)}</p></div>`;
        }
    }

    async function loadLeaderboard() {
        try {
            const response = await fetch("/api/races/leaderboard");
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.error || "No fue posible cargar el ranking.");
            leaderboardList.innerHTML = data.leaderboard.length
                ? data.leaderboard.map((row, index) => `
                    <li>
                        <span class="leaderboard-rank">${index + 1}</span>
                        <span class="leaderboard-name">${escapeHTML(row.first_name || row.username)}</span>
                        <span class="leaderboard-coins"><i class="fa-solid fa-coins"></i> ${row.coins}</span>
                    </li>`).join("")
                : '<li class="leaderboard-empty">Aun no hay participantes.</li>';
        } catch (error) {
            leaderboardList.innerHTML = `<li class="leaderboard-empty">${escapeHTML(error.message)}</li>`;
        }
    }

    racesList.addEventListener("click", async (event) => {
        const option = event.target.closest(".race-option");
        if (option && option.closest(".race-card--open")) {
            const raceId = option.dataset.raceId;
            racesList.querySelectorAll(`.race-option[data-race-id="${raceId}"]`).forEach((el) => el.classList.remove("selected"));
            option.classList.add("selected");
            return;
        }

        const settleBtn = event.target.closest(".race-staff__settle");
        if (settleBtn) {
            const panel = settleBtn.closest(".race-staff");
            const select = panel.querySelector(".race-staff__winner");
            const winnerName = select.options[select.selectedIndex].text;
            if (!window.confirm(`Cerrar la carrera con ${winnerName} como ganador? Esto reparte los PitCoins y no se puede deshacer.`)) return;
            settleBtn.disabled = true;
            try {
                const response = await fetch(`/api/races/${panel.dataset.raceId}/result`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.id, winner_option_id: Number(select.value) }),
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || "No fue posible cerrar la carrera.");
                await refreshWallet();
                await Promise.all([loadRaces(), loadLeaderboard()]);
            } catch (error) {
                window.alert(error.message);
                settleBtn.disabled = false;
            }
            return;
        }

        const submitBtn = event.target.closest(".bet-submit");
        if (submitBtn) {
            const panel = submitBtn.closest(".race-bet-panel");
            const raceId = panel.dataset.raceId;
            const note = panel.querySelector(".race-bet-panel__note");

            if (!user || !user.id) {
                window.location.href = "auth.html";
                return;
            }
            const optionId = selectedOptionFor(raceId);
            if (!optionId) {
                note.textContent = "Selecciona un piloto antes de pronosticar.";
                note.className = "race-bet-panel__note error";
                return;
            }
            const amount = Number(panel.querySelector(".bet-amount-input").value || 0);
            submitBtn.disabled = true;
            try {
                const response = await fetch(`/api/races/${raceId}/bet`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: user.id, option_id: optionId, amount }),
                });
                const data = await response.json();
                if (!response.ok || !data.success) throw new Error(data.error || "No fue posible registrar el pronostico.");
                user = { ...user, coins: data.user.coins };
                setUser(user);
                await Promise.all([loadRaces(), loadLeaderboard(), refreshWallet()]);
            } catch (error) {
                note.textContent = error.message;
                note.className = "race-bet-panel__note error";
                submitBtn.disabled = false;
            }
        }
    });

    // Primero el saldo (trae tambien si el usuario es staff), luego las carreras.
    await refreshWallet();
    await Promise.all([loadRaces(), loadLeaderboard()]);
});
