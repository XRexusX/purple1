/* Conversor de moneda: los precios en la base de datos estan en EUR (precio
   base). Este modulo los convierte a la moneda que el usuario elija, con
   tasas de referencia aproximadas (no en tiempo real: son fijas, pensadas
   para un prototipo/proyecto de universidad, no para cobros reales). */
(function () {
    const CURRENCIES = {
        COP: { symbol: "$", label: "Peso colombiano (COP)", rate: 4400, locale: "es-CO", decimals: 0 },
        EUR: { symbol: "€", label: "Euro (EUR)", rate: 1, locale: "de-DE", decimals: 2 },
        USD: { symbol: "US$", label: "Dolar estadounidense (USD)", rate: 1.08, locale: "en-US", decimals: 2 },
        MXN: { symbol: "MX$", label: "Peso mexicano (MXN)", rate: 21.5, locale: "es-MX", decimals: 0 },
        ARS: { symbol: "AR$", label: "Peso argentino (ARS)", rate: 1450, locale: "es-AR", decimals: 0 },
        CLP: { symbol: "CL$", label: "Peso chileno (CLP)", rate: 1050, locale: "es-CL", decimals: 0 },
        PEN: { symbol: "S/", label: "Sol peruano (PEN)", rate: 4.1, locale: "es-PE", decimals: 2 },
        BRL: { symbol: "R$", label: "Real brasileno (BRL)", rate: 6.2, locale: "pt-BR", decimals: 2 },
        GBP: { symbol: "£", label: "Libra esterlina (GBP)", rate: 0.86, locale: "en-GB", decimals: 2 },
    };
    const STORAGE_KEY = "purple1_currency";
    const EVENT_NAME = "purple1:currencychange";

    function getCurrentCode() {
        const stored = localStorage.getItem(STORAGE_KEY);
        return CURRENCIES[stored] ? stored : "COP";
    }

    function setCurrentCode(code) {
        if (!CURRENCIES[code]) return;
        localStorage.setItem(STORAGE_KEY, code);
        window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }

    function formatMoney(eurValue) {
        const code = getCurrentCode();
        const currency = CURRENCIES[code];
        const converted = Number(eurValue || 0) * currency.rate;
        const formatted = converted.toLocaleString(currency.locale, {
            minimumFractionDigits: currency.decimals,
            maximumFractionDigits: currency.decimals,
        });
        return `${currency.symbol} ${formatted}`;
    }

    function applyStaticPrices(root) {
        (root || document).querySelectorAll("[data-price-eur]").forEach((el) => {
            el.textContent = formatMoney(el.dataset.priceEur);
        });
    }

    function renderSwitcher() {
        const icons = document.querySelector(".nav-icons");
        if (!icons || icons.querySelector(".currency-switcher")) return;
        const select = document.createElement("select");
        select.className = "currency-switcher";
        select.title = "Cambiar moneda";
        select.innerHTML = Object.entries(CURRENCIES)
            .map(([code, info]) => `<option value="${code}">${code} · ${info.label.split(" (")[0]}</option>`)
            .join("");
        select.value = getCurrentCode();
        select.addEventListener("change", () => setCurrentCode(select.value));
        icons.insertBefore(select, icons.firstChild);
    }

    document.addEventListener("DOMContentLoaded", () => {
        renderSwitcher();
        applyStaticPrices();
    });
    window.addEventListener(EVENT_NAME, () => applyStaticPrices());

    window.Purple1Currency = { CURRENCIES, getCurrentCode, setCurrentCode, formatMoney, applyStaticPrices, EVENT_NAME };
})();
