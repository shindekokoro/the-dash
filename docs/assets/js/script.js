var searchButton = document.querySelector("#searchBtn");


searchButton.addEventListener("click", searchCity)

function searchCity(event) {
    event.preventDefault();
}

console.log(getWeatherData("Salt Lake City"));

async function getWeatherData(cityName) {
    await fetch("https://api.openweathermap.org/data/2.5/forecast?q={"+cityName+"}&appid={"+apiKey+"}")
    .then(response => {
        if (response.cod != 200) {
            return response.cod;
        } else {
            return response.json();
        }
    }).catch( console.error() );
}