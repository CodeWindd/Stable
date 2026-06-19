// Lightweight bridge to Material Symbols and any future web components.
// Here we just ensure the icon font is loaded.

const link = document.createElement("link");
link.rel = "stylesheet";
link.href =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght@400&display=swap";
document.head.appendChild(link);
