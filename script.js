
const API_KEY = "39d6dee590d13d30326f7815aaaeeaed";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const locationBtn = document.getElementById("locationBtn");
const statusMessage = document.getElementById("statusMessage");

const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const localDate = document.getElementById("localDate");
const temperature = document.getElementById("temperature");
const condition = document.getElementById("condition");
const feelsLike = document.getElementById("feelsLike");
const tempRange = document.getElementById("tempRange");
const humidity = document.getElementById("humidity");
const wind = document.getElementById("wind");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");
const weatherIcon = document.getElementById("weatherIcon");
const updatedAt = document.getElementById("updatedAt");
const weatherCard = document.getElementById("weatherCard");

let requestController = null;

function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = "status-message";

    if (type) {
        statusMessage.classList.add(type);
    }
}


function setLoading(isLoading) {
    searchBtn.disabled = isLoading;
    locationBtn.disabled = isLoading;

    searchBtn.innerHTML = isLoading
        ? '<i class="bx bx-loader-alt bx-spin"></i> Loading'
        : 'Search <i class="bx bx-right-arrow-alt"></i>';

    if (isLoading) {
        locationBtn.innerHTML =
            '<i class="bx bx-loader-alt bx-spin"></i> Finding location...';
    } else {
        locationBtn.innerHTML =
            '<i class="bx bx-current-location"></i> Use Current Location';
    }
}

function formatDate() {
    return new Intl.DateTimeFormat("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    }).format(new Date());
}

async function fetchWeather(url) {
    // Cancel the previous request if the user searches again.
    if (requestController) {
        requestController.abort();
    }

    requestController = new AbortController();

    setLoading(true);
    showStatus("Finding the latest weather...", "");

    try {
        const response = await fetch(url, {
            signal: requestController.signal
        });

        const data = await response.json();

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(
                    "We couldn't find that city. Check the spelling and try again."
                );
            }

            if (response.status === 401) {
                throw new Error(
                    "The API key was rejected. Check your OpenWeather API key."
                );
            }

            if (response.status === 429) {
                throw new Error(
                    "Too many requests. Please wait a little and try again."
                );
            }

            throw new Error(
                data.message || "Unable to fetch weather. Please try again."
            );
        }

        displayWeather(data);
        showStatus("Weather updated successfully!", "success");
    } catch (error) {
        if (error.name === "AbortError") {
            return;
        }

        console.error("Weather request failed:", error);

        showStatus(
            error.message || "Network error. Please check your connection.",
            "error"
        );
    } finally {
        if (requestController?.signal.aborted === false) {
            setLoading(false);
        } else if (requestController) {
            setLoading(false);
        }
    }
}

function displayWeather(data) {
    const weather = data.weather[0];
    const main = data.main;

    cityName.textContent = data.name;

    countryName.textContent = data.sys.country
        ? `Country: ${data.sys.country}`
        : "Location found";

    localDate.textContent = formatDate();

    temperature.textContent = Math.round(main.temp);
    condition.textContent = weather.description;
    feelsLike.textContent = `${Math.round(main.feels_like)}°C`;

    tempRange.textContent =
        `Min ${Math.round(main.temp_min)}°C · Max ${Math.round(main.temp_max)}°C`;

    humidity.textContent = `${main.humidity}%`;

    // Convert wind speed from m/s to km/h.
    wind.textContent = `${(data.wind.speed * 3.6).toFixed(1)} km/h`;

    pressure.textContent = `${main.pressure} hPa`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;

    // Change ONLY the main weather illustration.
  
const iconMap = {
    Clear: "./assets/sun-removebg-preview.png",
    Clouds: "./assets/cloudy-removebg-preview (1) copy.png",
    Rain: "./assets/rain-removebg-preview (1).png",
    Drizzle: "./assets/rain-removebg-preview (1).png",
    Thunderstorm: "./assets/rain-removebg-preview (1).png",
    Snow: "./assets/cloudy-removebg-preview.png",
    Mist: "./assets/cloudy-removebg-preview.png",
    Fog: "./assets/cloudy-removebg-preview.png",
    Haze: "./assets/cloudy-removebg-preview.png"
};

weatherIcon.onerror = () => {
    weatherIcon.onerror = null;
    weatherIcon.src = "./assets/cloudy-removebg-preview.png";
};

weatherIcon.src =
    iconMap[weather.main] || "./assets/cloudy-removebg-preview.png";

weatherIcon.alt = weather.description;

    updatedAt.textContent = `Updated at ${new Date().toLocaleTimeString(
        "en-IN",
        { hour: "2-digit", minute: "2-digit" }
    )}`;

    // Update the browser theme color.
    const themeColors = {
        Clear: "#eaf3f8",
        Clouds: "#e8edf2",
        Rain: "#e3edf5",
        Drizzle: "#e3edf5",
        Thunderstorm: "#e9e5f2",
        Snow: "#edf4fa",
        Mist: "#e8edf2",
        Fog: "#e8edf2",
        Haze: "#f3ede5"
    };

    document.querySelector('meta[name="theme-color"]').content =
        themeColors[weather.main] || "#eaf3f8";

    // Replay the card entrance animation.
    weatherCard.style.animation = "none";
    void weatherCard.offsetWidth;
    weatherCard.style.animation = "cardEnter 0.55s ease both";
}

function searchWeather() {
    const city = cityInput.value.trim();

    if (!city) {
        showStatus("Please enter a city name first.", "error");
        cityInput.focus();
        return;
    }

    const url =
        `${API_URL}?q=${encodeURIComponent(city)}` +
        `&appid=${API_KEY}&units=metric`;

    fetchWeather(url);
}

// Search button.
searchBtn.addEventListener("click", searchWeather);

// Search when Enter is pressed.
cityInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchWeather();
    }
});

// Get weather using the device's current location.

locationBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
        showStatus(
            "Your browser does not support location services.",
            "error"
        );
        return;
    }

    setLoading(true);
    locationBtn.innerHTML =
        '<i class="bx bx-loader-alt bx-spin"></i> Finding location...';

    showStatus("Requesting your current location...", "");

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;

            const url =
                `${API_URL}?lat=${latitude}&lon=${longitude}` +
                `&appid=${API_KEY}&units=metric`;

            fetchWeather(url);
        },
        (error) => {
            setLoading(false);
            locationBtn.innerHTML =
                '<i class="bx bx-current-location"></i> Use Current Location';

            const messages = {
                1: "Location permission denied. Allow location access in your browser.",
                2: "Your location is unavailable. Try searching for a city.",
                3: "Location request timed out. Please try again."
            };

            showStatus(
                messages[error.code] ||
                "Unable to get your location. Please search for a city.",
                "error"
            );
        },
        {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 300000
        }
    );
});

// Load a default city when the app opens.
fetchWeather(
    `${"https://api.openweathermap.org/data/2.5/weather?units=metric&q="}?q=Chennai&appid=${"39d6dee590d13d30326f7815aaaeeaed"}&units=metric`
);