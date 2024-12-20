const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");
const notFoundContainer = document.querySelector(".not-found-container"); // Added for City Not Found scenario

// Initially needed variables
let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if (newTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            // If the search form container is invisible, make it visible
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            notFoundContainer.style.display = "none"; // Hide Not Found
            searchForm.classList.add("active");
        } else {
            // If we were previously on the search tab, show the "Your Weather" tab
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            notFoundContainer.style.display = "none"; // Hide Not Found
            // Fetch coordinates from session storage
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click", () => {
    // Pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // Pass clicked tab as input parameter
    switchTab(searchTab);
});

// Check if coordinates are already present in session storage
function getfromSessionStorage() {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (!localCoordinates) {
        // If local coordinates are not found, show the grant access container
        grantAccessContainer.classList.add("active");
    } else {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
}

async function fetchUserWeatherInfo(coordinates) {
    const { lat, lon } = coordinates;
    // Make the grant access container invisible
    grantAccessContainer.classList.remove("active");
    // Show the loader
    loadingScreen.classList.add("active");

    // API Call
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");
        if (response.ok) {
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            displayCityNotFound(); // Handle invalid location data
        }
    } catch (err) {
        loadingScreen.classList.remove("active");
        // Optional: Add error handling UI here
        console.error("Error fetching user weather info:", err);
    }
}

function renderWeatherInfo(weatherInfo) {
    // Fetch the elements
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // Log the weather info for debugging
    console.log(weatherInfo);

    // Fetch values from the weatherInfo object and update the UI
    cityName.innerText = weatherInfo?.name || "Unknown";
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description || "No description available";
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    } else {
        alert("Geolocation is not supported by your browser."); // Optional alert
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getLocation);

const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value.trim();

    if (cityName === "") return;
    else fetchSearchWeatherInfo(cityName);
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");
    notFoundContainer.style.display = "none"; // Hide Not Found

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );
        const data = await response.json();

        loadingScreen.classList.remove("active");

        if (response.ok) {
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        } else {
            displayCityNotFound(); // Handle invalid city name
        }
    } catch (err) {
        loadingScreen.classList.remove("active");
        console.error("Error fetching search weather info:", err);
    }
}

function displayCityNotFound() {
    // Hide other containers
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    // Show Not Found Container
    notFoundContainer.style.display = "flex";
}
