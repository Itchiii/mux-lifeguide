// Registering Service Worker after the page loaded and removed old one
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    
    //remove all old service Worker
    //TODO: this ist just for development
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister().then(function(boolean) {
          if (boolean) console.log('Unregistration succeeded');
        });
    }
    
    }).then(function(){
      navigator.serviceWorker.register('/service-worker.js', {scope: './'}).then(function(registration) {
        // registration worked
        console.log('Registration succeeded.');
      }).catch(function(error) {
        // registration failed
        console.log('Registration failed with ' + error);
      });
    }).catch(function(err) {
        console.log('Service Worker unregistration failed: ', err);
    });
  }); 
}

//get accessToken
fetch('accessTokenMapBox.txt')
  .then(response => response.text())
  .then((data) => {
    const accessTokenMapBox = data;

    // initialize the map on the "map" div with a given center and zoom
    var mymap = L.map('mapid').setView([48.37154, 10.89851], 13);

    //http://{s}.tile.osm.org/{z}/{x}/{y}{r}.png //https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: accessTokenMapBox
    }).addTo(mymap);


    //declare custom Icon
    var myIcon = L.icon({
      iconUrl: '/public/assets/icons/icon-64.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    //set custom marker
    var marker = L.marker([48.36592, 10.88924], {icon: myIcon}).addTo(mymap);
    //set Popup to our marker
    marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

    //create Routing with waypoints and geocoder api
    L.Routing.control({
      router: L.Routing.mapbox(accessTokenMapBox),
      waypoints: [
        L.latLng(48.36592, 10.88924),
        L.latLng(48.36801, 10.89311)
      ],
      routeWhileDragging: false,
      autoRoute: true,
      geocoder: L.Control.Geocoder.nominatim()
    }).addTo(mymap);
  })



