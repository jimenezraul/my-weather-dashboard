// set all id's to variables
var search = $("#search");
var searchBtn = $("#search-btn");
var message = $("#message");
var weatherCol = $("#weather-col");
var forecast = $("#forecast");
var forecastCol = $("#forecast-col");
var historyEl = $("#history");
// set city history object
var cityHistory = {};
// open weather api
var apiKey = "2c55cf825b3d6637f09bec8a5d37fed0";

// on load
$(document).ready(onLoad());

// show weather
var showWeather = function (data) {
  var today = moment().format("MM/DD/YYYY");
  var uvi_index = data.uvi;
  var uvi_color = "";

  // set uvi color
  if (uvi_index <= 2) {
    uvi_color = "bg-success";
  } else if (uvi_index > 2 && uvi_index <= 5) {
    uvi_color = "bg-warning";
  } else {
    uvi_color = "bg-danger";
  }

  weatherCol.addClass("bg-white border border-dark p-3 rounded");
  var h2 = `<h2 class="fw-bold">${data.city} (${today}) <img class='weather-icon btn-history rounded-circle' 
  src='https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png' alt='' /></h2>`;
  var p = `<p>Temp: ${data.temp}ºF</p>
    <p>Wind: ${data.wind} MPH</p>
    <p>Humidity: ${data.humidity} %</p>
    <p>UV index: <span class="badge ${uvi_color} p-2">${uvi_index}</span></p>`;
  weatherCol.append(h2);
  weatherCol.append(p);
};

// show 5 days forecast
var showFiveDaysWeather = function (arr) {
  forecastCol.removeClass("d-none");
  // create all elements for each day
  arr.forEach((day) => {
    var text = day.dt_txt.split(" ")[0];
    text = text.split("-");
    text = `${text[1]}/${text[2]}/${text[0]}`;
    var div = $("<div>");
    div.addClass(
      "rounded col-5 col-lg-3 col-xl-2 offset-xl-0 bg-card p-2 mt-1"
    );
    // add class to 2nd div and 3rd div
    var index = arr.indexOf(day) + 1;
    if (index === 2 || index === 3) {
      div.addClass("offset-lg-1");
    }
    var h4 = `<h4>${text}</h4>`;
    var img = `<img class='weather-icon btn-history rounded-circle my-2' 
    src="https://openweathermap.org/img/wn/${day.weather[0].icon}@4x.png" alt=""/>`;
    var p = `<p>Temp: ${day.main.temp}ºF</p>
        <p>Wind: ${day.wind.speed} MPH</p>
        <p>Humidity: ${day.main.humidity} %</p>`;
    div.append(h4);
    div.append(img);
    div.append(p);
    forecast.append(div);
  });
  saveWeather();
};

// show error message
var errorMessage = function (message) {
  var h3 = `<h3><span class="badge bg-danger">${message}</span></h3>`;
  $("#city-message").append(h3);
  setTimeout(function () {
    $("#city-message h3").remove();
  }, 3000);
  return;
};

// save weather to local storage
var saveWeather = function () {
  localStorage.setItem("cities", JSON.stringify(cityHistory));
};

// fetch 5 days forecast
var getFiveDaysWeather = function (city) {
  var url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`;
  fetch(url).then(function (response) {
    if (response.ok) {
      response.json().then(function (data) {
        cityHistory.city.forEach(function (weather) {
          if (weather.city.toUpperCase() === city.toUpperCase()) {
            var myList = [];
            data.list.filter((day) => {
              if (day.dt_txt.endsWith("00:00:00")) {
                myList.push(day);
              }
            });
            weather.forecast = myList;
            showFiveDaysWeather(myList);
          }
        });
      });
    } else {
      errorMessage(`City ${response.statusText}`);
    }
  });
};

// get uvi index
var getUviIndex = async function (coord) {
  var lat = coord.lat;
  var lon = coord.lon;
  var URL = `https://api.openweathermap.org/data/2.5/onecall?appid=${apiKey}&lat=${lat}&lon=${lon}`;
  var res = await fetch(URL);
  res = await res.json();
  return res.current.uvi;
};

// remove all elements
var resetEl = function () {
  weatherCol.empty();
  weatherCol.removeClass("bg-white border border-dark p-3 rounded");
  forecast.empty();
  forecastCol.addClass("d-none");
};

// fetch weather
var getWeather = function (city) {
  var url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`;
  fetch(url)
    .then(function (response) {
      if (response.ok) {
        response.json().then(async function (data) {
          addToHistory(city);
          var uvi = await getUviIndex(data.coord);
          var weather = {
            city: data.name,
            temp: data.main.temp,
            humidity: data.main.humidity,
            weather: data.weather,
            uvi: uvi,
            forecast: [],
            wind: data.wind.speed,
          };
          //push city weather to cityHistory
          cityHistory.city.push(weather);
          resetEl();
          getFiveDaysWeather(city);
          showWeather(weather);
        });
      } else {
        // message on city not found
        errorMessage(`City ${response.statusText}`);
      }
    })
    .catch(function (e) {
      // message on connection error
      errorMessage("Check your connection and try again");
    });
  resetEl();
};

function addToHistory(city) {
  var btn = $("<button>");
  btn.addClass("btn btn-history mt-1 mb-1 text-capitalize");
  btn.text(city);
  historyEl.append(btn);
  $(".btn-history").click(function () {
    historyBtnHandler($(this).index());
  });
}

// check if city is in history
var checkWeatherExist = function (city) {
  var cityExist = false;
  var index = 0;
  cityHistory.city.forEach((weather) => {
    if (weather.city.toUpperCase() === city.toUpperCase()) {
      cityExist = true;
      index = cityHistory.city.indexOf(weather);
    }
  });
  if (!cityExist) {
    getWeather(city);
  } else {
    historyBtnHandler(index);
  }
  return;
};

// search handler
var searchHandler = function (e) {
  e.preventDefault();
  var city = search.val().trim();

  // capitalize first letter after every space
  city = city.split(" ");
  city.forEach((word, index) => {
    city[index] = word.charAt(0).toUpperCase() + word.slice(1);
  });
  city = city.join(" ");

  // city is empty show warning message
  if (!city) {
    if ($("#message p").length === 0) {
      var p = "<p class='text-danger mt-3'>City name can't be blank.</p>";
      message.append(p);
      setTimeout(function () {
        $("#message p").remove();
      }, 3000);
      return;
    }
  } else if (city.match(/\d/g)) {
    var p = "<p class='text-danger mt-3'>City name can't contain numbers.</p>";
    message.append(p);
    setTimeout(function () {
      $("#message p").remove();
    }, 3000);
    search.val("");
    return;
  } else {
    search.val("");
    resetEl();
    checkWeatherExist(city);
  }
};

// history btn handler
var historyBtnHandler = function (num) {
  resetEl();
  showWeather(cityHistory.city[num]);
  showFiveDaysWeather(cityHistory.city[num].forecast);
};

// show city history
function showHistoryEl(data) {
  data.city.forEach((weather) => {
    addToHistory(weather.city);
  });
}

// on page load get local storage history and set object
function onLoad() {
  var cities = JSON.parse(localStorage.getItem("cities"));
  if (!cities) {
    cityHistory = {
      city: [],
    };
  } else {
    cityHistory = cities;
    showHistoryEl(cityHistory);
  }
}

// listen to search button click
searchBtn.click(searchHandler);
