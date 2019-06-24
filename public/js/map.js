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
      iconUrl: '/public/assets/images/icon-72x72.png',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    //set custom marker
    var marker = L.marker([48.36592, 10.88924], {icon: myIcon}).addTo(mymap);
    //set Popup to our marker
    //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();

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
        placeholder: "Orte durchsuchen"
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
          let newLocation = L.marker([entry.doc.lat, entry.doc.long], {icon: myIcon}).addTo(mymap);

          const i = newLocation._icon;
          //set id to data attribute
          i.setAttribute("data-id", entry.doc._id);

          //add eventListener to create a new bottom layer
          i.addEventListener('click', function(){

            if (history.pushState) {
              var newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?id=${entry.doc._id}`;
              window.history.pushState({path:newurl},'',newurl);
            }
            //TODO: den zuück button anpassen

            const id = this.getAttribute("data-id");
            setItemContent(id);
          })
        }
      }
    });
  });


window.onload = function () {
  let params = new URLSearchParams(document.location.search.substring(1));
  let id = params.get("id");
  if (id !== null) {
    setItemContent(id);
  }
}

var startTopProperty = 0;
function setItemContent(id) {
  locationDB._getDoc(id).then(function(data) {

    const itemWrapper  = document.getElementById('location-item-wrapper');
    
    if (itemWrapper.getAttribute('data-id') === id) {
      return;
    }

    if (!itemWrapper.classList.contains('show')) {
      console.log("test");
      itemWrapper.classList.add('show');
      //set top property, 56 vom bottom nav
      const topInPx = window.innerHeight - (itemWrapper.offsetHeight + 56);
      const topInVh = topInPx / (window.innerHeight / 100);
      startTopProperty = topInVh;
      itemWrapper.style.setProperty('top', `${startTopProperty}vh`);
    }
    else {
      itemWrapper.classList.add('show');
      itemWrapper.style.setProperty('top', `${startTopProperty}vh`);
    }
    itemWrapper.setAttribute('data-id', id);
    



    //hide all items for full text content
    for (const entry of document.getElementById('location-item-full-text').children){
      entry.classList.add('hide');
      entry.textContent = "";
    }

    //set const wrappers
    const entityCollapsedHeading = document.getElementById('entity-collapsed-heading');
    const entityCollapsedAddress = document.getElementById('entity-collapsed-address');
    const entityCollapsedZipCode = document.getElementById('entity-collapsed-zipCode');
    const entityOpenHeading = document.getElementById('entity-open-heading');
    const entityOpenDescription = document.getElementById('entity-open-description');
    const entityFullAddress = document.getElementById('entity-full-address');
    const entityFullOpeningHours = document.getElementById('entity-full-openingHours');
    const entityFullPhone = document.getElementById('entity-full-phone');
    const entityFullWeb = document.getElementById('entity-full-web');
    const entityFullOwner = document.getElementById('entity-full-owner');
    for (const entry in data) {
      switch (entry) {
        case 'title':
          entityCollapsedHeading.textContent = data[entry];
          entityCollapsedHeading.classList.remove('hide');
          entityOpenHeading.textContent = data[entry];
          entityOpenHeading.classList.remove('hide');
          break;
        case 'address':
          entityCollapsedAddress.textContent = data[entry];
          entityCollapsedAddress.classList.remove('hide');
          entityFullAddress.textContent = `${data.address}, ${data.zipCode}`;
          entityFullAddress.classList.remove('hide');
          break;
        case 'zipCode':
          entityCollapsedZipCode.textContent = data[entry];
          entityCollapsedZipCode.classList.remove('hide');
          break;
        case 'summary':
          entityOpenDescription.textContent = data[entry];
          entityOpenDescription.classList.remove('hide');
          break;
        case 'openingHours':
          entityFullOpeningHours.insertAdjacentHTML('afterbegin', data[entry]);
          entityFullOpeningHours.classList.remove('hide');
          break;
        case 'phone':
          entityFullPhone.textContent = data[entry];
          entityFullPhone.classList.remove('hide');
          break;
        case 'web':
          entityFullWeb.textContent = data[entry];
          entityFullWeb.classList.remove('hide');
          break;
        case 'owner':
          entityFullOwner.textContent = data[entry];
          entityFullOwner.classList.remove('hide');
          break;
        default:
          break;
      }
    }

    //add images
    console.log(data);


  });
}

/* Code for animate the bottom layer after click on a location, that it can be draged to fullscreen  */
const holder = document.getElementById('location-item-holder');
const locationBottomLayer = document.getElementById('location-item-wrapper');
const emptyPlaceholderElement = document.getElementById('location-item-heightPlaceholder');

//add various EventListener for touch and mouse interactions on holder and on bottom layer
holder.addEventListener("touchmove", holderOnMove);
holder.addEventListener("mousedown", holderOnDown);
holder.addEventListener("mouseup", holderOnUp);
holder.addEventListener("touchstart", holderOnDown);
holder.addEventListener("touchend", holderOnUp);
holder.addEventListener('click', holderOnClick);
locationBottomLayer.addEventListener("touchmove", holderOnMove);
locationBottomLayer.addEventListener("mousedown", holderOnDown);
locationBottomLayer.addEventListener("mouseup", holderOnUp);
locationBottomLayer.addEventListener("touchstart", holderOnDown);
locationBottomLayer.addEventListener("touchend", holderOnUp);

var touchBeginOnHolder = 0;
var touchDif = 0;

//toggle the bottom layer to fullscreen
function holderOnClick() {
  if (locationBottomLayer.classList.contains('show-complete')) {
    locationBottomLayer.classList.remove('show-complete');
    locationBottomLayer.style.setProperty('top', `${startTopProperty}vh`);
    removeMoreButtons();
  }
  else {
    locationBottomLayer.style.setProperty('top', `${0}vh`);    
    locationBottomLayer.classList.add('show-complete');
    addMoreButtons();

  }
}

//save start position
function holderOnDown(e) {
  //remove transition for top
  locationBottomLayer.classList.remove('transition');
  
  
  //remember actual position
  if (e.type === 'mousedown') {
    touchBeginOnHolder = e.pageY;
    //add eventlistener after mousedown
    holder.addEventListener("mousemove", holderOnMove);
  }
  else {
    touchBeginOnHolder = e.touches[0].pageY;
  }
}


function holderOnMove(e) {
  //calcutate the difference from start to actual position (after mouse move)
  if (e.type === 'mousemove') {
    touchDif = touchBeginOnHolder - e.pageY;
  }
  else {
    touchDif = touchBeginOnHolder - e.touches[0].pageY;
  }

  //return checks, if it scrolled on 'great' Layer but it can be scrolled for moving his content
  if (this === locationBottomLayer &&  locationBottomLayer.classList.contains('show-complete') && touchDif < 0 && locationBottomLayer.scrollTop != 0) {
    return;
  }
  if (this === locationBottomLayer &&  locationBottomLayer.classList.contains('show-complete') && touchDif > 0 && locationBottomLayer.scrollTop >= 0) {
    return;
  }


  const vhInPx = window.innerHeight / 100;
  const vh = touchDif / vhInPx;
  const vhDifUp = startTopProperty - vh;
  const vhDifDown = 0 + vh;
    
  /*
   * add moving difference as top
   * touchDif > 0 -> user scrolled layer to top; touchDiv < 0 -> user scrolled layer to bottom
   */
  if (touchDif > 0 && !locationBottomLayer.classList.contains('show-complete')){
    //change heigt of a div after the container, that is looks like an expanding container 
    emptyPlaceholderElement.style.setProperty('height', `${touchDif + 1}px`);
    locationBottomLayer.style.setProperty('top', `${vhDifUp}vh`);
    //locationBottomLayer.classList.add('on-translate');
  }
  //change top on bottom layer on scroll down -> just show a animation
  if (touchDif < 0 && !locationBottomLayer.classList.contains('show-complete')) {
    locationBottomLayer.style.setProperty('top', `${vhDifUp}vh`);
  }

  //change top from complete version to bottom 
  if (touchDif < 0 && locationBottomLayer.classList.contains('show-complete')) {
    locationBottomLayer.style.setProperty('top', `${vhDifDown * (-1)}vh`);
    //locationBottomLayer.classList.add('on-translate');
  }  
}

function holderOnUp(e) {
  locationBottomLayer.classList.add('transition');

  if (this === locationBottomLayer &&  locationBottomLayer.classList.contains('show-complete') && touchDif < 0 && locationBottomLayer.scrollTop != 0) {
    return;
  }

  if (this === locationBottomLayer &&  locationBottomLayer.classList.contains('show-complete') && touchDif > 0 && locationBottomLayer.scrollTop >= 0) {
    return;
  }

  if (e.type === 'mouseup') {
    holder.removeEventListener("mousemove", holderOnMove);
  }
  //remove added properties
  //locationBottomLayer.style.removeProperty('height');
  emptyPlaceholderElement.style.removeProperty('height');
  //locationBottomLayer.classList.remove('on-translate');

  //100px as min touch difference
  if (touchDif > 100) {
  locationBottomLayer.style.removeProperty('top');

    locationBottomLayer.classList.add('show-complete');

    addMoreButtons();
  }
  else if (touchDif < -100 ) {
    locationBottomLayer.style.setProperty('top', `${startTopProperty}vh`);
    locationBottomLayer.classList.remove('show-complete');
    removeMoreButtons();
  }
  else if (locationBottomLayer.classList.contains('show-complete')) {
  locationBottomLayer.style.removeProperty('top');
    
  }
  else if (!locationBottomLayer.classList.contains('show-complete')) {
    locationBottomLayer.style.setProperty('top', `${startTopProperty}vh`);
  }
}

function addMoreButtons() {
  document.getElementById('location-item-shareButton').classList.remove('hide');
  document.getElementById('location-item-markButton').classList.remove('hide');
  document.getElementById('location-item-full-text').classList.remove('hide');
  document.getElementById('location-item-createRoute').classList.add('hide');
  document.getElementById('location-item-open-text').classList.remove('hide');
  document.getElementById('location-item-open-text').classList.remove('hide');
  document.getElementById('location-item-text').classList.add('hide');
}

function removeMoreButtons() {
  document.getElementById('location-item-shareButton').classList.add('hide');
  document.getElementById('location-item-full-text').classList.add('hide');
  document.getElementById('location-item-markButton').classList.add('hide');
  document.getElementById('location-item-createRoute').classList.remove('hide');
  document.getElementById('location-item-text').classList.remove('hide');
  document.getElementById('location-item-open-text').classList.add('hide');
}