var map;
var panorama;

function initMap() {
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: {
            lat: -34.397,
            lng: 150.644
        }
    });
    var geocoder = new google.maps.Geocoder();

    document.getElementById('submit').addEventListener('click', function () {
        geocodeAddress(geocoder, map);
        

    });
    var sv = new google.maps.StreetViewService();
    panorama = new google.maps.StreetViewPanorama(document.getElementById('pano'));
    
}

function geocodeAddress(geocoder, resultsMap) {
    var address = document.getElementById('address').value;
    geocoder.geocode({
        'address': address
    }, function (results, status) {
        if (status === 'OK') {
            resultsMap.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: resultsMap,
                position: results[0].geometry.location
            });
            let latlong = JSON.stringify(marker.position);
            let splitLatLong = latlong.split(',');
            let myLat = splitLatLong[0].split(':');
            let firstLong = splitLatLong[1].split(':');
            let myLong = ("" + firstLong[1]).replace("}", "");
            console.log('This is the latitude of', address + ' : ', myLat[1]);
            console.log('This is the longitude of', address + ' : ', myLong);
            
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}


window.addEventListener('load', () => {
  let lat;
  let long;
  let key = '8b9fb0f997204e2487c49916e25f3c18';
  let city;
  const cityRegEx = /(?<city>\w+)/;

  const loc = document.querySelector('#location');
  const container = document.getElementById('container');
  const weatherDescription = document.querySelector('.weather-description');
  const tempType = document.querySelector('.temp-type');
  const weatherLocation = document.querySelector('.weather-location');
  const weatherType = document.querySelector('.temp');
  const tempSection = document.querySelector('.temp-section');
  const tempSectionSpan = document.querySelector('.temp-section span');






  container.classList.remove("rainyday", "cloudyday", "clearday")

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {

      lat = position.coords.latitude;
      long = position.coords.longitude;

      const api = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}`;

      fetch(api, {mode: 'cors'})
          .then(response => {
            return response.json();
          })
          .then(data => {
            const {temp, humidity} = data.main;
            const {main, description} = data.weather[0];
            const name = data.name;

            updateUI(description, temp, name, main);
          });

    });


  };


  document.querySelector('#search-form').addEventListener('submit', function(e)
    {
      e.preventDefault();
      container.classList.remove("rainyday", "cloudyday", "clearday")
      const location = document.querySelector('#location').value;
      loc.textContent = `${location}`

      // Extracting city and country out of string
      if (location.length > 0) {
        city = location.match(cityRegEx).groups.city;

        // Clearing the input field after submit
        document.querySelector('#location').value = '';


        // Generate api url with city and country name
        const api = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`

        // Fetching data via the api
        fetch(api, {mode: 'cors'})
          .then(response => {
            return response.json();
          })
          .then(data => {
            console.log(data);
            const {temp, humidity} = data.main;
            const {main, description} = data.weather[0];
            const name = data.name;

            updateUI(description, temp, name, main);

          })
          .catch(e => {
            console.log(e);
          })

      } else {
        alert("Please input city, country");
      }

    });


  function updateUI(description, temp, name, main) {
    const celsius = Math.round(temp - 273.15);
    const fahrenheit = Math.round((temp - 273.15) * 9/5 + 32);

    weatherDescription.textContent = description;
    weatherLocation.textContent = name;
    weatherType.textContent = main;
    tempType.textContent = `${celsius}`;


    tempSection.addEventListener('click', () => {
      if (tempSectionSpan.textContent === "°C"){
        tempSectionSpan.textContent = "°F"
        tempType.textContent = `${fahrenheit}`
      }else {
        tempSectionSpan.textContent = "°C"
        tempType.textContent = `${celsius}`;
      }
    });

    //Changing the background gif based on the weather conditions
    if (description.includes("rain")) {
      container.classList.add("rainyday")
    } else if (description.includes("cloud")) {
      container.classList.add("cloudyday")
    } else {
      container.classList.add("clearday");
    }

  }

});


var pitch;

function initialize() {
  var query = urlstring;
   // location.search.substring(1);

  // split the rest at each "&" character to give a list of  "argname=value"  pairs
  var pairs = query.split("&");
  for (var i = 0; i < pairs.length; i++) {
    // break each pair at the first "=" to obtain the argname and value
    var pos = pairs[i].indexOf("=");
    var argname = pairs[i].substring(0, pos).toLowerCase();
    var value = pairs[i].substring(pos + 1).toLowerCase();

    // process each possible argname  -  use unescape() if theres any chance of spaces
    if (argname == "location") {
      var coords = value.split(",");
      lat = parseFloat(coords[0]);
      lng = parseFloat(coords[1]);
    }
    if (argname == "pitch") {
      pitch = parseFloat(value);
    }
    if (argname == "heading") {
      heading = parseFloat(value);
    }
    if (argname == "lat") {
      lat = parseFloat(value);
    }
    if (argname == "lng") {
      lng = parseFloat(value);
    }
  }
  if (!isNaN(lat) && !isNaN(lng)) {
    myLatLng = new google.maps.LatLng(lat, lng);
  }
  // Set up the map
  var myOptions = {
    zoom: 10,
    center: myLatLng,
    streetViewControl: false
  };

  map = new google.maps.Map(document.getElementById('map_canvas'),
    myOptions);

  panorama = new google.maps.StreetViewPanorama(document.getElementById("pano"));

  sv.getPanoramaByLocation(myLatLng, 50, processSVData);
}

function processSVData(data, status) {
  if (status == google.maps.StreetViewStatus.OK) {
    var marker = new google.maps.Marker({
      position: data.location.latLng,
      draggable: true,
      map: map,
      title: data.location.description
    });

    panorama.setPano(data.location.pano);
    if (isNaN(heading))
      heading = google.maps.geometry.spherical.computeHeading(data.location.latLng, myLatLng);
    if (isNaN(pitch)) pitch = 0;
    // alert(data.location.latLng+":"+myLatLng+":"+heading);
    panorama.setPov({
      heading: heading,
      pitch: pitch,
      zoom: 1
    });
    panorama.setVisible(true);

    google.maps.event.addListener(marker, 'click', function() {

      var markerPanoID = data.location.pano;
      // Set the Pano to use the passed panoID
      panorama.setPano(markerPanoID);
      panorama.setPov({
        heading: 270,
        pitch: 0,
        zoom: 1
      });
      panorama.setVisible(true);
    });
  } else {
    alert("Street View data not found for this location.");
  }
}

google.maps.event.addDomListener(window, 'load', initialize);
