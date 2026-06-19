export function initRipple() {
  document.querySelectorAll(".m3-ripple").forEach((el) => {
    el.addEventListener("click", () => {
      // simple visual feedback handled via CSS :active
    });
  });
}

export function initButtons() {
  initRipple();
}
