(() => {
  "use strict";

  const CONTACT_EMAIL = "REPLACE_WITH_YOUR_EMAIL@example.com";

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });

  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  if (menuButton && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.textContent = "Menu";
    };
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.textContent = open ? "Close" : "Menu";
    });
    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const discord = document.querySelector("[data-discord-widget]");
  if (discord) {
    const endpoint = discord.dataset.widgetUrl;
    const name = discord.querySelector("[data-discord-name]");
    const description = discord.querySelector("[data-discord-description]");
    const online = discord.querySelector("[data-discord-online]");
    const channels = discord.querySelector("[data-discord-channels]");
    const status = discord.querySelector("[data-discord-status]");
    const statusWrap = discord.querySelector(".discord-status");
    const invite = discord.querySelector("[data-discord-invite]");

    fetch(endpoint, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) })
      .then((response) => {
        if (!response.ok) throw new Error("Discord widget unavailable");
        return response.json();
      })
      .then((data) => {
        name.textContent = data.name || "Discord";
        online.textContent = Number.isFinite(data.presence_count) ? data.presence_count : "—";
        channels.textContent = Array.isArray(data.channels) ? data.channels.length : "—";
        description.textContent = "Join the community and see what is happening on the server.";
        if (data.instant_invite) invite.href = data.instant_invite;
        status.textContent = "Available";
        statusWrap.classList.add("online");
      })
      .catch(() => {
        description.textContent = "Public server information is temporarily unavailable. The invite link may still work.";
        status.textContent = "Unavailable";
      });
  }

  const form = document.querySelector("[data-mailto-form]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      if (CONTACT_EMAIL.startsWith("REPLACE_")) {
        const feedback = form.querySelector("[data-form-feedback]");
        if (feedback) {
          feedback.textContent = "The contact email has not been configured yet. Please use the Discord link below.";
          feedback.setAttribute("role", "status");
        }
        return;
      }

      const values = new FormData(form);
      const subject = encodeURIComponent(String(values.get("subject") || "ObsidianRayder inquiry").trim());
      const message = [
        "Name: " + String(values.get("name") || "").trim(),
        "Reply email: " + String(values.get("email") || "").trim(),
        "",
        String(values.get("message") || "").trim(),
      ].join("\n");
      window.location.href = "mailto:" + CONTACT_EMAIL +
        "?subject=" + subject + "&body=" + encodeURIComponent(message);
    });
  }

  const gallery = document.querySelector("[data-gallery]");
  if (gallery) initGallery(gallery);

  function initGallery(root) {
    const grid = root.querySelector("[data-gallery-grid]");
    const filters = root.querySelector("[data-gallery-filters]");
    const status = root.querySelector("[data-gallery-status]");
    const dialog = root.querySelector("[data-lightbox]");
    const lightboxImage = root.querySelector("[data-lightbox-image]");
    const lightboxTitle = root.querySelector("[data-lightbox-title]");
    const lightboxDescription = root.querySelector("[data-lightbox-description]");
    let items = [];
    let activeCategory = "All";

    const showStatus = (message) => { status.textContent = message; };
    const closeDialog = () => {
      if (dialog.open) dialog.close();
      lightboxImage.removeAttribute("src");
    };

    function renderFilters() {
      filters.replaceChildren();
      const categories = ["All", ...new Set(items.map((item) => item.category))];
      categories.forEach((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "filter-button" + (category === activeCategory ? " active" : "");
        button.textContent = category;
        button.setAttribute("aria-pressed", String(category === activeCategory));
        button.addEventListener("click", () => {
          activeCategory = category;
          renderFilters();
          renderItems();
        });
        filters.append(button);
      });
    }

    function openItem(item) {
      lightboxImage.src = item.url;
      lightboxImage.alt = item.alt || item.title;
      lightboxTitle.textContent = item.title;
      lightboxDescription.textContent = item.description || "";
      if (typeof dialog.showModal === "function") dialog.showModal();
      else window.open(item.url, "_blank", "noopener");
    }

    function renderItems() {
      grid.replaceChildren();
      const visible = activeCategory === "All" ? items : items.filter((item) => item.category === activeCategory);
      if (!visible.length) {
        showStatus(items.length ? "No artwork in this category yet." : "No artwork has been published yet.");
        return;
      }
      showStatus(visible.length + (visible.length === 1 ? " piece" : " pieces"));
      visible.forEach((item) => {
        const card = document.createElement("button");
        card.type = "button";
        card.className = "gallery-card";
        card.setAttribute("aria-label", "View " + item.title);
        const image = document.createElement("img");
        image.src = item.url;
        image.alt = item.alt || item.title;
        image.loading = "lazy";
        image.decoding = "async";
        image.addEventListener("error", () => {
          image.classList.add("image-unavailable");
          image.alt = "Image unavailable: " + item.title;
        });
        const caption = document.createElement("span");
        caption.className = "gallery-caption";
        const title = document.createElement("strong");
        title.textContent = item.title;
        const category = document.createElement("span");
        category.textContent = item.category;
        caption.append(title, category);
        card.append(image, caption);
        card.addEventListener("click", () => openItem(item));
        grid.append(card);
      });
    }

    root.querySelectorAll("[data-lightbox-close]").forEach((button) => button.addEventListener("click", closeDialog));
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog();
    });
    dialog.addEventListener("close", () => lightboxImage.removeAttribute("src"));

    fetch("/api/gallery", { headers: { Accept: "application/json" } })
      .then((response) => {
        if (!response.ok) throw new Error("Gallery request failed");
        return response.json();
      })
      .then((data) => {
        items = Array.isArray(data.items) ? data.items : [];
        renderFilters();
        renderItems();
      })
      .catch(() => {
        filters.replaceChildren();
        grid.replaceChildren();
        showStatus("The gallery could not load. Please try again later.");
      });
  }
})();
