
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('search-button').addEventListener('click', () => {
      const city = document.getElementById('city-input').value.trim(); // Trim to remove leading/trailing spaces
  
      if (city) {
        fetchWeather(city); // Call fetchWeather function if city name is provided
      } else {
        alert('Please enter a city name.'); // Show an alert if no city name is entered
      }
    });
  
    function fetchWeather(city) {
      const apiKey = 'a08955ad82d15f896550dbf7ebe9007b'; // Replace with your actual API key
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  
      fetch(weatherUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
              updateWeatherCard(data); // Update weather card with fetched data
              fetchCityImage(city);    // Fetch city image after fetching weather data
              document.querySelector('.search-bar').style.display = 'none'; // Hide the search bar
            } else {
              alert('City not found!'); // Show an alert if city is not found
            }
          })
        .catch(error => {
          console.error('Error fetching weather data:', error);
        });
    }
    function updateWeatherCard(data) {
        const weatherCard = document.getElementById('weather-card');
        if (!weatherCard) {
          console.error('Weather card element not found.');
          return;
        }
      
        weatherCard.style.display = 'block'; // Display the weather card
  
      // Convert city name to uppercase and display
      const cityName = data.name.toUpperCase();
      weatherCard.querySelector('.city-name').textContent = cityName;
  
      // Format day, date, and time
      const now = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayOfWeek = daysOfWeek[now.getDay()];
      const options = { month: 'long', day: 'numeric' };
      const monthAndDate = now.toLocaleDateString('en-US', options).toUpperCase().replace(',', '');
      const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
      // Update weather card elements
      weatherCard.querySelector('.date').textContent = `${dayOfWeek.toUpperCase()} | ${monthAndDate} | ${time}`;
      weatherCard.querySelector('.temp-value').textContent = Math.round(data.main.temp);
      weatherCard.querySelector('.additional-info .info:nth-child(1) .value').textContent = `${Math.round(data.main.temp_min)}°C`;
      weatherCard.querySelector('.additional-info .info:nth-child(2) .value').textContent = `${Math.round(data.main.temp_max)}°C`;
  
      // Weather conditions
      const weatherDescription = data.weather[0].description;
      weatherCard.querySelector('.weather-description').textContent = weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
  
      // Wind speed and direction
      const windSpeed = data.wind.speed;
      const windDirection = data.wind.deg;
      weatherCard.querySelector('.wind-info').textContent = `Wind: ${windSpeed} m/s, ${getWindDirection(windDirection)}`;
  
      // Humidity level
      const humidity = data.main.humidity;
      weatherCard.querySelector('.humidity-info').textContent = `Humidity: ${humidity}%`;
  
      // Visibility
      const visibility = data.visibility / 1000; // Convert to kilometers
      weatherCard.querySelector('.visibility-info').textContent = `Visibility: ${visibility.toFixed(1)} km`;
    }
  
    function fetchCityImage(city) {
        const unsplashAccessKey = '4Bs-E9oI_yQJMQFW7TB-AT0QXb4dh3IXjGI_4XzaZgY'; // Replace with your actual Unsplash API key
        const unsplashUrl = `https://api.unsplash.com/photos/random?query=${city}&client_id=${unsplashAccessKey}`;
      
        fetch(unsplashUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
          })
          .then(data => {
            if (data.errors) {
              console.error('Unsplash API Error:', data.errors);
              throw new Error('No image found for this city');
            }
            if (data.urls && data.urls.regular) {
              const weatherCard = document.getElementById('weather-card');
              weatherCard.style.backgroundImage = `url(${data.urls.regular})`;
              weatherCard.style.backgroundSize = 'cover';
              weatherCard.style.backgroundPosition = 'center';
            } else {
              console.error('No image found for this city.');
            }
          })
          .catch(error => {
            console.error('Error fetching city image:', error);
          });
      }
      
  
    function getWindDirection(degrees) {
      const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
      const index = Math.round((degrees % 360) / 45);
      return directions[index];
    }
  });
  