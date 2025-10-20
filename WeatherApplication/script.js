// API key is read from a separate `config.js` file that defines `OPENWEATHER_API_KEY`.
// This avoids committing secrets to the repo. If `config.js` is not present, the
// app will show a helpful message guiding the developer to the OpenWeather FAQ.
const apiKey = typeof OPENWEATHER_API_KEY !== 'undefined' ? OPENWEATHER_API_KEY : null;
let isCelsius = true;

function getWeather() {
  const city = document.getElementById("city").value.trim();
  if (!city) {
    alert("Please enter a city name!");
    return;
  }

  showLoading(true);

  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  Promise.all([
    fetch(currentWeatherUrl).then((res) => res.json()),
    fetch(forecastUrl).then((res) => res.json())
  ])
    .then(([current, forecast]) => {
      // OpenWeather returns numeric codes or strings depending on endpoint/version.
      const currentCode = typeof current.cod === 'number' ? current.cod : parseInt(current.cod, 10);
      if (currentCode === 401) {
        // Unauthorized - likely invalid or missing API key
        const msg = "Invalid or missing OpenWeather API key. See https://openweathermap.org/faq#error401 for help.";
        showApiKeyError(msg);
        throw new Error(msg);
      }

      if (currentCode !== 200) {
        throw new Error(current.message || "City not found");
      }

      displayWeather(current);
      displayHourlyForecast(forecast.list);
      updateBackground(current.weather[0].main);
    })
    .catch((err) => {
      // Provide a clearer UI message instead of an alert for common API-key issues
      console.error("Weather Fetch Error:", err);
      if (!apiKey) {
        showApiKeyError("No OpenWeather API key configured. Create a file named `config.js` that sets OPENWEATHER_API_KEY. See README.");
      } else if (err.message && err.message.toLowerCase().includes('invalid or missing')) {
        showApiKeyError(err.message);
      } else {
        alert("⚠️ " + (err.message || "An error occurred while fetching weather."));
      }
    })
    .finally(() => showLoading(false));
}

function displayWeather(data) {
  const tempDivInfo = document.getElementById("temp-div");
  const weatherInfoDiv = document.getElementById("weather-info");
  const weatherIcon = document.getElementById("weather-icon");

  tempDivInfo.innerHTML = "";
  weatherInfoDiv.innerHTML = "";

  const cityName = data.name;
  const tempC = Math.round(data.main.temp);
  const tempF = Math.round((tempC * 9) / 5 + 32);
  const description = data.weather[0].description;
  const iconCode = data.weather[0].icon;
  const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

  tempDivInfo.innerHTML = `
    <p id="temp-value">${isCelsius ? tempC : tempF}°${isCelsius ? "C" : "F"}</p>
    <button id="toggle-temp" class="toggle-btn">Switch to ${isCelsius ? "°F" : "°C"}</button>
  `;

  weatherInfoDiv.innerHTML = `
    <p>${cityName}</p>
    <p>${description}</p>
  `;

  weatherIcon.src = iconUrl;
  weatherIcon.alt = description;
  weatherIcon.style.display = "block";

  document.getElementById("toggle-temp").addEventListener("click", () => toggleTemp(data));
}

function displayHourlyForecast(hourlyData) {
  const hourlyForecastDiv = document.getElementById("hourly-forecast");
  hourlyForecastDiv.innerHTML = "";

  // Display next 8 forecasts (approx 24 hours with 3-hour interval)
  hourlyData.slice(0, 8).forEach((item) => {
    const dateTime = new Date(item.dt * 1000);
    const hour = dateTime.getHours().toString().padStart(2, "0");
    const tempC = Math.round(item.main.temp);
    const tempF = Math.round((tempC * 9) / 5 + 32);
    const iconCode = item.weather[0].icon;
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`;

    hourlyForecastDiv.innerHTML += `
      <div class="hourly-item">
        <span>${hour}:00</span>
        <img src="${iconUrl}" alt="${item.weather[0].description}">
        <span>${isCelsius ? tempC : tempF}°${isCelsius ? "C" : "F"}</span>
      </div>
    `;
  });
}

function toggleTemp(data) {
  isCelsius = !isCelsius;
  displayWeather(data);
  displayHourlyForecast(data.hourly || []); // optional: re-display hourly in new unit
}

function showLoading(show) {
  let loader = document.getElementById("loader");
  if (!loader) {
    loader = document.createElement("div");
    loader.id = "loader";
    loader.innerHTML = `<div class="spinner"></div>`;
    document.body.appendChild(loader);
  }
  loader.style.display = show ? "flex" : "none";
}

function updateBackground(weatherMain) {
  const body = document.body;
  let gradient;

  switch (weatherMain.toLowerCase()) {
    case "clear":
      gradient = "linear-gradient(135deg, #f8cdda, #1d2b64)";
      break;
    case "clouds":
      gradient = "linear-gradient(135deg, #bdc3c7, #2c3e50)";
      break;
    case "rain":
      gradient = "linear-gradient(135deg, #000046, #1cb5e0)";
      break;
    case "snow":
      gradient = "linear-gradient(135deg, #83a4d4, #b6fbff)";
      break;
    case "thunderstorm":
      gradient = "linear-gradient(135deg, #232526, #414345)";
      break;
    default:
      gradient = "linear-gradient(135deg, #1e3c72, #2a5298)";
  }

  body.style.background = gradient;
}

// Display API key related errors in the UI footer area instead of only alerts.
function showApiKeyError(message) {
  // Create or reuse an overlay banner
  let banner = document.getElementById('api-key-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'api-key-banner';
    banner.style.position = 'fixed';
    banner.style.bottom = '16px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.background = '#ffefef';
    banner.style.color = '#222';
    banner.style.border = '1px solid #f5c2c2';
    banner.style.padding = '12px 16px';
    banner.style.borderRadius = '8px';
    banner.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
    banner.style.zIndex = 9999;
    document.body.appendChild(banner);
  }

  banner.innerHTML = `⚠️ ${message} <a href="https://openweathermap.org/faq#error401" target="_blank" rel="noopener" style="margin-left:8px;color:#0645ad">OpenWeather FAQ</a>`;
}
