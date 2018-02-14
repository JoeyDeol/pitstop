const pitstopApp = {};


pitstopApp.getLocation = function (){
    $.ajax({
        url: 'https://proxy.hackeryou.com',
        method: 'GET',
        dataType: 'json',
        data: {
            reqUrl: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
            params: {
                key: 'AIzaSyCYkPjAGfsJm2ow3qnk7HzHX0Q62oVdYiI',
                location: '43.648828 , -79.396477',
                radius: 500,
            }
        }
    }).then((res) => {
        console.log(res.results);
    });
};

pitstopApp.init = function () {
    pitstopApp.getLocation();
};

// Document Ready Function
$(function () {
    pitstopApp.init();
}); 
