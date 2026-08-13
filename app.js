(() => {
  "use strict";

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  const drawer = $("#drawer");
  const menuButton = $("#menuButton");
  const closeMenuButton = $("#closeMenuButton");
  const drawerBackdrop = $("#drawerBackdrop");
  const createSheet = $("#createSheet");
  const toast = $("#toast");

  let toastTimer = null;

  const showToast = (message) => {
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("show");
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const setBodyModalState = () => {
    const open = drawer.classList.contains("open") || createSheet.classList.contains("open");
    document.body.classList.toggle("modal-open", open);
  };

  const openDrawer = () => {
    drawer.classList.add("open");
    drawer.setAttribute("aria-hidden", "false");
    menuButton.setAttribute("aria-expanded", "true");
    setBodyModalState();
  };

  const closeDrawer = () => {
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    menuButton.setAttribute("aria-expanded", "false");
    setBodyModalState();
  };

  const openCreateSheet = (title = "Choose a format") => {
    $("#sheetTitle").textContent = title;
    createSheet.classList.add("open");
    createSheet.setAttribute("aria-hidden", "false");
    setBodyModalState();
  };

  const closeCreateSheet = () => {
    createSheet.classList.remove("open");
    createSheet.setAttribute("aria-hidden", "true");
    setBodyModalState();
  };

  menuButton.addEventListener("click", openDrawer);
  closeMenuButton.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);

  $("#newDesignButton").addEventListener("click", () => openCreateSheet());
  $("#navCreateButton").addEventListener("click", () => openCreateSheet());

  $$("[data-close-sheet]").forEach((el) => el.addEventListener("click", closeCreateSheet));

  $$(".creation-card").forEach((card) => {
    card.addEventListener("click", () => {
      const type = card.dataset.type;
      const size = card.dataset.size;
      localStorage.setItem("washi:last-format", JSON.stringify({ type, size }));
      openCreateSheet(`${type} · ${size}`);
    });
  });

  $$(".format-list button").forEach((button) => {
    button.addEventListener("click", () => {
      const project = {
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
        type: button.dataset.format,
        size: button.dataset.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const projects = JSON.parse(localStorage.getItem("washi:projects") || "[]");
      projects.unshift(project);
      localStorage.setItem("washi:projects", JSON.stringify(projects.slice(0, 50)));

      closeCreateSheet();
      showToast(`${project.type} project created`);
    });
  });

  $$(".template-card").forEach((card) => {
    card.addEventListener("click", () => {
      showToast(`${card.dataset.template} selected`);
    });
  });

  const templateRow = $("#templateRow");
  $("#shuffleButton").addEventListener("click", () => {
    const cards = [...templateRow.children];
    if (cards.length > 1) {
      templateRow.append(cards[0]);
      showToast("Templates shuffled ✦");
    }
  });

  $$(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      $$(".nav-item").forEach((nav) => nav.classList.remove("active"));
      item.classList.add("active");
      const route = item.dataset.route;

      if (route === "Home") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        showToast(`${route} is ready for the next build`);
      }
    });
  });

  $$(".drawer-links button").forEach((button) => {
    button.addEventListener("click", () => {
      closeDrawer();
      showToast(`${button.dataset.route} is ready for the next build`);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeDrawer();
      closeCreateSheet();
    }
  });

  document.addEventListener("gesturestart", (event) => event.preventDefault(), { passive: false });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        console.warn("Service worker registration failed:", error);
      });
    });
  }
})();
