//get accessToken
fetch('accessTokenMapBox.txt')
  .then(response => response.text())
  .then((data) => {
    const accessTokenMapBox = data;

    // initialize the map on the "map" div with a given center and zoom
    const mymap = L.map('mapid', {zoomControl: false}).setView([48.37154, 10.89851], 13);

    //http://{s}.tile.osm.org/{z}/{x}/{y}{r}.png //https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: accessTokenMapBox
    }).addTo(mymap);

    
    // Add a layer control element to the map on desktop enviroment
    /*if (!L.Browser.mobile) {
      L.control.zoom({
        position:'bottomright'
      }).addTo(mymap);
    }*/

    //declare custom Icon
    const myIcon = L.icon({
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

    //add search function

    L.Control.geocoder({
        collapsed: false,
        placeholder: "Nach Orten suchen..."
    }).addTo(mymap);

    //add geolocate to map
    L.control.locate({
      position: 'topright',
      icon: 'icon-geolocate',
      iconElementTag: `span`
    }).addTo(mymap);

    //change icon
    let iconGeolocate = document.querySelector('.icon-geolocate');
    iconGeolocate.insertAdjacentHTML('afterbegin', `<svg class="icon-geolocate-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="4" d="M32 2v16m0 28v16M18 32H2m60 0H46" stroke-linejoin="round" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#202020" stroke-miterlimit="10" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
</svg>`);
    
    //set all entries as a marker on map
    locationDB.allDocsOfLocalDB.then(function(result) {
      for (const entry of result.rows) {
        if (entry.doc.lat !== undefined) {
          L.marker([entry.doc.lat, entry.doc.long], {icon: myIcon}).addTo(mymap);
        }
      }
    });
  });