document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("purple1_user") || "null");
    document.querySelector(".cp-form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!user) return window.location.href = "auth.html";
        const response = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user_id: user.id,
                current_password: document.querySelector('[name="current_password"]').value,
                new_password: document.querySelector('[name="new_password"]').value,
                password_confirm: document.querySelector('[name="password_confirm"]').value
            })
        });
        const data = await response.json();
        alert(data.success ? "Contrasena actualizada." : data.error);
    });
});
