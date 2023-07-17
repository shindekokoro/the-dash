$(function () {
    // Get Display elements to display/manipulate globally
    // var main = document.getElementById("weatherDisplay");
    var forecastContainer = document.getElementById("forecast");
    var spotlightDay = document.getElementById("spotlightDay");
    var searchButton = document.querySelector("#citySearch");
    var searchInput = document.querySelector("#cityList");
    var searchedList = document.getElementById("searchedList")
    var weatherData = {};

    var searchedCities = localStorage.getItem("searchedCities") ? JSON.parse(localStorage.getItem("searchedCities")) : [];
    renderSearchedCities();
    searchButton.addEventListener("submit", searchForCity);

    getLocation();

    // Search City Event listener function
    async function searchForCity(event, storedSearch) {
        if (event) {
            event.preventDefault();
        }

        // Get input value and reset to clear form
        var city = storedSearch ? storedSearch : searchInput.value.trim();
        if (city === "") {
            return;
        }
        searchInput.value = "";
        var forecastCounter = 0;
        var currentForecast = "";

        // Get weather data, if nothing is found return
        await getWeatherData(city);
        // User probably entered nothing("") or 404
        if (!weatherData) {
            return;
        } else if (weatherData.cod == "404") {
            return searchInput.value = "City Not Found";
        } else {
            var formattedLocation = weatherData.city.name + ", " + weatherData.city.country;
            searchedCities.indexOf(formattedLocation) === -1 ? searchedCities.push(weatherData.city.name + ", " + weatherData.city.country) : "";

            localStorage.setItem("searchedCities", JSON.stringify(searchedCities));
        }

        // Iterate and render each day for weather data
        weatherData.list.forEach(data => {
            // Account for UTC/Local time for forecast data
            var utcOffset = data.dt - weatherData.city.timezone;
            var day = dayjs.unix(utcOffset).format("M/D/YYYY");
            if (!forecastCounter) {
                renderDay("#spotlightDay", day, "h2", data);
                currentForecast = day;
                forecastCounter++;
            } else if (day !== currentForecast) {
                renderDay("#day" + forecastCounter++, day, "h3", data);
                currentForecast = day;
            }
        });

    }

    // Render a day for the WeatherDisplay Container
    // Function takes in:
    // IDtag name, a day (M/D/YYYY)
    // header size (h2/h3, etc), object data from weather data list
    function renderDay(id, day, header, listData) {
        spotlightDay.style.display = "inline";
        forecastContainer.style.display = "flex";

        // Create the day container inside forecast or spotlight day.
        var container = id === "#spotlightDay" ? document.querySelector(id) : document.createElement("div");
        if (id !== "#spotlightDay") {
            if (id === "#day1") {
                forecastContainer.replaceChildren(container);
            } else {
                forecastContainer.appendChild(container);
            }

        }

        // Create the elements for the day.
        var dayHeader = document.createElement(header);
        var img = document.createElement("img");
        var temp = document.createElement("p");
        var wind = document.createElement("p");
        var humidity = document.createElement("p");

        // Set element values
        dayHeader.textContent = id === "#spotlightDay" ? weatherData.city.name + " (" + day + ")" : day;
        img.src = "https://openweathermap.org/img/wn/" + listData.weather[0].icon + "@2x.png";
        img.setAttribute("width", "30px")
        temp.textContent = "Temp: " + Math.floor(listData.main.temp) + "°F";
        wind.textContent = "Wind: " + listData.wind.speed + " MPH";
        humidity.textContent = "Humidity: " + listData.main.humidity + "%";

        // Replace, then append children elements.
        container.replaceChildren(dayHeader);
        dayHeader.appendChild(img);
        container.appendChild(temp);
        container.appendChild(wind);
        container.appendChild(humidity);

        renderSearchedCities()
    }

    async function getWeatherData(cityName) {
        var units = "imperial";
        // If "City Name" is NaN search by name, else search by ID
        var searchTerm = "";
        if (!isNaN(parseInt(cityName))) {
            searchTerm = "id=" + cityName;
        } else if (cityName.split("=")[0] === "lat") {
            searchTerm = cityName;
        } else {
            searchTerm = "q=" + cityName;
        }
        console.log(searchTerm);
        await fetch("https://api.openweathermap.org/data/2.5/forecast?" + searchTerm + "&units=" + units + "&appid=" + apiKey)
            .then(response => {
                return response.json();
            }).then(data => {
                weatherData = data;
            }).catch(console.error());
    }

    function renderSearchedCities() {
        console.log(searchedCities);
        searchedCities.forEach((cityName, index) => {
            var li = document.createElement("li");
            li.setAttribute("class", "btn")
            if (index === 0) {
                searchedList.replaceChildren(li)
            } else {
                searchedList.appendChild(li);
            }
            li.textContent = cityName;

            li.addEventListener("click", function (event) {
                var element = event.target;
                searchForCity(event, element.textContent);
            })
        });
    }

    $("#cityList").autocomplete({
        source: function (request, response) {
            $.getJSON("assets/js/fullcity.list.json", function (data) {
                response($.map(data, function (value) {
                    var formattedLocation = value.name;
                    var searchLocation = value.name;
                    if (value.state) {
                        formattedLocation += ", " + value.state;
                        searchLocation += " " + value.state;
                    }
                    if (value.country) {
                        formattedLocation += ", " + value.country;
                        searchLocation += " " + value.country;
                    }
                    if (searchLocation.toLowerCase().includes(request.term.toLowerCase())) {
                        var formattedLocation = value.name;
                        if (value.state) {
                            formattedLocation += ", " + value.state;
                        }
                        if (value.country) {
                            formattedLocation += ", " + value.country;
                        }
                        return [{
                            label: formattedLocation,
                            value: value.id
                        }];
                    }
                }));
            });
        },
        select: function (event, ui) {
            searchForCity(event, ui.item.value)
        },
        minLength: 3,
        delay: 300
    });
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                searchForCity(null, "lat=" + lat + "&lon=" + lon);
            });

        }
        else {
            console.log("No location found");
        }
    }
});