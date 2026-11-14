document.addEventListener("DOMContentLoaded", async () => {
    const grid = document.querySelector(".teams-grid");

    function escapeHTML(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function teamCard(team) {
        const image = team.logo_path || "img/escuderia.png";
        return `<article class="team-card surface-card">
            <div class="team-img"><img src="${escapeHTML(image)}" alt="${escapeHTML(team.name)}"></div>
            <h3>${escapeHTML(team.name)}</h3>
            <p>${escapeHTML(team.description || "Coleccion oficial Purple One.")}</p>
            <a href="products.html?team=${encodeURIComponent(team.slug)}" class="btn-team">Ver coleccion</a>
        </article>`;
    }

    try {
        const response = await fetch("/api/teams");
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "No fue posible cargar equipos.");
        grid.innerHTML = data.teams.length
            ? data.teams.map(teamCard).join("")
            : '<div class="surface-card empty-products"><h3>No hay equipos</h3><p>Agrega equipos en MySQL.</p></div>';
    } catch (error) {
        grid.innerHTML = `<div class="surface-card empty-products"><h3>Error</h3><p>${escapeHTML(error.message)}</p></div>`;
    }
});
