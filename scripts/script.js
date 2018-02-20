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
pitstop.currentKey = pitstop.joey2Key;


pitstop.userInputs = function () {
    $('form').on('submit', function (event) {
        event.preventDefault();
        //trigger CSS changes - show map view
        pitstop.switchToMapView();

        const userStart = $('input[name=userStartPoint]').val();
        const userEnd = $('input[name=userEndPoint]').val();

        const start = pitstop.getCoordsFromTextSearch(userStart);
        const end =  pitstop.getCoordsFromTextSearch(userEnd);

        $.when(start,end)
            .then((startRes,endRes) => {
                const startLat = startRes[0].results[0].geometry.location.lat;
                const startLong = startRes[0].results[0].geometry.location.lng;
                const endLat = endRes[0].results[0].geometry.location.lat;
                const endLong = endRes[0].results[0].geometry.location.lng;
                const coords = [startLat,startLong,endLat,endLong];
                // use findMiddlePoint() to give us x and y coords on midpoint in array
                const mid = pitstop.findMiddlePoint(coords);
                // generates map centered at midpoint
                initMap(mid);
                // findLocationNearby() using midway coords
                pitstop.locationNearby(mid);
            });
    });

};

// First ajax request will be pulling down information from google places through a text search that the user inputs.
pitstop.getCoordsFromTextSearch = function (location) {
    return $.ajax({
        url: "https://proxy.hackeryou.com",
        method: "GET",
        dataType: "json",
        data: {
            reqUrl:
                "https://maps.googleapis.com/maps/api/place/textsearch/json",
            params: {
                key: pitstop.lindaKey,
                query: location
            }
        }
    });
};


pitstop.findMiddlePoint = function(coord) {
    /*
    * Find midpoint between two coordinates points
    * Source : http://www.movable-type.co.uk/scripts/latlong.html
    */

    //-- Define radius function
    if (typeof (Number.prototype.toRad) === "undefined") {
        Number.prototype.toRad = function () {
            return this * Math.PI / 180;
        }
    };

    //-- Define degrees function
    if (typeof (Number.prototype.toDeg) === "undefined") {
        Number.prototype.toDeg = function () {
            return this * (180 / Math.PI);
        }
    };

    //-- Define middle point function
    function middlePoint(lat1, lng1, lat2, lng2) {

        //-- Longitude difference
        var dLng = (lng2 - lng1).toRad();

        //-- Convert to radians
        lat1 = lat1.toRad();
        lat2 = lat2.toRad();
        lng1 = lng1.toRad();

        var bX = Math.cos(lat2) * Math.cos(dLng);
        var bY = Math.cos(lat2) * Math.sin(dLng);
        var lat3 = Math.atan2(Math.sin(lat1) + Math.sin(lat2), Math.sqrt((Math.cos(lat1) + bX) * (Math.cos(lat1) + bX) + bY * bY));
        var lng3 = lng1 + Math.atan2(bY, Math.cos(lat1) + bX);

        //-- Return result
        return [lng3.toDeg(), lat3.toDeg()];
    };
    return middlePoint(...coord);
};


// First ajax request will be pulling down information from google places through a text search that the user inputs.
pitstop.getCoordsFromTextSearch = function (location){
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

// BELOW IS HOW THE AJAX REQUEST WOULD LOOK FOR NEARBY SEARCH
pitstop.locationNearby = function(geolocation) {
    $.ajax({
      url: "https://proxy.hackeryou.com",
      method: "GET",
      dataType: "json",
      data: {
        reqUrl:
          "https://maps.googleapis.com/maps/api/place/nearbysearch/json",
        params: {
          key: pitstop.currentKey,
          location: `${geolocation[1]},${geolocation[0]}`,
          radius: 1500,
          type: "restaurant"
        }
      }
    }).then(res => {
      const nearbyPlaces = res.results;

        // Use the following functon to get the placeIds for each nearby place and send it to the LocationDetails function  
        const nearbyPlacesPlaceIds = nearbyPlaces.map((item) => {
            return (item.place_id);
        });

      // make array of promises from place details ajax call (full objects)
      const places = nearbyPlacesPlaceIds.map(pitstop.getLocationDetails);
      $.when(...places).then((...placeArgs) => {
        placeArgs = placeArgs.map(el => el[0]);
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

          // stretch goal- figure out how to include openNow if no value exists
          // const openSymbol = (() => {
          //   if (openNow) {
          //     return `<p class="openNow">Open<p/>`;
          //   } else if (openNow === false) {
          //     return `<p class="closedNow">Closed<p/>`;
          //   }
          // })();

          const ratingSymbol = (() => {
            if (rating) {
              return `<p class="rating${rating} symbol" />`;
            } else {
              return "";
            }
          })();
          // const ratingSymbol = rating ? `<p class="rating${rating} symbol" />` : "" ;
          const priceSymbol = (() => {
            if (priceLevel) {
              return `<p class="price${priceLevel} symbol" />`;
            } else {
              return "";
            }
          })();
          
          $(".restoDetailsPanel").append(
            `<div class="restoDetailsItem">
            <h3 class="heading--resto heading">${name}</h3>
            <div class="restoDetailsPanel__basicInfo">
                ${ratingSymbol}
                ${priceSymbol}
            </div>

            <div class="restoDetailsPanel__locate">
                <h4 class="heading--details heading">
                Website:
                <a href="${website}">${website}</a></h4>
                <h4 class="heading--details heading">
                Phone:
                <span>${phoneNumber}</span>
                </h4>
                <h4 class="heading--details heading">
                Address:
                <p>${formattedAddress}</p>
                </h4>
            </div>
            <a href="${mapLink}" class="restoDetailsPanel__btn">
                Find on Google Maps
            </a>
            </div>`);

          // show the "Find my pitstops" button
          $("main").append(`<input type="submit" class="btn__showList btn--cta" value="Find My Pitstops">`);

          //when button is clicked show panel
          $(".btn__showList").on("click", () => {
            $(".restoDetailsPanel").slideToggle('slow');
          });

          // make array of long and lat
          const nearbyPlacesCoords = nearbyPlaces.map(item => {
            const nearbyPlaceLat = item.geometry.location.lat;
            const nearbyPlaceLong = item.geometry.location.lng;
            const nearbyPlaceName = item.name;
            const nearbyLatLong = [];
            nearbyLatLong.push(nearbyPlaceLat, nearbyPlaceLong, nearbyPlaceName);
            return nearbyLatLong;
          });
          // use long and lat to plot markers
          pitstop.plotMarkers(nearbyPlacesCoords);
        });

      });
      // pitstop.getLocationDetails(nearbyPlacesPlaceIds);
      // format the lat and long into objects in the format required for creating polyline and markers
    });
};

// // DISPLAY MARKERS FORMAT
// pitstop.hyCoords = { lat: 43.6484248, lng: -79.39792039999999 };

pitstop.plotMarkers = function(coordArr) {
    for (i = 0; i < coordArr.length; i++) {
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(coordArr[i][0], coordArr[i][1]),
        map: pitstop.Map
      });


    // infowindow = new google.maps.InfoWindow();  
    // google.maps.event.addListener(marker, "click", (function(marker, i) {
    //       return function() {
    //         infowindow.setContent('Test');
    //         infowindow.open(pitstop.Map, marker);
    //       };
            // wahtever.show(this)
    //     })(marker, i));


    infowindow = new google.maps.InfoWindow();  
    google.maps.event.addListener(marker, "click", (function(marker, i) {
          return function() {
            infowindow.setContent(coordArr[i][2]);
            infowindow.open(pitstop.Map, marker);
          };
        })(marker, i));

    }
};

// https://developers.google.com/maps/documentation/javascript/adding-a-google-map
function initMap(midpoint) {
    const midpointObject = {
        lat: midpoint[1],
        lng: midpoint[0]
    }
    // create a map centered around the midpoint of route
    pitstop.Map = new google.maps.Map(document.getElementById("map"), {
      center: midpointObject,
      zoom: 13
    });    
}

// https://developers.google.com/maps/documentation/javascript/directions#DisplayingResults


pitstop.switchToMapView = () => {
    // .minimize triggers changes in css - show map only, move to top left
    $('.landing').addClass('minimize');
    $(".btn__startEnd").val('Recalculate');

    // show button to show list of restos
    
    // STRETCH: mobile nav toggles input form 

}



pitstop.init = function () {
    pitstop.userInputs();
    $('.restoDetailsPanel').hide();
};



// Document Ready Function
$(function () {
    pitstop.init();
}); 
