$(document).ready(function () {
    const apiKey = 'd56f1322db57717129fe1d915e89df1f';
    const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';

    // Function to get weather data from OpenWeather API using fetch
    async function getWeatherData(city) {
        const queryUrl = `${apiUrl}?q=${city}&units=metric&appid=${apiKey}`;

        try {
            const response = await fetch(queryUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Process and display current weather
            displayCurrentWeather(data);

            // Process and display 5-day forecast
            displayForecast(data);

            // Save city to search history
            saveToHistory(city);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    // Function to display current weather
    function displayCurrentWeather(data) {
        const currentWeather = data.list[0];
        const cityName = data.city.name;
        const date = dayjs(currentWeather.dt_txt).format('MMMM D, YYYY');
        const icon = currentWeather.weather[0].icon;
        const temperature = currentWeather.main.temp;
        const humidity = currentWeather.main.humidity;
        const windSpeed = currentWeather.wind.speed;

        // Update HTML with current weather information
        $('#today').html(`
      <h2>${cityName} (${date}) <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${currentWeather.weather[0].description}"></h2>
      <p>Temperature: ${temperature} °C</p>
      <p>Humidity: ${humidity}%</p>
      <p>Wind Speed: ${windSpeed} m/s</p>
    `);
    }

    // Function to display 5-day forecast
    function displayForecast(data) {
        const forecastList = data.list;
        $('#forecast').empty();

        for (let i = 0; i < forecastList.length; i += 8) {
            const forecast = forecastList[i];
            const date = dayjs(forecast.dt_txt).format('MMMM D, YYYY');
            const icon = forecast.weather[0].icon;
            const temperature = forecast.main.temp;
            const humidity = forecast.main.humidity;

            // Create forecast card and append to HTML
            const forecastCard = `
        <div class="col-md-2">
          <div class="card">
            <div class="card-body">
              <h5>${date}</h5>
              <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${forecast.weather[0].description}">
              <p>Temp: ${temperature} °C</p>
              <p>Humidity: ${humidity}%</p>
            </div>
          </div>
        </div>
      `;
            $('#forecast').append(forecastCard);
        }
    }

    // Function to save city to search history
    function saveToHistory(city) {
        const historyList = JSON.parse(localStorage.getItem('searchHistory')) || [];

        // Check if the city is not already in the history list (case-insensitive)
        const isDuplicate = historyList.some((savedCity) => savedCity.toLowerCase() === city.toLowerCase());

        if (!isDuplicate) {
            historyList.push(city);
            localStorage.setItem('searchHistory', JSON.stringify(historyList));

            // Update the history list in the UI
            displayHistory();
        }
    }

    // Function to display search history
    function displayHistory() {
        const historyList = JSON.parse(localStorage.getItem('searchHistory')) || [];
        $('#history').empty();

        // Button to clear local storage
        const clearButton = $('<button>').addClass('btn btn-danger mb-3').text('Clear History');
        $('#history').append(clearButton);

        // Event listener for clear button
        clearButton.on('click', function () {
            localStorage.removeItem('searchHistory');
            displayHistory(); // Update the history list in the UI after clearing
        });

        // Display individual history items
        for (const city of historyList) {
            const historyItem = $('<a>').addClass('list-group-item list-group-item-action').text(city);
            $('#history').append(historyItem);
        }
    }

    // Event listener for search form submission
    $('#search-form').submit(function (event) {
        event.preventDefault();
        const city = $('#search-input').val().trim();

        if (city !== '') {
            getWeatherData(city);

            // Clear the input field after search
            $('#search-input').val('');
        }
    });

    // Event listener for clicking on a city in the search history
    $('#history').on('click', 'a', function () {
        const city = $(this).text();
        getWeatherData(city);
    });

    // Initialize the application
    displayHistory();
});
