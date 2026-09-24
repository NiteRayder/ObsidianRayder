(() => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.textContent = open ? "Close" : "Menu";
    });

    nav.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        menuButton.setAttribute("aria-expanded", "false");
        menuButton.textContent = "Menu";
      });
    });
  }

  document.querySelectorAll("[data-current-year]").forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  const discordWidget = document.querySelector("[data-discord-widget]");
  if (discordWidget) {
    const endpoint = discordWidget.dataset.widgetUrl;
    const name = discordWidget.querySelector("[data-discord-name]");
    const description = discordWidget.querySelector("[data-discord-description]");
    const online = discordWidget.querySelector("[data-discord-online]");
    const channels = discordWidget.querySelector("[data-discord-channels]");
    const status = discordWidget.querySelector("[data-discord-status]");
    const statusWrap = discordWidget.querySelector(".discord-status");
    const invite = discordWidget.querySelector("[data-discord-invite]");

    fetch(endpoint, { headers: { Accept: "application/json" } })
      .then(response => {
        if (!response.ok) throw new Error("Discord widget request failed");
        return response.json();
      })
      .then(data => {
        name.textContent = data.name || "Discord";
        online.textContent = Number.isFinite(data.presence_count) ? data.presence_count : (data.members?.length ?? "—");
        channels.textContent = Array.isArray(data.channels) ? data.channels.length : "—";
        description.textContent = "Join the community and see what is happening on the server.";
        if (data.instant_invite) {
          invite.href = data.instant_invite;
        }
        status.textContent = "Online";
        statusWrap.classList.add("online");
      })
      .catch(() => {
        description.textContent = "Discord server information is temporarily unavailable.";
        status.textContent = "Unavailable";
      });
  }
})();