const body = document.body;
const themeToggle = document.getElementById("themeToggle");

const locationNameEl = document.getElementById("locationName");
const locationDateEl = document.getElementById("locationDate");
const weatherTempEl = document.getElementById("weatherTemp");
const weatherConditionEl = document.getElementById("weatherCondition");
const weatherMetaEl = document.getElementById("weatherMeta");
const aiSummaryEl = document.getElementById("aiSummary");
const weatherIconEl = document.getElementById("weatherIcon");

const hourlyRowEl = document.getElementById("hourlyRow");
const dailyListEl = document.getElementById("dailyList");

const cityInput = document.getElementById("cityInput");
const fetchButton = document.getElementById("fetchWeather");

// Simple city → coordinates map (demo)
const CITY_COORDS = {
  Chicago: { lat: 41.8781, lon: -87.6298, country: "US" },
  "San Francisco": { lat: 37.7749, lon: -122.4194, country: "US" },
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

const ICON_BASE =
  "https://cdn.meteocons.com/3.0.0-next.10/svg/fill/"; // fill style

function pickIconName(code, isDay) {
  // Map Open-Meteo weather codes to Meteocons names
  // Day/night variants where available
  if (code === 0) return isDay ? "clear-day" : "clear-night";
  if (code === 1 || code === 2)
    return isDay ? "partly-cloudy-day" : "partly-cloudy-night";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48)
    return isDay ? "fog-day" : "fog-night";
  if ([51, 53, 55].includes(code))
    return isDay ? "partly-cloudy-day-drizzle" : "partly-cloudy-night-drizzle";
  if ([61, 63, 65, 80, 81, 82].includes(code))
    return isDay ? "partly-cloudy-day-rain" : "partly-cloudy-night-rain";
  if ([71, 73, 75, 77, 85, 86].includes(code))
    return isDay ? "partly-cloudy-day-snow" : "partly-cloudy-night-snow";
  if ([95, 96, 99].includes(code))
    return isDay ? "thunderstorms-day" : "thunderstorms-night";
  return "not-available";
}

function buildIconUrl(code, isDay) {
  const name = pickIconName(code, isDay);
  return `${ICON_BASE}${name}.svg`;
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

function buildAiSummary(tempF, condition, airQualityText = "okay") {
  if (tempF <= 40) {
    return `Cold, ${condition.toLowerCase()} with ${airQualityText} air quality.`;
  }
  if (tempF <= 65) {
    return `Cool, ${condition.toLowerCase()} with ${airQualityText} air quality.`;
  }
  if (tempF <= 80) {
    return `Mild, ${condition.toLowerCase()} with ${airQualityText} air quality.`;
  }
  return `Warm, ${condition.toLowerCase()} with ${airQualityText} air quality.`;
}

async function fetchWeather(city) {
  const { lat, lon, country } = getCoordsForCity(city);

  locationNameEl.textContent = `${city}, ${country}`;
  locationDateEl.textContent = "Loading…";
  weatherTempEl.textContent = "--°F";
  weatherConditionEl.textContent = "Loading…";
  weatherMetaEl.textContent = "";
  aiSummaryEl.textContent = "Loading AI Weather Report…";
  hourlyRowEl.innerHTML = "";
  dailyListEl.innerHTML = "";
  weatherIconEl.src = "";

  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current_weather=true` +
    `&hourly=temperature_2m,relativehumidity_2m,weathercode` +
    `&daily=temperature_2m_max,temperature_2m_min,weathercode,sunrise,sunset` +
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

    // Sunrise/sunset for today
    const sunrise = new Date(data.daily.sunrise[0]);
    const sunset = new Date(data.daily.sunset[0]);
    const isDay = now >= sunrise && now < sunset;

    const conditionText = weatherCodeToText(code);
    const humidity = data.hourly.relativehumidity_2m[0];

    const maxToday = Math.round(data.daily.temperature_2m_max[0]);
    const minToday = Math.round(data.daily.temperature_2m_min[0]);

    weatherTempEl.textContent = `${tempF}°F`;
    weatherConditionEl.textContent = conditionText;
    weatherMetaEl.textContent =
      `Feels like ${tempF}°F · High ${maxToday}°F · Low ${minToday}°F · ` +
      `Wind ${wind} mph · Humidity ${humidity}%`;

    weatherIconEl.src = buildIconUrl(code, isDay);
    weatherIconEl.alt = conditionText;

    aiSummaryEl.textContent = buildAiSummary(tempF, conditionText);

    renderHourly(data, sunrise, sunset);
    renderDaily(data);
  } catch (err) {
    console.error(err);
    weatherConditionEl.textContent = "Failed to load weather.";
    weatherMetaEl.textContent = "Check your connection and try again.";
    aiSummaryEl.textContent = "No AI Weather Report available.";
  }
}

function renderHourly(data, sunrise, sunset) {
  const times = data.hourly.time;
  const temps = data.hourly.temperature_2m;
  const codes = data.hourly.weathercode;

  hourlyRowEl.innerHTML = "";

  const now = new Date();
  let added = 0;

  for (let i = 0; i < times.length; i++) {
    const t = new Date(times[i]);
    if (t < now) continue;

    const hourLabel = t.toLocaleTimeString(undefined, { hour: "numeric" });
    const temp = Math.round(temps[i]);
    const code = codes[i];

    const isDay = t >= sunrise && t < sunset;
    const iconUrl = buildIconUrl(code, isDay);

    const chip = document.createElement("div");
    chip.className = "m3-hourly-chip m3-body-small";
    chip.innerHTML = `
      <div>${hourLabel}</div>
      <img src="${iconUrl}" alt="" class="m3-daily-icon">
      <div>${temp}°</div>
    `;
    hourlyRowEl.appendChild(chip);

    added++;
    if (added >= 8) break; // show next ~8 hours
  }
}

function renderDaily(data) {
  const dates = data.daily.time;
  const maxes = data.daily.temperature_2m_max;
  const mins = data.daily.temperature_2m_min;
  const codes = data.daily.weathercode;
  const sunrises = data.daily.sunrise;
  const sunsets = data.daily.sunset;

  dailyListEl.innerHTML = "";

  for (let i = 0; i < dates.length && i < 10; i++) {
    const d = new Date(dates[i]);
    const dayLabel = i === 0
      ? "Today"
      : d.toLocaleDateString(undefined, { weekday: "short" });

    const max = Math.round(maxes[i]);
    const min = Math.round(mins[i]);
    const code = codes[i];

    const sunrise = new Date(sunrises[i]);
    const sunset = new Date(sunsets[i]);
    // Use midday to decide icon day/night
    const midday = new Date(d);
    midday.setHours(12, 0, 0, 0);
    const isDay = midday >= sunrise && midday < sunset;

    const iconUrl = buildIconUrl(code, isDay);

    const row = document.createElement("div");
    row.className = "m3-daily-row m3-body-small";
    row.innerHTML = `
      <div class="m3-daily-row-left">
        <span>${dayLabel}</span>
      </div>
      <div class="m3-daily-row-right">
        <img src="${iconUrl}" alt="" class="m3-daily-icon">
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
fetchWeather("San Francisco");
