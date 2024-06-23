// Listen for clicks on the browser action (extension icon)
chrome.action.onClicked.addListener((tab) => {
    // Open the extension popup when the icon is clicked
    chrome.action.openPopup();
  });
  
  // Function to fetch weather data from OpenWeatherMap API
  function fetchWeather(city) {
    const apiKey = 'a08955ad82d15f896550dbf7ebe9007b'; // Replace with your actual API key
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  
    return fetch(weatherUrl)
      .then(response => response.json())
      .then(data => {
        if (data.cod === 200) {
          return data; // Return weather data if request is successful
        } else {
          throw new Error('City not found'); // Throw error if city not found
        }
      });
  }
  
  // Function to fetch a random city image from Unsplash API
  function fetchCityImage(city) {
    const unsplashAccessKey = '4Bs-E9oI_yQJMQFW7TB-AT0QXb4dh3IXjGI_4XzaZgY'; // Replace with your Unsplash API key
    const unsplashUrl = `https://api.unsplash.com/photos/random?query=${city}&client_id=${unsplashAccessKey}`;
  
    return fetch(unsplashUrl)
      .then(response => response.json())
      .then(data => {
        if (data.urls && data.urls.regular) {
          return data.urls.regular; // Return image URL if available
        } else {
          throw new Error('No image found for this city'); // Throw error if image not found
        }
      });
  }
  
  // Function to update the extension popup with weather data
  function updatePopup(weatherData, cityImageUrl) {
    const cityName = weatherData.name.toUpperCase();
    const now = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = daysOfWeek[now.getDay()];
    const options = { month: 'long', day: 'numeric' };
    const monthAndDate = now.toLocaleDateString('en-US', options).toUpperCase().replace(',', '');
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
    const temperature = Math.round(weatherData.main.temp);
    const minTemperature = Math.round(weatherData.main.temp_min);
    const maxTemperature = Math.round(weatherData.main.temp_max);
    const weatherDescription = weatherData.weather[0].description.charAt(0).toUpperCase() + weatherData.weather[0].description.slice(1);
    const windSpeed = weatherData.wind.speed;
    const windDirection = getWindDirection(weatherData.wind.deg);
    const humidity = weatherData.main.humidity;
    const visibility = (weatherData.visibility / 1000).toFixed(1);
  
    const popupHtml = `
      <div class="weather-info">
        <div class="weather-icon">
          <img src="${cityImageUrl}" alt="Weather Icon">
        </div>
        <h2 class="city-name">${cityName}</h2>
        <p class="date">${dayOfWeek.toUpperCase()} | ${monthAndDate} | ${time}</p>
        <div class="temperature">
          <span class="temp-value">${temperature}</span><sup>°C</sup>
        </div>
        <div class="additional-info">
          <div class="info">
            <span class="label">Min</span>
            <span class="value">${minTemperature}°C</span>
          </div>
          <div class="info">
            <span class="label">Max</span>
            <span class="value">${maxTemperature}°C</span>
          </div>
        </div>
        <div class="weather-info weather-description">
          <span>${weatherDescription}</span>
        </div>
        <div class="weather-info weather">
          <div class="info-box wind-info">Wind: ${windSpeed} m/s, ${windDirection}</div>
          <div class="info-box humidity-info">Humidity: ${humidity}%</div>
          <div class="info-box visibility-info">Visibility: ${visibility} km</div>
        </div>
      </div>
    `;
  
    // Update popup HTML
    chrome.action.setPopup({ popup: 'weather.html' });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        document.getElementById('container').style.display = 'block';
        document.querySelector('.container').innerHTML = '${popupHtml}';
      }
    });
  }
  
  // Function to get wind direction based on degrees
  function getWindDirection(degrees) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((degrees % 360) / 45);
    return directions[index];
  }
  
  // Event listener for search button click in popup
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const city = document.getElementById('city-input').value;
        if (city) {
          fetchWeather(city)
            .then(weatherData => {
              return Promise.all([weatherData, fetchCityImage(city)]);
            })
            .then(([weatherData, cityImageUrl]) => {
              updatePopup(weatherData, cityImageUrl);
            })
            .catch(error => {
              console.error('Error fetching weather data:', error);
              alert('City not found!');
            });
        } else {
          alert('Please enter a city name.');
        }
      }
    });
  });
  