// Material Web Component Loader
// (Lightweight wrapper for initializing ripple + component behaviors)

document.querySelectorAll(".m3-ripple").forEach(el => {
  el.addEventListener("click", () => {
    // Simple ripple flash handled in CSS
  });
});

// Theme toggle icon updates
export function updateThemeIcon(isDark) {
  const icon = document.querySelector("#themeToggle .m3-icon");
  if (!icon) return;
  icon.textContent = isDark ? "light_mode" : "dark_mode";
}
