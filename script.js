const apiKey = "e9ba8b8c53e8b77a2bff40d5c31a504f";

document.getElementById("searchBtn").addEventListener("click", getWeather);

async function getWeather() {
    const city = document.getElementById("cityInput").value;

    // Clear old data
    document.getElementById("cityName").innerText = "";
    document.getElementById("temp").innerText = "";
    document.getElementById("humidity").innerText = "";
    document.getElementById("condition").innerText = "";
    document.getElementById("forecast").innerHTML = "";

    try {
        // Step 1: Get coordinates
        const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city},IN&limit=1&appid=${apiKey}`;
        const geoResponse = await fetch(geoUrl);
        const geoData = await geoResponse.json();

        if (geoData.length === 0) {
            alert("City not found");
            return;
        }

        const lat = geoData[0].lat;
        const lon = geoData[0].lon;

        // Step 2: Current weather (cache-busting to get fresh data)
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&_=${new Date().getTime()}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        document.getElementById("cityName").innerText = city + ", India";
        document.getElementById("temp").innerText = "🌡 Temperature: " + weatherData.main.temp + " °C";
        document.getElementById("humidity").innerText = "💧 Humidity: " + weatherData.main.humidity + " %";
        document.getElementById("condition").innerText = "☁ Weather: " + weatherData.weather[0].description;

        // Step 3: 5-day forecast using /forecast API
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&_=${new Date().getTime()}`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();

        // Collect one forecast per day at 12:00 PM
        const dailyMap = {};
        forecastData.list.forEach(item => {
            if (item.dt_txt.includes("12:00:00")) {
                const dateStr = item.dt_txt.split(" ")[0];
                if (!dailyMap[dateStr]) {
                    dailyMap[dateStr] = {
                        temp: item.main.temp,
                        condition: item.weather[0].description
                    };
                }
            }
        });

        // Show exactly 5 days
        let count = 0;
        for (let date in dailyMap) {
            if (count >= 5) break;
            const day = dailyMap[date];

            const card = document.createElement("div");
            card.className = "forecastCard";
            card.innerHTML = `
                <b>${new Date(date).toDateString()}</b>
                <br>
                🌡 ${day.temp} °C
                <br>
                ☁ ${day.condition}
            `;
            document.getElementById("forecast").appendChild(card);
            count++;
        }

    } catch (error) {
        alert("Error fetching weather data. Please try again.");
        console.error(error);
    }
}