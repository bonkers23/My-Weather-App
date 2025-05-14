const apiKey = "3659f4484dba86f04dc00fc56c6f6d50";
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherIcon = document.getElementById("weatherIcon");
const cityName = document.getElementById("cityName");
const weatherDesc = document.getElementById("weatherDescription");
const temperature = document.getElementById("temperature");
const dateTime = document.getElementById("dateTime");
const forecastContainer = document.querySelector(".forecast-container");
const recentTags = document.querySelector(".recent-tags");
const clearStorage = document.getElementById("clearStorage");
const unitToggle = document.getElementById("unitToggle");
const themeToggle = document.getElementById("themeToggle");

let isCelsius = true;

searchBtn.addEventListener("click", () => {
  const city = cityInput.value.trim();
  if (city !== "") {
    getWeatherData(city);
    cityInput.value = "";
  }
});

clearStorage.addEventListener("click", () => {
  localStorage.removeItem("recentCities");
  showRecentSearches();
});

unitToggle.addEventListener("click", () => {
  isCelsius = !isCelsius;
  unitToggle.textContent = isCelsius ? "Switch to °F" : "Switch to °C";
  const lastCity = localStorage.getItem("lastCity");
  if (lastCity) getWeatherData(lastCity);
});

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

function getWeatherData(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      if (data.cod === 200) {
        updateCurrentWeather(data);
        getForecastData(city);
        updateRecentSearches(city);
        localStorage.setItem("lastCity", city);
        updateBackground(data.weather[0].main);
      } else {
        alert("City not found");
      }
    })
    .catch((err) => console.log("Fetch error:", err));
}

function updateCurrentWeather(data) {
  const temp = isCelsius ? data.main.temp : (data.main.temp * 9) / 5 + 32;
  const unit = isCelsius ? "°C" : "°F";

  weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  cityName.textContent = data.name;
  weatherDesc.textContent = data.weather[0].description;
  temperature.textContent = `${Math.round(temp)}${unit}`;
  dateTime.textContent = new Date().toLocaleString();
}

function getForecastData(city) {
  const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(forecastURL)
    .then((res) => res.json())
    .then((data) => {
      if (data.cod === "200") {
        const dailyData = {};
        data.list.forEach((item) => {
          const date = item.dt_txt.split(" ")[0];
          const time = item.dt_txt.split(" ")[1];

          if (time === "12:00:00") {
            dailyData[date] = item;
          }
        });

        forecastContainer.innerHTML = "";
        Object.keys(dailyData).slice(0, 5).forEach((date) => {
          const forecast = dailyData[date];
          const temp = isCelsius ? forecast.main.temp : (forecast.main.temp * 9) / 5 + 32;
          const unit = isCelsius ? "°C" : "°F";

          const card = document.createElement("div");
          card.classList.add("forecast-card");
          card.innerHTML = `
            <p>${new Date(date).toDateString().split(" ").slice(0, 3).join(" ")}</p>
            <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="">
            <p>${forecast.weather[0].main}</p>
            <p>${Math.round(temp)}${unit}</p>
          `;
          forecastContainer.appendChild(card);
        });
      }
    })
    .catch((err) => console.log("Forecast error:", err));
}

function updateBackground(weatherMain) {
  let bgImage = "assets/bg-default.jpg";

  if (weatherMain.includes("Clear")) {
    bgImage = "assets/bg-clear-sky.jpg";
  } else if (weatherMain.includes("Clouds")) {
    bgImage = "assets/bg-clouds.jpg";
  } else if (weatherMain.includes("Rain")) {
    bgImage = "assets/bg-rainy.jpg";
  }

  document.body.style.backgroundImage = `url('${bgImage}')`;
}

function updateRecentSearches(city) {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];

  if (!cities.includes(city)) {
    cities.unshift(city);
    if (cities.length > 5) cities.pop(); 
    localStorage.setItem("recentCities", JSON.stringify(cities));
  }

  showRecentSearches();
}

function showRecentSearches() {
  let cities = JSON.parse(localStorage.getItem("recentCities")) || [];
  recentTags.innerHTML = "";

  cities.forEach((city) => {
    const tag = document.createElement("span");
    tag.textContent = city;
    tag.addEventListener("click", () => getWeatherData(city));
    recentTags.appendChild(tag);
  });
}

showRecentSearches();

const lastCity = localStorage.getItem("lastCity");
if (lastCity) {
  getWeatherData(lastCity);
}
