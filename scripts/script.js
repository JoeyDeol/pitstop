const pitstop = {};


pitstop.getUserLocation = function (){
    // First ajax request will be pulling down information from google places through a text search that the user inputs.
    $.ajax({
        url: 'https://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: 'https://maps.googleapis.com/maps/api/place/textsearch/json',
            params: {
                key: 'AIzaSyCYkPjAGfsJm2ow3qnk7HzHX0Q62oVdYiI',
                query: 'Burger Priest on Queen street Toronto',
            }
        }
    }).then((res) => {
        const placeId = res.results[0].place_id;
        const lat = res.results[0].geometry.location.lat;
        const long = res.results[0].geometry.location.lng;
        console.log('The following is: PlaceID, Lat and Long')
        console.log(placeId);
        console.log(lat);
        console.log(long);
        const geolocation = []
        geolocation.push(lat,long);
        pitstop.locationNearby(geolocation);
        pitstop.getLocationDetails(placeId);
    });
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
                radius: 500,
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
    pitstop.getUserLocation();
};

// Document Ready Function
$(function () {
    pitstop.init();
}); 
