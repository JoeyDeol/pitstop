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
        // console.log(res.results);
    });
};

pitstop.init = function () {
    pitstop.getLocation();
    // pitstop.displayMap();
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
