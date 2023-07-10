
var searchButton = document.querySelector("#searchBtn");


searchButton.addEventListener("click", searchCity)

function searchCity(event) {
    event.preventDefault();
}

console.log(getWeatherData(44.34, 10.99));

async function getWeatherData(lat, lon) {
    await fetch("https://api.openweathermap.org/data/2.5/forecast?lat={"+lat+"}&lon={"+lon+"}&appid={"+apiKey+"}")
    .then(response => {
        return response.json();
    }).catch( console.error() );
}