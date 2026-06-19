// Material Components Behavior Script
// Handles ripple, textfield focus, and top app bar scroll effects

// -----------------------------
// Ripple (CSS-driven)
// -----------------------------
document.querySelectorAll(".m3-ripple").forEach(el => {
  el.addEventListener("mousedown", () => {
    el.classList.add("m3-ripple-active");
    setTimeout(() => el.classList.remove("m3-ripple-active"), 180);
  });
});

// -----------------------------
// Text Field Focus Styling
// -----------------------------
document.querySelectorAll(".m3-text-field__input").forEach(input => {
  input.addEventListener("focus", () => {
    input.style.borderColor = "var(--m3-color-primary)";
  });

  input.addEventListener("blur", () => {
    input.style.borderColor = "var(--m3-color-outline)";
  });
});

// -----------------------------
// Top App Bar Scroll Behavior
// -----------------------------
const topAppBar = document.querySelector(".m3-top-app-bar");
let lastScrollY = 0;

window.addEventListener("scroll", () => {
  const currentY = window.scrollY;

  if (currentY > lastScrollY && currentY > 20) {
    // Scrolling down → hide bar
    topAppBar.style.transform = "translateY(-100%)";
  } else {
    // Scrolling up → show bar
    topAppBar.style.transform = "translateY(0)";
  }

  lastScrollY = currentY;
});

// -----------------------------
// Weather Card Entrance Animation
// -----------------------------
document.addEventListener("DOMContentLoaded", () => {
  const card = document.querySelector(".m3-card");
  if (card) {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
      card.style.transition = "opacity 300ms ease, transform 300ms ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, 50);
  }
});
