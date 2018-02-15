const pitstop = {};

pitstop.userInputs = function () {
    $('form').on('submit', function (event) {
        event.preventDefault();
        const userStart = $('input[name=userStartPoint]').val();
        const userEnd = $('input[name=userEndPoint]').val();
        console.log(userStart);
        console.log(userEnd);
        const start = pitstop.getCoordsFromTextSearch(userStart);
        const end =  pitstop.getCoordsFromTextSearch(userEnd);

        $.when(start,end)
            .then((startRes,endRes) => {
                console.log(startRes[0].results[0].place_id);
                console.log(endRes[0].results[0].place_id);
                console.log(startRes[0].results[0].geometry.location.lat);
                console.log(startRes[0].results[0].geometry.location.lng);
                const startLat = startRes[0].results[0].geometry.location.lat;
                const startLong = startRes[0].results[0].geometry.location.lng;
                const endLat = endRes[0].results[0].geometry.location.lat;
                const endLong = endRes[0].results[0].geometry.location.lng;
                const coords = [startLat,startLong,endLat,endLong];
                console.log(coords);

                    // const placeId = res.results[0].place_id;
                    // console.log('The following is: PlaceID, Lat and Long')
                    // console.log(placeId);
                    // console.log(lat);
                    // console.log(long);
                    // const geolocation = []
                    // geolocation.push(lat, long);
                    // pitstop.locationNearby(geolocation);
                    // // pitstop.getLocationDetails(placeId);
            });
    })
}

pitstop.getCoordsFromTextSearch = function (location){
    // First ajax request will be pulling down information from google places through a text search that the user inputs.
    return $.ajax({
        url: 'https://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
            params: {
                key: 'AIzaSyCYkPjAGfsJm2ow3qnk7HzHX0Q62oVdYiI',
                query: location,
            }
        }
    })
};

    // Create a function to request google place details api for the details of each location.
pitstop.getLocationDetails = function (place) {
    $.ajax({
        url: 'https://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: 'https://maps.googleapis.com/maps/api/place/details/json',
            params: {
                key: 'AIzaSyCYkPjAGfsJm2ow3qnk7HzHX0Q62oVdYiI',
                placeid: place,
            }
        }
    }).then((res) => {
        const formattedAddress = res.result.formatted_address;
        const openingNow = res.result.opening_hours.open_now;
        const rating = res.result.rating;
        const priceLevel = res.result.price_level; // Ranges from 0 - 4
        console.log('The following is: Formatted Address, Open Now, Rating, Price Level')
        console.log(formattedAddress);
        console.log(openingNow);
        console.log(rating);
        console.log(priceLevel);
    });
}; 

    // The location infomration from text search will send over the locations lat and long to this function, which will use google places to search for nearby places and populate the map with that.
    // BELOW IS HOW THE AJAX REQUEST WOULD LOOK FOR NEARBY SEARCH
pitstop.locationNearby = function(geolocation) {
    $.ajax({
        url: 'https://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            params: {
                key: 'AIzaSyCYkPjAGfsJm2ow3qnk7HzHX0Q62oVdYiI',
                location: `${geolocation[0]},${geolocation[1]}`,
                radius: 1000,
            }
        }
    }).then((res) => {
        console.log('The following is places nearby the inputted location')
        console.log(res.results);
    });
};



/*
 * Find midpoint between two coordinates points
 * Source : http://www.movable-type.co.uk/scripts/latlong.html
 */

//-- Define radius function
if (typeof (Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

//-- Define degrees function
if (typeof (Number.prototype.toDeg) === "undefined") {
    Number.prototype.toDeg = function () {
        return this * (180 / Math.PI);
    }
}

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
}


pitstop.init = function () {
    pitstop.userInputs();
    initMap();
};

// DISPLAY GOOGLE MAP CENTERED AT HACKERYOU
pitstop.hyCoords = { lat: 43.6484248, lng: -79.39792039999999 };
pitstop.burgerPriestCoords = { lat: 43.6483623, lng: -79.39727259999999 };
pitstop.finchStationCoords = { lat: 43.780371, lng: -79.414676 };
pitstop.polyLineCoords = [
  pitstop.burgerPriestCoords,
  pitstop.finchStationCoords
];

// https://developers.google.com/maps/documentation/javascript/adding-a-google-map
function initMap() {
    pitstop.sampleMap = new google.maps.Map(document.getElementById("map"), {
      center: pitstop.hyCoords,
      zoom: 12
    });
    
    pitstop.burgerPriestMarker = new google.maps.Marker({
      position: pitstop.hyCoords,
      map: pitstop.sampleMap
    });

    pitstop.finchStationMarker = new google.maps.Marker({
      position: pitstop.finchStationCoords,
      map: pitstop.sampleMap
    });

    const flightPlanCoordinates = [
      { lat: 43.6484248, lng: -79.39792039999999 },
      { lat: 43.780371, lng: -79.414676 }
    ];

    const samplePoly = new google.maps.Polyline({
      path: pitstop.polyLineCoords,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

    samplePoly.setMap(pitstop.sampleMap);
}

// https://developers.google.com/maps/documentation/javascript/directions#DisplayingResults

// Document Ready Function
$(function () {
    pitstop.init();
}); 
