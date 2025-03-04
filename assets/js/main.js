document.addEventListener("DOMContentLoaded", () => {
    // ========================= SIDEBAR FUNCTION =========================
    const toggleActive = (element) => element?.classList.toggle("active");

    const setupToggle = (openId, closeId, sideSelector) => {
        const sideElement = document.querySelector(sideSelector);
        const openButton = document.getElementById(openId);
        const closeButton = document.getElementById(closeId);

        [openButton, closeButton].forEach(btn => 
            btn?.addEventListener("click", () => toggleActive(sideElement))
        );

        document.addEventListener("click", ({ target }) => {
            if (!sideElement?.contains(target) && !openButton?.contains(target)) {
                sideElement?.classList.remove("active");
            }
        });
    };

    setupToggle("leftOpen", "leftClose", ".sidebar--left");
    setupToggle("rightOpen", "rightClose", ".sidebar--right");

    // ========================= SWITCH THEMES =========================
    const switchTheme = document.getElementById("switchTheme");

    const applyTheme = (theme) => {
        document.documentElement.setAttribute("data-theme", theme);
        switchTheme?.querySelector("i")?.classList.replace(
            theme === "dark" ? "bi-sun" : "bi-moon",
            theme === "dark" ? "bi-moon" : "bi-sun"
        );
        sessionStorage.setItem("theme", theme);

        // 🔄 Kirim perubahan tema ke Giscus
        sendMessageToGiscus(theme);
    };

    // 🔄 Kirim pesan ke Giscus untuk mengubah tema
    const sendMessageToGiscus = (theme) => {
        const iframe = document.querySelector("iframe.giscus-frame");
        if (iframe) {
            iframe.contentWindow.postMessage(
                { giscus: { setConfig: { theme } } },
                "https://giscus.app"
            );
        }
    };

    // 🔄 Terapkan tema saat halaman dimuat
    applyTheme(sessionStorage.getItem("theme") || 
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

    // 🔄 Event listener untuk mengubah tema
    switchTheme?.addEventListener("click", () => {
        applyTheme(document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    // ========================= COLLAPSE FUNCTIONALITY =========================
    const collapseButtons = document.querySelectorAll(".btn--collapse");
    const collapseAllButton = document.getElementById("toggleCollapseAll");
    let allCollapsed = false;

    const toggleIcon = (icon, isCollapsed) => {
        icon?.classList.replace(isCollapsed ? "bi-folder2" : "bi-folder2-open", 
                                isCollapsed ? "bi-folder2-open" : "bi-folder2");
    };

    const toggleFolderCollapse = (folder, isCollapsed) => {
        const sublist = folder.querySelector(".nav__list--collapse");
        if (sublist) {
            sublist.classList.toggle("collapsed", isCollapsed);
            sessionStorage.setItem(`collapsed_${folder.dataset.id}`, isCollapsed);
            toggleIcon(folder.querySelector(".btn--collapse i"), isCollapsed);
        }
    };

    collapseButtons.forEach(button => {
        button.addEventListener("click", function () {
            const parentItem = this.closest(".nav__item--folder");
            if (parentItem) {
                const isCollapsed = parentItem.querySelector(".nav__list--collapse")
                    .classList.toggle("collapsed");
                sessionStorage.setItem(`collapsed_${parentItem.dataset.id}`, isCollapsed);
                toggleIcon(this.querySelector("i"), isCollapsed);
            }
        });
    });

    document.querySelectorAll(".nav__item--folder").forEach(folder => {
        toggleFolderCollapse(folder, sessionStorage.getItem(`collapsed_${folder.dataset.id}`) === "true");
    });

    collapseAllButton?.addEventListener("click", function () {
        allCollapsed = !allCollapsed;
        document.querySelectorAll(".nav__item--folder")
            .forEach(folder => toggleFolderCollapse(folder, allCollapsed));
        toggleIcon(collapseAllButton.querySelector("i"), allCollapsed);
    });

    // ============================ COPY DATA-LANG ============================
    const updateDataLang = () => {
        document.querySelectorAll(".highlight pre code[data-lang]").forEach(code => {
            const highlightDiv = code.closest(".highlight");
            if (highlightDiv && !highlightDiv.hasAttribute("data-lang")) {
                highlightDiv.setAttribute("data-lang", code.getAttribute("data-lang"));
            }
        });
    };
    
    updateDataLang();
    const observer = new MutationObserver(updateDataLang);
    observer.observe(document.body, { childList: true, subtree: true });
    
    //============================ JAM ============================
    function updateTime() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric'
        });
        const timeString = now.toLocaleTimeString('en-EN');
        document.getElementById("real-time-clock").textContent = `${dateString} | ${timeString}`;
        requestAnimationFrame(updateTime);
    }
    updateTime();
});