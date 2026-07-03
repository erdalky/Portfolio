document.addEventListener("DOMContentLoaded", () => {
  const body        = document.body;
  const menuToggle  = document.getElementById("menu-toggle");
  const mainNav     = document.getElementById("main-nav");
  const themeToggle = document.getElementById("theme-toggle");

  // ── Theme ──────────────────────────────────────────────────────────────────
  // Default to dark; only switch if user saved light
  const savedDark = localStorage.getItem("darkMode");
  if (savedDark === "false") {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
  } else {
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
  }

  themeToggle.addEventListener("click", () => {
    const isDark = body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode", !isDark);
    localStorage.setItem("darkMode", isDark);
  });

  // ── Menu ───────────────────────────────────────────────────────────────────
  menuToggle.addEventListener("click", () => {
    const open = mainNav.classList.contains("visible");
    mainNav.classList.toggle("visible", !open);
    mainNav.classList.toggle("hidden",   open);
  });

  document.addEventListener("click", (e) => {
    if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
      mainNav.classList.remove("visible");
      mainNav.classList.add("hidden");
    }
  });

  // ── Page transitions ────────────────────────────────────────────────────────
  document.querySelectorAll("a").forEach((link) => {
    if (link.hostname === window.location.hostname && link.href && !link.getAttribute("href").startsWith("#")) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        const target = this.getAttribute("href");
        document.body.style.opacity = "0";
        document.body.style.transition = "opacity 0.25s ease";
        setTimeout(() => { window.location.href = target; }, 250);
      });
    }
  });
});