const body = document.body;
const themeToggle = document.getElementById("themeToggle");

const locationNameEl = document.getElementById("locationName");
const locationDateEl = document.getElementById("locationDate");
const weatherTempEl = document.getElementById("weatherTemp");
const weatherConditionEl = document.getElementById("weatherCondition");
const weatherMetaEl = document.getElementById("weatherMeta");
const weatherIconEl = document.getElementById("weatherIcon");

const hourlyRowEl = document.getElementById("hourlyRow");
const dailyListEl = document.getElementById("dailyList");

const cityInput = document.getElementById("cityInput");
const fetchButton = document.getElementById("fetchWeather");

// Simple city → coordinates map (demo)
const CITY_COORDS = {
  Chicago: { lat: 41.8781, lon: -87.6298, country: "US" },
  London: { lat: 51.5072, lon: -0.1276, country: "UK" },
  Tokyo: { lat: 35.6762, lon: 139.6503, country: "JP" },
  Paris: { lat: 48.8566, lon: 2.3522, country: "FR" },
};

function getCoordsForCity(city) {
  return CITY_COORDS[city] || CITY_COORDS["Chicago"];
}

function formatDate(date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function weatherCodeToIcon(code) {
  if ([0].includes(code)) return "☀️";
  if ([1, 2].includes(code)) return "🌤️";
  if ([3].includes(code)) return "☁️";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌡️";
}

function weatherCodeToText(code) {
  const map = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow",
    73: "Moderate snow",
    75: "Heavy snow",
    80: "Rain showers",
    81: "Heavy showers",
    82: "Violent showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Severe thunderstorm",
  };
  return map[code] || "Unknown conditions";
}

async function fetchWeather(city) {
  const { lat, lon, country } = getCoordsForCity(city);

  locationNameEl.textContent = `${city}, ${country}`;
  locationDateEl.textContent = "Loading…";
  weatherTempEl.textContent = "--°F";
  weatherConditionEl.textContent = "Loading…";
  weatherMetaEl.textContent = "";
  hourlyRowEl.innerHTML = "";
  dailyListEl.innerHTML = "";

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true&hourly=temperature_2m,relativehumidity_2m,weathercode` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode` +
    `&temperature_unit=fahrenheit&timezone=auto`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    const now = new Date();
    locationDateEl.textContent = formatDate(now);

    const current = data.current_weather;
    const tempF = Math.round(current.temperature);
    const code = current.weathercode;
    const wind = Math.round(current.windspeed);

    weatherTempEl.textContent = `${tempF}°F`;
    weatherConditionEl.textContent = weatherCodeToText(code);
    weatherIconEl.textContent = weatherCodeToIcon(code);

    // Approx humidity from first hourly value
    const humidity = data.hourly.relativehumidity_2m[0];
    weatherMetaEl.textContent = `Wind ${wind} mph · Humidity ${humidity}%`;

    renderHourly(data);
    renderDaily(data);
  } catch (err) {
    console.error(err);
    weatherConditionEl.textContent = "Failed to load weather.";
    weatherMetaEl.textContent = "Check your connection and try again.";
  }
}

function renderHourly(data) {
  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weathercode;

  hourlyRowEl.innerHTML = "";

  const now = new Date();
  // Next 12 hours
  for (let i = 0; i < times.length && i < 24; i++) {
    const t = new Date(times[i]);
    if (t < now) continue;
    const hourLabel = t.toLocaleTimeString(undefined, {
      hour: "numeric",
    });
    const temp = Math.round(temps[i]);
    const icon = weatherCodeToIcon(codes[i]);

    const chip = document.createElement("div");
    chip.className = "m3-hourly-chip m3-body-small";
    chip.innerHTML = `
      <div>${hourLabel}</div>
      <div>${icon}</div>
      <div>${temp}°</div>
    `;
    hourlyRowEl.appendChild(chip);

    if (hourlyRowEl.children.length >= 12) break;
  }
}

function renderDaily(data) {
  const dates = data.daily.time;
  const maxes = data.daily.temperature_2m_max;
  const mins = data.daily.temperature_2m_min;
  const codes = data.daily.weathercode;

  dailyListEl.innerHTML = "";

  for (let i = 0; i < dates.length && i < 7; i++) {
    const d = new Date(dates[i]);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: "short" });
    const max = Math.round(maxes[i]);
    const min = Math.round(mins[i]);
    const icon = weatherCodeToIcon(codes[i]);

    const row = document.createElement("div");
    row.className = "m3-daily-row m3-body-small";
    row.innerHTML = `
      <div class="m3-daily-row-left">
        <span>${dayLabel}</span>
      </div>
      <div class="m3-daily-row-right">
        <span>${icon}</span>
        <span>${max}° / ${min}°</span>
      </div>
    `;
    dailyListEl.appendChild(row);
  }
}

// Theme toggle
themeToggle.addEventListener("click", () => {
  if (body.classList.contains("m3-light")) {
    body.classList.remove("m3-light");
    body.classList.add("m3-dark");
    themeToggle.querySelector(".m3-icon").textContent = "light_mode";
  } else {
    body.classList.remove("m3-dark");
    body.classList.add("m3-light");
    themeToggle.querySelector(".m3-icon").textContent = "dark_mode";
  }
});

// Search
fetchButton.addEventListener("click", () => {
  const city = cityInput.value.trim() || "Chicago";
  fetchWeather(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchButton.click();
  }
});

// Initial load
fetchWeather("Chicago");
