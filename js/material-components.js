// Placeholder for future Material Web Components.
// For now, we just expose a tiny helper for ripple + button states.

export function attachRipple(selector) {
  document.querySelectorAll(selector).forEach((el) => {
    el.classList.add("m3-ripple");
  });
}

export function initButtons() {
  attachRipple(".m3-button, .m3-icon-button");
}
