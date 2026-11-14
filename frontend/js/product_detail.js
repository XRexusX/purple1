document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const title = document.querySelector(".product-title");
    const priceMain = document.querySelector(".price-main");
    const stockText = document.querySelector(".stock-text");
    const mainImage = document.querySelector(".main-product-image");
    const thumbsRow = document.querySelector(".thumbs-row");
    const sizesGrid = document.querySelector(".sizes-grid");
    const addButton = document.querySelector(".add-cart-btn");
    const description = document.querySelector(".accordion-item.open .accordion-content");
    let selectedInventory = null;
    let currentProduct = null;

    function user() {
        try { return JSON.parse(localStorage.getItem("purple1_user")); } catch { return null; }
    }

    function money(value) {
        return window.Purple1Currency.formatMoney(value);
    }

    function bindThumbs() {
        document.querySelectorAll(".thumb").forEach((thumb) => {
            thumb.addEventListener("click", () => {
                document.querySelectorAll(".thumb").forEach(t => t.classList.remove("active"));
                thumb.classList.add("active");
                const img = thumb.querySelector("img");
                mainImage.src = img.src;
                mainImage.alt = img.alt;
            });
        });
    }

    document.querySelectorAll(".accordion-header").forEach((trigger) => {
        trigger.addEventListener("click", () => trigger.closest(".accordion-item").classList.toggle("open"));
    });

    if (!id) {
        title.textContent = "Producto no encontrado";
        return;
    }

    try {
        const response = await fetch(`/api/products/${id}`);
        const data = await response.json();
        if (!response.ok || !data.success) throw new Error(data.error || "No se pudo cargar el producto.");
        const product = data.product;
        currentProduct = product;
        selectedInventory = product.inventory.find(i => i.stock > 0) || product.inventory[0];
        if (!selectedInventory && addButton) {
            addButton.disabled = true;
            addButton.textContent = "Sin inventario";
        }

        title.textContent = product.name;
        priceMain.textContent = money(product.final_price);
        stockText.textContent = Number(product.total_stock || 0) > 0 ? `${product.total_stock} unidades disponibles` : "Sin stock";
        if (description) description.textContent = product.description || "Producto Purple One.";

        const images = product.images.length ? product.images : [{ image_path: product.main_image, alt_text: product.name }];
        mainImage.src = images[0].image_path;
        mainImage.alt = images[0].alt_text || product.name;
        thumbsRow.innerHTML = images.map((image, index) => `<button class="thumb ${index === 0 ? "active" : ""}" type="button"><img src="${image.image_path}" alt="${image.alt_text || product.name}"></button>`).join("");
        bindThumbs();

        sizesGrid.innerHTML = product.inventory.map((item) => {
            const label = [item.size_name, item.color_name].filter(Boolean).join(" / ") || item.sku;
            const active = selectedInventory && item.id === selectedInventory.id ? "active" : "";
            return `<button class="size-btn ${active}" type="button" data-inventory="${item.id}" ${item.stock < 1 ? "disabled" : ""}>${label}</button>`;
        }).join("");
        document.querySelectorAll(".size-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                document.querySelectorAll(".size-btn").forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                selectedInventory = product.inventory.find(i => String(i.id) === btn.dataset.inventory);
                priceMain.textContent = money(selectedInventory.effective_price);
                stockText.textContent = selectedInventory.stock > 0 ? `${selectedInventory.stock} unidades disponibles` : "Sin stock";
            });
        });

        addButton.addEventListener("click", async (event) => {
            event.preventDefault();
            if (!selectedInventory || selectedInventory.stock < 1) {
                throw new Error("No hay inventario disponible para este producto.");
            }
            const currentUser = user();
            if (!currentUser) {
                window.location.href = "auth.html";
                return;
            }
            const res = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ user_id: currentUser.id, inventory_id: selectedInventory.id, quantity: 1 })
            });
            const cartData = await res.json();
            if (!res.ok || !cartData.success) throw new Error(cartData.error || "No se pudo agregar al carrito.");
            window.location.href = "cart.html";
        });
    } catch (error) {
        title.textContent = error.message;
    }

    window.addEventListener(window.Purple1Currency.EVENT_NAME, () => {
        if (!currentProduct) return;
        priceMain.textContent = money(selectedInventory ? selectedInventory.effective_price : currentProduct.final_price);
    });
});
