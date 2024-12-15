// API Key
const API_KEY = "18dab1790274c997b45d379c4fb29d8f";

// API Base URLs
const GEO_BASE_URL = "https://api.openweathermap.org/geo/1.0/direct";
const FORECAST_BASE_URL = "https://api.openweathermap.org/data/2.5/forecast";

// Select DOM elements
const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherContainer = document.getElementById("weather-container");

// Fetch coordinates for a city
async function fetchCoordinates(city) {
  try {
    const response = await fetch(`${GEO_BASE_URL}?q=${city}&limit=1&appid=${API_KEY}`);
    console.log("Geocoding API Response:", response);  // Log the response for debugging
    if (!response.ok) throw new Error("City not found");
    const data = await response.json();
    console.log("Geocoding Data:", data);  // Log the geocoding data
    if (data.length === 0) throw new Error("City not found");
    return { lat: data[0].lat, lon: data[0].lon, name: data[0].name };
  } catch (error) {
    weatherContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    throw error;
  }
}

// Fetch 5-day weather forecast
async function fetchWeather(lat, lon) {
  try {
    const response = await fetch(`${FORECAST_BASE_URL}?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`);
    console.log("Forecast API Response:", response);  // Log the forecast response
    if (!response.ok) throw new Error("Weather data not found");
    const data = await response.json();
    console.log("Weather Data:", data);  // Log the weather data
    return data;
  } catch (error) {
    weatherContainer.innerHTML = `<p class="error">Error: ${error.message}</p>`;
    throw error;
  }
}

// Render weather data
function renderWeather(data, cityName) {
  const { list } = data;

  // Current weather
  const currentWeather = list[0];
  const currentDate = new Date(currentWeather.dt * 1000);

  // Create weather display
  weatherContainer.innerHTML = `
    <h2>Weather in ${cityName}</h2>
    <p><strong>Date:</strong> ${currentDate.toLocaleDateString()}</p>
    <p><strong>Temperature:</strong> ${currentWeather.main.temp}°C</p>
    <p><strong>Condition:</strong> ${currentWeather.weather[0].description}</p>
    <p><strong>Humidity:</strong> ${currentWeather.main.humidity}%</p>
    <p><strong>Wind Speed:</strong> ${currentWeather.wind.speed} m/s</p>
    <img class="weather-icon" src="https://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png" alt="${currentWeather.weather[0].description}">
    <h3>5-Day Forecast</h3>
    <div class="forecast-container">
      ${list
        .filter((_, index) => index % 8 === 0) // Every 8th item for daily forecast
        .map((forecast) => {
          const date = new Date(forecast.dt * 1000);
          return `
            <div class="forecast-day">
              <p><strong>${date.toLocaleDateString()}</strong></p>
              <p>${forecast.main.temp}°C</p>
              <img class="weather-icon" src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}@2x.png" alt="${forecast.weather[0].description}">
              <p>${forecast.weather[0].description}</p>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

// Event listener for search
searchBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  if (city) {
    try {
      const { lat, lon, name } = await fetchCoordinates(city);
      const weatherData = await fetchWeather(lat, lon);
      renderWeather(weatherData, name);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    }
    cityInput.value = ""; // Clear input
  }
});
