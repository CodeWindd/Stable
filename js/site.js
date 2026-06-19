import { updateThemeIcon } from "./material-web.js";

// -----------------------------
// API CONFIG
// -----------------------------
const API_KEY = "YOUR_API_KEY_HERE"; // Replace with your key
const BASE_URL = "https://api.weatherapi.com/v1";

// -----------------------------
// DOM ELEMENTS
// -----------------------------
const cityInput = document.getElementById("cityInput");
const fetchBtn = document.getElementById("fetchWeather");
const locationName = document.getElementById("locationName");
const locationDate = document.getElementById("locationDate");
const weatherTemp = document.getElementById("weatherTemp");
const weatherCondition = document.getElementById("weatherCondition");
const weatherMeta = document.getElementById("weatherMeta");
const weatherIcon = document.getElementById("weatherIcon");
const hourlyRow = document.getElementById("hourlyRow");
const dailyList = document.getElementById("dailyList");
const aiSummary = document.getElementById("aiSummary");
const themeToggle = document.getElementById("themeToggle");

// -----------------------------
// METEOCONS ICON MAP
// -----------------------------
function getMeteocon(condition, isNight) {
  const c = condition.toLowerCase();

  if (c.includes("sunny") || c.includes("clear"))
    return isNight ? "meteocons/moon-fill.svg" : "meteocons/sun-fill.svg";

  if (c.includes("cloud"))
    return isNight ? "meteocons/cloud-moon-fill.svg" : "meteocons/cloud-sun-fill.svg";

  if (c.includes("rain"))
    return "meteocons/rain-fill.svg";

  if (c.includes("snow"))
    return "meteocons/snow-fill.svg";

  if (c.includes("thunder"))
    return "meteocons/thunderstorm-fill.svg";

  return "meteocons/cloud-fill.svg";
}

// -----------------------------
// DAY / NIGHT LOGIC
// -----------------------------
function isNightTime(current, sunrise, sunset) {
  const now = new Date(current).getTime();
  const rise = new Date(sunrise).getTime();
  const set = new Date(sunset).getTime();
  return now < rise || now > set;
}

// -----------------------------
// FETCH WEATHER
// -----------------------------
async function fetchWeather(city) {
  try {
    const url = `${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=10&aqi=no&alerts=no`;
    const res = await fetch(url);
    const data = await res.json();

    updateUI(data);
  } catch (err) {
    console.error("Weather fetch failed:", err);
  }
}

// -----------------------------
// UPDATE UI
// -----------------------------
function updateUI(data) {
  const loc = data.location;
  const cur = data.current;
  const forecast = data.forecast.forecastday;

  // Location + date
  locationName.textContent = `${loc.name}, ${loc.region}`;
  locationDate.textContent = new Date(loc.localtime).toLocaleString();

  // Day/night
  const today = forecast[0].astro;
  const night = isNightTime(loc.localtime, today.sunrise, today.sunset);

  // Main weather
  weatherTemp.textContent = `${Math.round(cur.temp_f)}°F`;
  weatherCondition.textContent = cur.condition.text;

  weatherMeta.textContent =
    `Feels like ${Math.round(cur.feelslike_f)}°F · High ${Math.round(forecast[0].day.maxtemp_f)}°F · ` +
    `Low ${Math.round(forecast[0].day.mintemp_f)}°F · Wind ${cur.wind_mph} mph · Humidity ${cur.humidity}%`;

  // Icon
  weatherIcon.src = getMeteocon(cur.condition.text, night);

  // Hourly
  hourlyRow.innerHTML = "";
  forecast[0].hour.forEach(h => {
    const hour = document.createElement("div");
    hour.className = "m3-hour-item";
    hour.style.minWidth = "64px";
    hour.style.textAlign = "center";

    const time = new Date(h.time).toLocaleTimeString([], { hour: "numeric" });
    const icon = getMeteocon(h.condition.text, h.is_night === 1);

    hour.innerHTML = `
      <div class="m3-body-small">${time}</div>
      <img src="${icon}" width="32" height="32" />
      <div class="m3-body-small">${Math.round(h.temp_f)}°</div>
    `;

    hourlyRow.appendChild(hour);
  });

  // Daily
  dailyList.innerHTML = "";
  forecast.forEach(day => {
    const row = document.createElement("div");
    row.className = "m3-daily-row";
    row.style.display = "flex";
    row.style.justifyContent = "space-between";
    row.style.alignItems = "center";

    const icon = getMeteocon(day.day.condition.text, false);

    row.innerHTML = `
      <div class="m3-body-medium">${new Date(day.date).toLocaleDateString([], { weekday: "short" })}</div>
      <img src="${icon}" width="32" height="32" />
      <div class="m3-body-medium">${Math.round(day.day.mintemp_f)}° / ${Math.round(day.day.maxtemp_f)}°</div>
    `;

    dailyList.appendChild(row);
  });

  // AI Summary
  aiSummary.textContent =
    `Expect ${cur.condition.text.toLowerCase()} with highs near ${Math.round(forecast[0].day.maxtemp_f)}°F. ` +
    `Winds around ${cur.wind_mph} mph. Humidity at ${cur.humidity}%.`;
}

// -----------------------------
// THEME TOGGLE
// -----------------------------
themeToggle.addEventListener("click", () => {
  const dark = document.body.classList.toggle("m3-dark");
  if (dark) document.body.classList.remove("m3-light");
  else document.body.classList.add("m3-light");

  updateThemeIcon(dark);
});

// -----------------------------
// SEARCH BUTTON
// -----------------------------
fetchBtn.addEventListener("click", () => {
  if (cityInput.value.trim() !== "") {
    fetchWeather(cityInput.value.trim());
  }
});

// Auto-load default city
fetchWeather("Chicago");
