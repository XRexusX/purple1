document.addEventListener("DOMContentLoaded", () => {
    const panel = document.querySelector(".cart-items-panel");
    const summary = document.querySelector(".summary-card");

    function currentUser() {
        try { return JSON.parse(localStorage.getItem("purple1_user")); } catch { return null; }
    }

    function money(value) {
        return window.Purple1Currency.formatMoney(value);
    }

    async function request(url, options = {}) {
        const response = await fetch(url, options);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "Error de carrito.");
        return data;
    }

    async function loadCart() {
        const user = currentUser();
        if (!user) {
            panel.innerHTML = '<div class="surface-card empty-products"><h3>Inicia sesion</h3><p>Necesitas iniciar sesion para ver tu carrito.</p><a href="auth.html" class="btn-primary">Iniciar sesion</a></div>';
            return;
        }
        const data = await request(`/api/cart?user_id=${user.id}`);
        const cart = data.cart;
        panel.innerHTML = '<div class="shipping-banner"><span>Envio gratis</span><p><strong>Tienes envio gratis.</strong> Completa tu pedido y recibelo en 1-2 dias.</p></div>' +
            (cart.items.length ? cart.items.map(item => `<article class="cart-item surface-card">
                <div class="cart-item-image"><img src="${item.image_path}" alt="${item.product_name}"></div>
                <div class="cart-item-content">
                    <div class="cart-item-top">
                        <div><h3>${item.product_name}</h3><span class="badge-offer">${[item.size_name, item.color_name].filter(Boolean).join(" / ") || "Producto"}</span></div>
                        <div class="cart-item-price-box"><p class="current-price">${money(item.subtotal)}</p></div>
                        <button class="remove-btn" type="button" data-id="${item.id}" aria-label="Eliminar producto"><i class="fa-regular fa-trash-can"></i></button>
                    </div>
                    <div class="cart-item-actions"><input class="cart-qty" type="number" min="1" max="${item.stock}" value="${item.quantity}" data-id="${item.id}"></div>
                    <div class="cart-meta"><p><i class="fa-solid fa-cart-shopping"></i> Stock disponible <span>- ${item.stock}</span></p></div>
                </div>
            </article>`).join("") : '<div class="surface-card empty-products"><h3>Tu carrito esta vacio</h3><p>Agrega productos desde la tienda.</p></div>') +
            '<div class="continue-shopping"><a href="products.html">Seguir comprando <i class="fa-solid fa-chevron-right"></i></a></div>';
        summary.querySelector(".summary-lines").innerHTML = `<div class="summary-line"><span>Subtotal</span><span>${money(cart.total)}</span></div><div class="summary-line"><span>Envio</span><span>Gratis</span></div>`;
        summary.querySelector(".summary-total").innerHTML = `<span>Total</span><span>${money(cart.total)}</span>`;

        document.querySelectorAll(".cart-qty").forEach(input => input.addEventListener("change", async () => {
            await request("/api/cart/update", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id, cart_item_id: input.dataset.id, quantity: input.value }) });
            loadCart();
        }));
        document.querySelectorAll(".remove-btn").forEach(btn => btn.addEventListener("click", async () => {
            await request("/api/cart/remove", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: user.id, cart_item_id: btn.dataset.id }) });
            loadCart();
        }));
        const modal = document.querySelector("#payment-modal");
        const form = document.querySelector("#payment-form");
        const errorBox = document.querySelector("#pm-error");
        const submitBtn = document.querySelector("#pm-submit");

        function openModal() {
            errorBox.hidden = true;
            form.reset();
            form.querySelectorAll("input").forEach((el) => el.classList.remove("field-valid"));
            modal.hidden = false;
        }
        function closeModal() {
            modal.hidden = true;
        }
        modal?.querySelectorAll("[data-close-modal]").forEach((el) => el.addEventListener("click", closeModal));

        document.querySelector("#pm-number")?.addEventListener("input", (event) => {
            event.target.value = event.target.value.replace(/[^\d]/g, "").replace(/(.{4})/g, "$1 ").trim().slice(0, 19);
        });
        document.querySelector("#pm-expiry")?.addEventListener("input", (event) => {
            event.target.value = event.target.value.replace(/[^\d]/g, "").replace(/(\d{2})(\d{0,2})/, (m, a, b) => (b ? `${a}/${b}` : a)).slice(0, 5);
        });

        function markValid(input, isValid) {
            input.classList.toggle("field-valid", isValid);
        }
        const pmHolder = document.querySelector("#pm-holder");
        const pmNumber = document.querySelector("#pm-number");
        const pmExpiry = document.querySelector("#pm-expiry");
        const pmCvv = document.querySelector("#pm-cvv");

        pmHolder?.addEventListener("input", () => markValid(pmHolder, pmHolder.value.trim().length >= 3));
        pmNumber?.addEventListener("input", () => markValid(pmNumber, pmNumber.value.replace(/\D/g, "").length >= 13));
        pmExpiry?.addEventListener("input", () => {
            const match = /^(\d{2})\/(\d{2})$/.exec(pmExpiry.value);
            const validFormat = match && Number(match[1]) >= 1 && Number(match[1]) <= 12;
            markValid(pmExpiry, Boolean(validFormat));
        });
        pmCvv?.addEventListener("input", () => markValid(pmCvv, /^\d{3,4}$/.test(pmCvv.value)));

        document.querySelector(".checkout-btn")?.addEventListener("click", openModal);

        form?.addEventListener("submit", async (event) => {
            event.preventDefault();
            errorBox.hidden = true;
            submitBtn.disabled = true;
            submitBtn.textContent = "Procesando...";
            try {
                const result = await request("/api/payments/simulate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: user.id,
                        shipping_address: user.address || "",
                        card_holder: document.querySelector("#pm-holder").value,
                        card_number: document.querySelector("#pm-number").value,
                        card_expiry: document.querySelector("#pm-expiry").value,
                        card_cvv: document.querySelector("#pm-cvv").value,
                    }),
                });
                closeModal();
                if (result.approved) {
                    alert(`Pago aprobado (simulado). ${result.card_brand} terminada en ${result.card_last4}. Pedido #${result.order.id} confirmado.`);
                } else {
                    alert(`Pago rechazado (simulado): ${result.reason || "revisa los datos de la tarjeta."}`);
                }
                loadCart();
            } catch (error) {
                errorBox.textContent = error.message;
                errorBox.hidden = false;
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = "Pagar";
            }
        });
    }

    loadCart().catch(error => {
        panel.innerHTML = `<div class="surface-card empty-products"><h3>Error</h3><p>${error.message}</p></div>`;
    });

    window.addEventListener(window.Purple1Currency.EVENT_NAME, () => loadCart().catch(() => {}));
});
