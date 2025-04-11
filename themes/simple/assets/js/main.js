/*!
 * Custom Script for []
 * Author: Putra Jaya
 * License: MIT
 */
// === Sidebar Logic ===
// Optimized and Modular JavaScript UI Script
const BREAKPOINT = 48 * 16;
const SIDEBAR_ATTR = "data-sidebar";
const TOGGLE_ATTR = "data-toggle-sidebar";
const HIDE_BTN_ATTR = "data-button-hidden";
const CLASS_OPEN = "is-open";
const CLASS_BTN_HIDDEN = "btn--sidebar-hidden";

const sidebars = Array.from(document.querySelectorAll(`[${SIDEBAR_ATTR}]`));
const toggles = Array.from(document.querySelectorAll(`[${TOGGLE_ATTR}]`));
const toggleMap = new Map();
const htmlEl = document.documentElement;
const documentBody = document.body;
const backToTopBtn = document.getElementById("backToTop");
const loader = document.getElementById("loader");
const toggleAllBtn = document.getElementById("toggle-all-collapse");
const switchBtn = document.getElementById("switchTheme");
const iconEl = switchBtn?.querySelector("i.bi");

const FOLDER_STATE_KEY = "collapsedFolders";
const ALL_COLLAPSE_KEY = "allCollapsed";
const THEME_KEY = "user-theme";
const MIN_DURATION = 500;

const storage = {
  get(key, fallback = null) {
    try {
      return JSON.parse(localStorage.getItem(key)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  },
  getRaw(key) {
    return localStorage.getItem(key);
  },
  setRaw(key, value) {
    localStorage.setItem(key, value);
  },
  remove(key) {
    localStorage.removeItem(key);
  },
};

function isDesktop() {
  return window.innerWidth >= BREAKPOINT;
}

toggles.forEach((btn) => {
  const target = btn.getAttribute(TOGGLE_ATTR);
  if (!toggleMap.has(target)) toggleMap.set(target, []);
  toggleMap.get(target).push(btn);
});

function updateButtonVisibility(targetName, isOpen) {
  const buttons = toggleMap.get(targetName) || [];
  buttons.forEach((btn) => {
    const hideOnOpen = btn.hasAttribute(HIDE_BTN_ATTR);
    if (isDesktop() && hideOnOpen) {
      btn.classList.toggle(CLASS_BTN_HIDDEN, isOpen);
    } else {
      btn.classList.remove(CLASS_BTN_HIDDEN);
    }
  });
}

function openSidebar(el, targetName) {
  el.classList.add(CLASS_OPEN);
  if (isDesktop()) storage.setRaw(`sidebar:${targetName}`, "open");
  updateButtonVisibility(targetName, true);
}

function closeSidebar(el, targetName) {
  el.classList.remove(CLASS_OPEN);
  if (isDesktop()) storage.setRaw(`sidebar:${targetName}`, "closed");
  updateButtonVisibility(targetName, false);
}

function toggleSidebar(targetName) {
  const el = document.querySelector(`[${SIDEBAR_ATTR}="${targetName}"]`);
  if (!el) return;
  el.classList.contains(CLASS_OPEN)
    ? closeSidebar(el, targetName)
    : openSidebar(el, targetName);
}

function initSidebarState() {
  sidebars.forEach((el) => {
    const name = el.getAttribute(SIDEBAR_ATTR);
    const savedState = storage.getRaw(`sidebar:${name}`);

    if (isDesktop()) {
      savedState === "closed" ? closeSidebar(el, name) : openSidebar(el, name);
    } else {
      closeSidebar(el, name);
    }
  });
}

toggles.forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = btn.getAttribute(TOGGLE_ATTR);
    toggleSidebar(target);
  });
});

let lastIsDesktop = isDesktop();
function debounce(fn, delay = 200) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

window.addEventListener(
  "resize",
  debounce(() => {
    const nowIsDesktop = isDesktop();
    if (nowIsDesktop !== lastIsDesktop) {
      lastIsDesktop = nowIsDesktop;
      initSidebarState();
    }
  })
);

document.addEventListener("click", (event) => {
  if (isDesktop()) return;
  sidebars.forEach((el) => {
    const name = el.getAttribute(SIDEBAR_ATTR);
    if (!el.classList.contains(CLASS_OPEN)) return;

    const clickedInside = el.contains(event.target);
    const clickedToggle = toggles.some(
      (btn) =>
        btn.getAttribute(TOGGLE_ATTR) === name && btn.contains(event.target)
    );

    if (!clickedInside && !clickedToggle) closeSidebar(el, name);
  });
});

// === Folder Collapse ===
const collapsedMap = storage.get(FOLDER_STATE_KEY, {});

function updateFolderIcon(key, collapsed) {
  const btn = document.querySelector(`[data-toggle-collapse="${key}"]`);
  const icon = btn?.querySelector("i.bi");
  if (!icon) return;
  icon.classList.toggle("bi-folder2", collapsed);
  icon.classList.toggle("bi-folder2-open", !collapsed);
}

function updateGlobalIcon(allCollapsed) {
  const icon = toggleAllBtn?.querySelector("i.bi");
  if (!icon) return;
  icon.classList.toggle("bi-folder2", allCollapsed);
  icon.classList.toggle("bi-folder2-open", !allCollapsed);
}

document.querySelectorAll("[data-collapse]").forEach((ul) => {
  const key = ul.dataset.collapse;
  const isCollapsed = key in collapsedMap ? collapsedMap[key] : true;
  ul.classList.toggle("is-collapse", isCollapsed);
  updateFolderIcon(key, isCollapsed);
});

documentBody.addEventListener("click", (e) => {
  const toggle = e.target.closest("[data-toggle-collapse]");
  if (!toggle) return;

  const key = toggle.dataset.toggleCollapse;
  const target = document.querySelector(`[data-collapse="${key}"]`);
  if (!target) return;

  const collapsed = target.classList.toggle("is-collapse");
  collapsedMap[key] = collapsed;
  storage.set(FOLDER_STATE_KEY, collapsedMap);
  updateFolderIcon(key, collapsed);
});

toggleAllBtn?.addEventListener("click", () => {
  const allCollapsed = toggleAllBtn.classList.toggle("collapsed-mode");
  document.querySelectorAll("[data-collapse]").forEach((ul) => {
    const key = ul.dataset.collapse;
    ul.classList.toggle("is-collapse", allCollapsed);
    collapsedMap[key] = allCollapsed;
    updateFolderIcon(key, allCollapsed);
  });
  storage.set(FOLDER_STATE_KEY, collapsedMap);
  storage.setRaw(ALL_COLLAPSE_KEY, allCollapsed ? "1" : "0");
  updateGlobalIcon(allCollapsed);
});

if (storage.getRaw(ALL_COLLAPSE_KEY) === "1") {
  toggleAllBtn?.classList.add("collapsed-mode");
  updateGlobalIcon(true);
}

// === Theme Switch ===
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function applyTheme(mode) {
  const theme =
    mode === "auto" ? (prefersDark.matches ? "dark" : "light") : mode;

  if (mode === "auto") storage.remove(THEME_KEY);
  else storage.setRaw(THEME_KEY, mode);

  htmlEl.setAttribute("data-theme", theme);
  updateIcon(mode);
}

function updateIcon(mode) {
  iconEl?.classList.remove("bi-sun", "bi-moon-stars-fill", "bi-circle-half");
  iconEl?.classList.add(
    mode === "light"
      ? "bi-sun"
      : mode === "dark"
      ? "bi-moon-stars-fill"
      : "bi-circle-half"
  );
}

function getNextMode(current) {
  return current === "auto" ? "light" : current === "light" ? "dark" : "auto";
}

switchBtn?.addEventListener("click", () => {
  const current = storage.getRaw(THEME_KEY) || "auto";
  applyTheme(getNextMode(current));
});

applyTheme(storage.getRaw(THEME_KEY) || "auto");

prefersDark.addEventListener("change", () => {
  if (!storage.getRaw(THEME_KEY)) applyTheme("auto");
});

// === Nav Link Highlight ===
const navLinks = document.querySelectorAll("[data-href]");
const currentPath = window.location.pathname.replace(/\/+\$/, "");

let bestMatch = null;
let bestLength = 0;

navLinks.forEach((link) => {
  const href = link.getAttribute("data-href").replace(/\/+\$/, "");
  if (
    (currentPath === href || currentPath.startsWith(href + "/")) &&
    href.length > bestLength
  ) {
    bestMatch = link;
    bestLength = href.length;
  }
});

bestMatch?.classList.add("nav__link--active");

// === TOC Observer ===
const tocLinks = document.querySelectorAll(".nav__link--toc");
const headingTargets = Array.from(tocLinks)
  .map((link) => {
    const id = decodeURIComponent(link.hash.slice(1));
    const target = document.getElementById(id);
    return target ? { id, target } : null;
  })
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    const entry = entries.find(
      (e) => e.isIntersecting && e.intersectionRatio > 0
    );
    if (!entry) return;
    const id = entry.target.id;
    tocLinks.forEach((link) => {
      const match = decodeURIComponent(link.hash.slice(1)) === id;
      link.classList.toggle("nav__link--active", match);
    });
  },
  {
    rootMargin: "0px 0px -70% 0px",
    threshold: [0.1, 0.5, 1.0],
  }
);

headingTargets.forEach(({ target }) => observer.observe(target));

// === Back To Top ===
window.addEventListener("scroll", () => {
  if (window.scrollY > 1000) {
    backToTopBtn?.classList.add("show");
  } else {
    backToTopBtn?.classList.remove("show");
  }
});

backToTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0 });
});

// === Loader ===
loader.classList.add("show");
const start = Date.now();
window.addEventListener("load", () => {
  const elapsed = Date.now() - start;
  const delay = Math.max(0, MIN_DURATION - elapsed);
  setTimeout(() => {
    loader.classList.remove("show");
    loader.classList.add("hide");
  }, delay);
});

document.querySelectorAll("a[href]").forEach((link) => {
  const url = link.getAttribute("href");
  if (url && !url.startsWith("#") && !url.startsWith("javascript:")) {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      loader.classList.remove("hide");
      loader.classList.add("show");
      setTimeout(() => (window.location.href = url), 100);
    });
  }
});

initSidebarState();

// === Search ===
const initSearch = async () => {
  const $ = (s) => document.querySelector(s);
  const searchForm = $("#search");
  const searchInput = $("#search-input");
  const resultsPanel = $("#resultsPanel");
  const resultsContainer = $("#results");

  if (!searchForm || !searchInput || !resultsPanel || !resultsContainer) {
    console.error("Elemen pencarian tidak lengkap.");
    return;
  }

  const searchUrl = searchForm.getAttribute("data-search-url");
  if (!searchUrl) return console.error("Data URL pencarian tidak ditemukan.");

  try {
    const response = await fetch(searchUrl);
    const store = await response.json();

    if (!Array.isArray(store))
      throw new Error("Format data pencarian tidak valid.");

    const idx = lunr(function () {
      this.ref("id");
      this.field("title", { boost: 40 });
      this.field("tags", { boost: 30 });
      this.field("description", { boost: 20 });
      this.field("category", { boost: 10 });
      this.field("content");
      store.forEach((doc) => this.add(doc));
    });

    const displayResults = (results, query) => {
      if (!query) {
        resultsPanel.style.display = "none";
        resultsContainer.innerHTML = "";
        return;
      }

      resultsPanel.style.display = "block";
      resultsContainer.innerHTML = results.length
        ? results
            .map((r) => {
              const doc = store.find((d) => d.id === r.ref);
              return doc
                ? `<li class="nav__item"><a class="nav__link nav__link--file" href="${doc.url}"><i class="bi bi-file-earmark-text"></i>${doc.title}</a></li>`
                : "";
            })
            .join("")
        : '<li class="nav__item">No results found.</li>';
    };

    const doSearch = (query) => {
      const trimmed = query.trim();
      const results = trimmed ? idx.search(`*${trimmed}* ${trimmed}~1`) : [];
      displayResults(results, trimmed);
    };

    const debounce = (fn, delay = 300) => {
      let t;
      return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
      };
    };

    // Listen to input events
    searchInput.addEventListener(
      "input",
      debounce(() => {
        doSearch(searchInput.value);
      })
    );

    // Support for query from URL
    const urlQuery = new URLSearchParams(window.location.search).get("query");
    if (urlQuery) {
      searchInput.value = urlQuery;
      doSearch(urlQuery);
    }
  } catch (err) {
    console.error("Gagal memuat index pencarian:", err);
  }
};

document.addEventListener("DOMContentLoaded", initSearch);