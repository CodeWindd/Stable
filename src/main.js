const weatherStatus = document.getElementById("weatherStatus");
const weatherTemp = document.getElementById("weatherTemp");
const weatherMeta = document.getElementById("weatherMeta");
const fetchButton = document.getElementById("fetchWeather");
const cityInput = document.getElementById("cityInput");
const themeToggle = document.getElementById("themeToggle");
const body = document.body;

async function fetchWeatherForCity(city) {
  weatherStatus.textContent = `Loading weather for ${city}…`;
  weatherTemp.textContent = "";
  weatherMeta.textContent = "";

  try {
    // Simple city → coordinates mapping (demo only)
    const cities = {
      Chicago: { lat: 41.8781, lon: -87.6298 },
      London: { lat: 51.5072, lon: -0.1276 },
      Tokyo: { lat: 35.6762, lon: 139.6503 },
      Paris: { lat: 48.8566, lon: 2.3522 },
    };

    const fallback = { lat: 41.8781, lon: -87.6298 };
    const { lat, lon } = cities[city] || fallback;

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}` +
      `&longitude=${lon}&current_weather=true`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("Network error");
    const data = await res.json();

    const current = data.current_weather;
    const temp = current.temperature;
    const wind = current.windspeed;
    const code = current.weathercode;

    weatherStatus.textContent = `${city} — current conditions`;
    weatherTemp.textContent = `${temp}°C`;
    weatherMeta.textContent = `Wind: ${wind} km/h · Code: ${code}`;
  } catch (err) {
    console.error(err);
    weatherStatus.textContent = "Failed to load weather.";
    weatherTemp.textContent = "";
    weatherMeta.textContent = "Check your connection and try again.";
  }
}

fetchButton.addEventListener("click", () => {
  const city = cityInput.value.trim() || "Chicago";
  fetchWeatherForCity(city);
});

cityInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    fetchButton.click();
  }
});

themeToggle.addEventListener("click", () => {
  if (body.classList.contains("m3-light")) {
    body.classList.remove("m3-light");
    body.classList.add("m3-dark");
  } else {
    body.classList.remove("m3-dark");
    body.classList.add("m3-light");
  }
});

// Initial load
fetchWeatherForCity("Chicago");
