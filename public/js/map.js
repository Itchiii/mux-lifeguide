//get accessToken
fetch('accessTokenMapBox.txt')
  .then(response => response.text())
  .then((data) => {
    const accessTokenMapBox = data;

    // initialize the map on the "map" div with a given center and zoom
    var mymap = L.map('mapid', {zoomControl: false}).setView([48.37154, 10.89851], 13);

    //http://{s}.tile.osm.org/{z}/{x}/{y}{r}.png //https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: accessTokenMapBox
    }).addTo(mymap);

    
    // Add a layer control element to the map on desktop enviroment
    if (!L.Browser.mobile) {
      L.control.zoom({
        position:'bottomright'
      }).addTo(mymap);
    }

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

    //add search function
    L.Control.geocoder().addTo(mymap);

    //set all entries as a marker on map
    locationDB.allDocsOfLocalDB.then(function(result) {
      for (const entry of result.rows) {
        if (entry.doc.lat !== undefined) {
          L.marker([entry.doc.lat, entry.doc.long], {icon: myIcon}).addTo(mymap);
        }
      }
    });
  });