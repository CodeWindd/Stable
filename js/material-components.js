export function initRipple() {
  document.querySelectorAll(".m3-ripple").forEach((el) => {
    el.addEventListener("click", () => {
      // visual handled by CSS :active
    });
  });
}

export function initButtons() {
  initRipple();
}
