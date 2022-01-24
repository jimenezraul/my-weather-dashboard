var search = $("#search");
var searchBtn = $("#search-btn");
var message = $("#message");
var cityHistory = {};
var apiKey = "2c55cf825b3d6637f09bec8a5d37fed0";

$(document).ready(onLoad());

var errorMessage = function (message) {
  var p = `<h3><span class="badge bg-danger">${message}</span></h3>`;
  $("#city-message").append(p);
  setTimeout(function () {
    $("#city-message h3").remove();
  }, 3000);
  return;
};

var saveWeather = function () {
  console.log(cityHistory);
};

var getWeather = function (city) {
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
  fetch(url)
      .then(function (response) {
        if (response.ok) {
            response.json().then(function (data) {
              console.log(data)
            });
          } else {
            errorMessage(`City ${response.statusText}`)
          }
    })
};

var checkWeather = function (city) {
  if (!!cityHistory.city.length) {
    cityHistory.city.forEach((weather) => {
      console.log(weather.city === city);
    });
  }
  getWeather(city);
  saveWeather();
};

var searchHandler = function () {
  var city = search.val().trim();
  if (!city) {
    if ($("#message p").length === 0) {
      var p = "<p class='text-danger'>City must be filled out</p>";
      message.append(p);
      setTimeout(function () {
        $("#message p").remove();
      }, 3000);
      return;
    }
  }
  checkWeather(city);
};

function onLoad() {
  var cities = localStorage.getItem("cities");
  if (!cities) {
    cityHistory = {
      city: [],
    };
  } else {
    cityHistory = cities;
  }
}

searchBtn.click(searchHandler);
