document.addEventListener("DOMContentLoaded", () => {
    document.querySelector("form")?.addEventListener("submit", async (event) => {
        event.preventDefault();
        const response = await fetch("/api/auth/forgot-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                identifier: document.getElementById("identifier").value,
                new_password: document.getElementById("new-password").value,
                password_confirm: document.getElementById("password-confirm").value
            })
        });
        const data = await response.json();
        alert(data.success ? "Contrasena actualizada." : data.error);
        if (data.success) window.location.href = "auth.html";
    });
});
