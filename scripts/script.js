// APIs Used:
// Google JS Maps Library
// Google places nearby
// Google Places Details
// Google text search


const pitstop = {};
pitstop.thiKey = "AIzaSyDCyp8JtEraKwveheT6vsFzLsG8e7UwG-Q"; //thi
pitstop.lindaKey = "AIzaSyDzOkHWOtzDgG_6drpT4GbqgHwnTIApsTg"; //linda
pitstop.joeyKey = "AIzaSyCYkPjAGfsJm2ow3qnk7HzHX0Q62oVdYiI"; // Joey
pitstop.joey2Key = "AIzaSyChv5l9YHQ-H1rQdoq-mP3_1P1XEMwd3zY"; // Joey 2
pitstop.currentKey = pitstop.joeyKey;


pitstop.userInputs = function () {
  $('form').on('submit', function (event) {
    event.preventDefault();
    //trigger CSS changes - show map view
    pitstop.switchToMapView();

    const userStart = $('input[name=userStartPoint]').val();
    const userEnd = $('input[name=userEndPoint]').val();

    // get coords from text search (promise)
    const start = pitstop.getCoordsFromTextSearch(userStart);
    const end = pitstop.getCoordsFromTextSearch(userEnd);

    const midpointPromise = pitstop.getDirections(userStart, userEnd);
    $.when(midpointPromise)
      .then((res) => {
        // const bounds = res.routes[0].bounds
        // km in route from start to end
        const totalDistance = res.routes[0].legs[0].distance.value;
        const halfwayDistance = totalDistance * 0.5;

        // Step Counter for finding the first location past halfway
        let currentDistance = 0;
        const placesPastHalf = [];

        res.routes[0].legs[0].steps.map((step) => {
          const stepDistance = step.distance.value;
          const startCoord = step.end_location;
          currentDistance += stepDistance;
          if (currentDistance > halfwayDistance) {
            placesPastHalf.push(startCoord);
          }
        });

        const firstPlacePastHalf = placesPastHalf[0];
        initMap(firstPlacePastHalf);
        // findLocationNearby() using midway coords
        pitstop.locationNearby(firstPlacePastHalf);
      })
      .fail((error) => {
        console.log(error);
        alert("Unable to communicate with Google Maps. API Key has reached quota, check back tomorrow!")
      });
  });
};

// First ajax request will be pulling down information from google places through a text search that the user inputs.
// Returns long and lat when given name of a place
pitstop.getCoordsFromTextSearch = function (location) {
  return $.ajax({
    url: "https://proxy.hackeryou.com",
    method: "GET",
    dataType: "json",
    data: {
      reqUrl:
        "https://maps.googleapis.com/maps/api/place/textsearch/json",
      params: {
        key: pitstop.currentKey,
        query: location
      }
    }
  });
};

pitstop.getDirections = (userStart, userEnd) => {
  // search using english words
  return $.ajax({
    url: "https://proxy.hackeryou.com",
    method: "GET",
    dataType: "json",
    data: {
      reqUrl:
        "https://maps.googleapis.com/maps/api/directions/json",
      params: {
        key: pitstop.currentKey,
        origin: userStart,
        destination: userEnd,
      }
    }
  });
}

// Create a function to request google place details api for the details of each location.
pitstop.getLocationDetails = function (place) {
  return $.ajax({
    url: "https://proxy.hackeryou.com",
    method: "GET",
    dataType: "json",
    data: {
      reqUrl: "https://maps.googleapis.com/maps/api/place/details/json",
      params: {
        key: pitstop.currentKey,
        placeid: place
      }
    }
  });

};

// Create a function to request google nearby search api for locations near the given halfway location.
pitstop.locationNearby = function (geolocation) {
  $.ajax({
    url: "https://proxy.hackeryou.com",
    method: "GET",
    dataType: "json",
    data: {
      reqUrl:
        "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
      params: {
        key: pitstop.currentKey,
        location: `${geolocation.lat},${geolocation.lng}`,
        radius: 1500,
        type: "restaurant"
      }
    }
  }).then(res => {
    const nearbyPlaces = res.results;
    

    // Use the following function to get the placeIds for each nearby place and send it to the LocationDetails function
    const nearbyPlacesPlaceIds = nearbyPlaces.map((item) => {
      return (item.place_id);
    });

    // Make array of promises from place details ajax call (full objects)
    const places = nearbyPlacesPlaceIds.map(pitstop.getLocationDetails);
    $.when(...places).then((...placeArgs) => {
      placeArgs = placeArgs.map(el => el[0]);
      $(".restoDetailsPanel").empty();
      $(".landing.minimize").hide();
      $(".restoDetailsPanel").slideToggle();

      // Show the "Find my pitstops" button, only if it doesn't already exist
      if ($('.btn__showList').length === 0) {
        $("main").append(`<input type="submit" class="btn__showList" value="My Pitstops">`);
      }
      
      placeArgs.forEach(res => {
        const name = res.result.name;
        const formattedAddress = res.result.formatted_address;
        // const openNow = res.result.opening_hours.open_now;
        // const fullHours = res.result.opening_hours.weekday_text;
        const rating = Math.round(res.result.rating);
        const priceLevel = res.result.price_level; // Ranges from 0 - 4
        const phoneNumber = res.result.formatted_phone_number;
        const website = res.result.website;
        const mapLink = res.result.url;


        $(".restoDetailsPanel").append(
          `<div class="restoDetailsItem">
            <h3 class="heading--resto heading">${name}</h3>
            <div class="restoDetailsPanel__basicInfo">
                ${rating ? `<p class="rating${rating} symbol" />` : ""}
                ${priceLevel ? `<p class="price${priceLevel} symbol" />` : ""}
            </div>
            <div class="restoDetailsPanel__locate">
                ${ website ?
                  `<h4 class="heading--details heading">
                  Website:
                  <a href="${website}">${website}</a></h4>`
                : ''}

                ${
                  phoneNumber ?
                  `<h4 class="heading--details heading">
                  Phone:
                  <span>${phoneNumber}</span>
                  </h4>`
                  : ""
                }
                
                <h4 class="heading--details heading">
                Address:
                <p>${formattedAddress}</p>
                </h4>
            </div>
            <a href="${mapLink}" class="restoDetailsPanel__btn">
                Find on Google Maps
            </a>
            </div>`);

        // Make array of long and lat
        const nearbyPlacesCoords = nearbyPlaces.map(item => {
          const nearbyPlaceLat = item.geometry.location.lat;
          const nearbyPlaceLong = item.geometry.location.lng;
          const nearbyPlaceName = item.name;
          const nearbyLatLong = [];
          nearbyLatLong.push(nearbyPlaceLat, nearbyPlaceLong, nearbyPlaceName);
          return nearbyLatLong;
        });
        // Use long and lat to plot markers
        pitstop.plotMarkers(nearbyPlacesCoords);
      });

      // If there are no resturants at midpoint, append an error message
      if (res.results.length === 0) {
        console.log('no restaurants found in the midpoint of this route! Please try again.')
        $(".restoDetailsPanel").append("<p>No restaurants found in the midpoint of this route! Please try again.</p>");
      }

    });

  });
};

// Function used to create markers on the generated google map
pitstop.plotMarkers = function (coordArr) {
  for (i = 0; i < coordArr.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(coordArr[i][0], coordArr[i][1]),
      map: pitstop.Map
    });

    infowindow = new google.maps.InfoWindow();
    google.maps.event.addListener(marker, "click", (function (marker, i) {
      return function () {
        infowindow.setContent(coordArr[i][2]);
        infowindow.open(pitstop.Map, marker);
      };
    })(marker, i));

  }
};

function initMap(coords) {
  // Create a map centered around the midpoint of route
  pitstop.Map = new google.maps.Map(document.getElementById("map"), {
    center: coords,
    zoom: 13
  });
}

pitstop.switchToMapView = () => {
  // .minimize triggers changes in css - show map only, move to top left
  $('.landing').addClass('minimize');
  $(".btn__startEnd").val('Recalculate');
}

// Application initializing function
pitstop.init = function () {
  pitstop.userInputs();
  $('.restoDetailsPanel').hide();
};

pitstop.events = () => {
  // When button is clicked show panel
  $("main").on("click", ".btn__showList", () => {
    $(".restoDetailsPanel").slideToggle('slow');
    $('.landing.minimize').hide();
  });

  $('.btn__showForm').on('click', () => {
    $('.landing.minimize').slideToggle('slow');
    $(".restoDetailsPanel").hide();
  });

}
// Document Ready Function
$(function () {
  pitstop.init();
  pitstop.events();
}); 