const pitstop = {};

pitstop.textUrl =
  "https://maps.googleapis.com/maps/api/place/textsearch/json";
pitstop.getLocation = function (){
    $.ajax({
        url: 'https://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: pitstop.textURL,
            params: {
                key: 'AIzaSyCYkPjAGfsJm2ow3qnk7HzHX0Q62oVdYiI',
                query : "Hackeryou"
            }
        }
    }).then((res) => {
        console.log(res.results);
    });
};

pitstop.init = function () {
    pitstop.getLocation();
    // pitstop.displayMap();
    initMap();
    pitstop.polyLine.setMap(map);
};

// DISPLAY GOOGLE MAP CENTERED AT HACKERYOU
pitstop.hyCoords = { lat: 43.6484248, lng: -79.39792039999999 };
pitstop.burgerPriestCoords = { lat: 43.6483623, lng: -79.39727259999999 };
pitstop.finchStationCoords = { lat: 43.780371, lng: -79.414676 };

// https://developers.google.com/maps/documentation/javascript/adding-a-google-map
function initMap() {
    pitstop.sampleMap = new google.maps.Map(document.getElementById("map"), {
      center: pitstop.hyCoords,
      zoom: 12
    });
    
    pitstop.burgerPriestMarker = new google.maps.Marker({
      position: pitstop.burgerPriestCoords,
      map: pitstop.sampleMap
    });

    pitstop.finchStationMarker = new google.maps.Marker({
      position: pitstop.finchStationCoords,
      map: pitstop.sampleMap
    });

    pitstop.polyLine = new google.maps.Polyline({
      path: pitstop.polyLineCoords,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2
    });

  var flightPlanCoordinates = [
    {lat: 37.772, lng: -122.214},
    {lat: 21.291, lng: -157.821},
    {lat: -18.142, lng: 178.431},
    {lat: -27.467, lng: 153.027}
  ];
  var flightPath = new google.maps.Polyline({
    path: flightPlanCoordinates,
    geodesic: true,
    strokeColor: '#FF0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  });

  flightPath.setMap(map);
}

// draw polyline from finch station to burger priest
// https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
// pitstop.polyLineCoords = [ pitstop.burgerPriestCoords, pitstop.finchStationCoords ];

// pitstop.polyLine = new google.maps.Polyline({
//   path: pitstop.polyLineCoords,
//   geodesic: true,
//   strokeColor: "#FF0000",
//   strokeOpacity: 1.0,
//   strokeWeight: 2
// });

// This example creates a 2-pixel-wide red polyline showing the path of
// the first trans-Pacific flight between Oakland, CA, and Brisbane,
// Australia which was made by Charles Kingsford Smith.

// function initMap() {
//   var map = new google.maps.Map(document.getElementById('map'), {
//     zoom: 3,
//     center: {lat: 0, lng: -180},
//     mapTypeId: 'terrain'
//   });

//   var flightPlanCoordinates = [
//     {lat: 37.772, lng: -122.214},
//     {lat: 21.291, lng: -157.821},
//     {lat: -18.142, lng: 178.431},
//     {lat: -27.467, lng: 153.027}
//   ];
//   var flightPath = new google.maps.Polyline({
//     path: flightPlanCoordinates,
//     geodesic: true,
//     strokeColor: '#FF0000',
//     strokeOpacity: 1.0,
//     strokeWeight: 2
//   });

//   flightPath.setMap(map);
// }


// https://developers.google.com/maps/documentation/javascript/directions#DisplayingResults

// Document Ready Function
$(function () {
    pitstop.init();
}); 
