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
              let newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?id=${entry.doc._id}`;
              window.history.pushState({path:newurl},'',newurl);
            }
            //TODO: den zuück button anpassen

            setEntityContent(this.getAttribute("data-id"));
          })
        }
      }
    });
  });


window.onload = function () {
  let params = new URLSearchParams(document.location.search.substring(1));

  let id = params.get("id");
  if (id !== null) {
    setEntityContent(id);
  }

  let open = params.get("open");
  if (id !== null && open) {
    smallEntityWrapper.classList.add('show-complete');
    addTopButtons();
  }

  setFunctionForShareButton();
  setFunctionForLinkedEventMenuContent();
}

let startTopProperty;


/*
  set title, description, key data, images and linked events for clicked entity
*/
function setEntityContent(id) {
  locationDB._getDoc(id).then(function(data) {
    const heightOfNavigation = 56;
    const entityWrapper  = document.getElementById('location-entity-wrapper');
    
    //avoid content parse on same location
    if (entityWrapper.getAttribute('data-id') === id) {
      return;
    }
    entityWrapper.setAttribute('data-id', id);

    //open preview of entity
    if (!entityWrapper.classList.contains('show')) {
      entityWrapper.classList.add('show');
      //calculate appropriate top property from height of entity and navigation
      startTopProperty = (window.innerHeight - (entityWrapper.offsetHeight + heightOfNavigation)) / (window.innerHeight / 100);
      //set padding for sliding up function
      entityWrapper.style.paddingBottom = "100vh";
    }

    //set top property for preview
    if (!entityWrapper.classList.contains('show-complete')) {
      entityWrapper.style.setProperty('top', `${startTopProperty}vh`);
    }

    //get content elements
    const entityFullImages = document.getElementById('entity-full-images');
    const entityFullEvent = document.getElementById('entity-full-events');
    const entityFullSummary = document.getElementById('entity-full-summary');
    const entityFullDescription = document.getElementById('entity-full-description');

    //clear content
    entityFullImages.textContent = "";
    entityFullEvent.textContent = "";
    entityFullSummary.textContent = "";
    entityFullDescription.textContent = "";
    //clear all keydata
    for (const entry of document.getElementById('location-entity-keydata').children){
      entry.textContent = "";
    }
    
    //get const elements for keydata
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

    //set keydata
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

    //add all images as sliding container
    if (data._attachments !== undefined && Object.keys(data._attachments).length !== 0) {
      for (attachment in data._attachments) {
        locationDB._getAttachment(data._id, attachment).then(function(blob) {
          const img = document.createElement('img');
          img.src = URL.createObjectURL(blob);;
          entityFullImages.append(img);
        }).catch(function(e) {
          console.error(e)
        });
      }
    }

    //add all linked events for this entity
    if (data.linkedEvents.length !== 0) {
      for (const id of data.linkedEvents) {
        eventDB._getDoc(id).then(function(eventById) {
          //add wrapper
          const event = document.createElement('div');
          event.dataset.eventid = eventById._id;
          event.classList.add('eventColumn', 'map-entity-event');
          event.addEventListener('click', function (event) {
            if (!event.target.classList.contains("eventMenu")) {
              window.location.href = `article.html?id=${eventById._id}`
            }
          });

          const date = document.createElement('div');
          date.classList.add('eventDate');   

          const info = document.createElement('div');
          info.classList.add('eventInfo');

          const day = document.createElement('p');
          day.classList.add('daydate');
          day.textContent = eventById.daydate;

          const month = document.createElement('p');
          month.classList.add('month');
          month.textContent = eventById.month;

          const title = document.createElement('h4');
          title.textContent = eventById.title;

          const start = document.createElement('p');
          start.textContent = eventById.day + " " + eventById.start;

          const summary = document.createElement('p');
          summary.textContent = eventById.summary;

          const menu = document.createElement('div');
          menu.classList.add('eventMenu');
          //move and toggle display of menu content
          menu.addEventListener('click', function () {
            const offset = 80;
            const content = document.getElementById('event-menu-content');
            //set position
            content.style.top = this.getBoundingClientRect().top - document.getElementById('location-entity-content').getBoundingClientRect().top + offset + "px";

            if(content.dataset.eventid === this.closest('.eventColumn').dataset.eventid || content.classList.contains('hide')) {
              content.classList.toggle('hide');
            }

            if (!content.classList.contains('hide')) {
              content.dataset.eventid = eventById._id;
            }
          });
          
          date.append(day, month);
          info.append(title, start, summary);
          event.append(date, info, menu);
          entityFullEvent.append(event);
        });
      }
    }

    entityFullSummary.textContent = data.summary;
    entityFullDescription.textContent = data.description;

    //add body listener on click to hide the event menu
    document.body.addEventListener('click', function (event) {
      if (document.getElementById('event-menu-content') !== undefined && !document.getElementById('event-menu-content').classList.contains('hide') && !event.target.classList.contains('eventMenu')) {
        document.getElementById('event-menu-content').classList.add('hide');
      }
    });

  });
}


/* 
  code to animate the bottom layer after click on a location, that it can be draged to fullscreen  
*/
const holder = document.getElementById('location-entity-holder');
const smallEntityWrapper = document.getElementById('location-entity-wrapper');

//add various EventListener for touch and mouse interactions on holder and on bottom layer
holder.addEventListener("touchmove", touchMove);
holder.addEventListener("touchstart", touchDown);
holder.addEventListener("touchend", touchUp);
holder.addEventListener('click', holderOnClick);
smallEntityWrapper.addEventListener("touchmove", touchMove);
smallEntityWrapper.addEventListener("touchstart", touchDown);
smallEntityWrapper.addEventListener("touchend", touchUp);

//init variables to remember touchStart and global touch difference
let touchBeginOnHolder, touchDif;

//init variables to avoid toggle view after scroll on image container
let initScrollLeftOfImgContainer, firstMoveScrollLeftOfImgContainer, moveCount = 0;

/* 
  toggle the preview to fullscreen or vice versa  
*/
function holderOnClick(e) {
  //return after click on share button
  if (e !== undefined && e.target.id === 'location-entity-shareButton') {
    return;
  }

  //fullscreen -> preview
  if (smallEntityWrapper.classList.contains('show-complete')) {
    smallEntityWrapper.classList.remove('show-complete');
    smallEntityWrapper.style.setProperty('top', `${startTopProperty}vh`);
    removeTopButtons();
    removeParamOpen();
  }

  //preview -> fullscreen
  else {
    smallEntityWrapper.style.setProperty('top', `0`);    
    smallEntityWrapper.classList.add('show-complete');
    addParamOpen();
    addTopButtons();
  }
}

function touchDown(e) {
  touchDif = 0;
  initScrollLeftOfImgContainer = document.getElementById('entity-full-images').scrollLeft;

  //remove transition for top
  smallEntityWrapper.classList.remove('transition');
  
  //remember actual position
  touchBeginOnHolder = e.touches[0].pageY;
}

function touchMove(e) {
  //compare init scrollLeft property with first move. If they are unequal, then the image container was scrolled.
  if (moveCount === 0) {
    firstMoveScrollLeftOfImgContainer = document.getElementById('entity-full-images').scrollLeft;
    if (e.target.closest('#entity-full-images') !== null || e.target.id === "entity-full-images") {
      firstMoveScrollLeftOfImgContainer++;
    }
    moveCount++;
  } 
  if (initScrollLeftOfImgContainer !== firstMoveScrollLeftOfImgContainer) {
    return;
  }

  //calcutate the difference from start to actual position (after mouse move)
  touchDif = touchBeginOnHolder - e.touches[0].pageY;

  //return checks, if it scrolled on fullscreen but it can be scrolled for moving his content
  if (this === smallEntityWrapper &&  smallEntityWrapper.classList.contains('show-complete') && touchDif < 0 && smallEntityWrapper.scrollTop != 0) {
    return;
  }
  if (this === smallEntityWrapper &&  smallEntityWrapper.classList.contains('show-complete') && touchDif > 0 && smallEntityWrapper.scrollTop >= 0) {
    return;
  }

  //calculate top property on scroll
  const vh = touchDif / (window.innerHeight / 100);
  const vhDifUp = startTopProperty - vh;
  const vhDifDown = 0 + vh;
    
  /*
   * add moving difference as top
   * touchDif > 0 -> user scrolled layer to top; touchDiv < 0 -> user scrolled layer to bottom
   */
  if (touchDif > 0 && !smallEntityWrapper.classList.contains('show-complete')){
    //change heigt of a div after the container, that is looks like an expanding container 
   // emptyPlaceholderElement.style.setProperty('height', `${touchDif + 1}px`);
    smallEntityWrapper.style.setProperty('top', `${vhDifUp}vh`);
    //smallEntityWrapper.classList.add('on-translate');
  }
  //change top on bottom layer on scroll down -> just show a animation
  if (touchDif < 0 && !smallEntityWrapper.classList.contains('show-complete')) {
    smallEntityWrapper.style.setProperty('top', `${vhDifUp}vh`);
  }

  //change top from complete version to bottom 
  if (touchDif < 0 && smallEntityWrapper.classList.contains('show-complete')) {
    smallEntityWrapper.style.setProperty('top', `${vhDifDown * (-1)}vh`);
    //smallEntityWrapper.classList.add('on-translate');
  }  
}

function touchUp(e) {
  //add transition for top
  smallEntityWrapper.classList.add('transition');

  //reset
  moveCount = 0;

  //return i
  if (initScrollLeftOfImgContainer !== firstMoveScrollLeftOfImgContainer) {
    return;
  }

  //return checks, if it scrolled on fullscreen but it can be scrolled for moving his content
  if (this === smallEntityWrapper &&  smallEntityWrapper.classList.contains('show-complete') && touchDif <= 0 && smallEntityWrapper.scrollTop != 0) {
    return;
  }
  if (this === smallEntityWrapper &&  smallEntityWrapper.classList.contains('show-complete') && touchDif >= 0 && smallEntityWrapper.scrollTop >= 0) {
    return;
  }

  //100px as min touch difference
  const minDifference = 100;
  
  if (touchDif > minDifference) {
    smallEntityWrapper.style.removeProperty('top');
    smallEntityWrapper.classList.add('show-complete');
    addTopButtons();
    addParamOpen();
  }
  else if (touchDif < (minDifference * (-1))) {
    let params = new URLSearchParams(document.location.search.substring(1));
  
    //set initial top property from URL (important after comming from click this URL as a link)
    if (params.get("startTopProperty")) {
      startTopProperty = params.get('startTopProperty');
    }

    smallEntityWrapper.style.setProperty('top', `${startTopProperty}vh`);
    smallEntityWrapper.classList.remove('show-complete');
    removeTopButtons();
    removeParamOpen();
  }
  //after click on holder in fullscreen
  else if (smallEntityWrapper.classList.contains('show-complete')) {
    smallEntityWrapper.style.removeProperty('top');
    
  }
  //after click on holder in preview
  else if (!smallEntityWrapper.classList.contains('show-complete')) {
    smallEntityWrapper.style.setProperty('top', `${startTopProperty}vh`);
  }
}

function addTopButtons() {
  document.getElementById('location-entity-shareButton').classList.remove('hide');
  document.getElementById('location-entity-markButton').classList.remove('hide');
  document.getElementById('location-entity-full-text').classList.remove('hide');
  document.getElementById('location-entity-createRoute').classList.add('hide');
  document.getElementById('location-entity-open-text').classList.remove('hide');
  document.getElementById('location-entity-open-text').classList.remove('hide');
  document.getElementById('location-entity-text').classList.add('hide');
}

function removeTopButtons() {
  document.getElementById('location-entity-shareButton').classList.add('hide');
  document.getElementById('location-entity-full-text').classList.add('hide');
  document.getElementById('location-entity-markButton').classList.add('hide');
  document.getElementById('location-entity-createRoute').classList.remove('hide');
  document.getElementById('location-entity-text').classList.remove('hide');
  document.getElementById('location-entity-open-text').classList.add('hide');
}

function removeParamOpen() {
  let params = new URLSearchParams(document.location.search.substring(1));

  if (params.get("open") !== null && history.pushState && params.get("startTopProperty") !== null) {
    params.delete('open');
    params.delete('startTopProperty');

    let newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?id=${params.get("id")}`;
    window.history.pushState({path:newurl},'',newurl);
  }
}

function addParamOpen() {
  if (history.pushState) {
    let newurl = `${window.location.href}&open=true&startTopProperty=${startTopProperty}`;
    window.history.pushState({path:newurl},'',newurl);
  }
}

function setFunctionForShareButton() {
  //https://css-tricks.com/how-to-use-the-web-share-api/
  document.getElementById('location-entity-shareButton').addEventListener('click', () => {
    const title = document.title;
    const url = document.querySelector('link[rel=canonical]') ? document.querySelector('link[rel=canonical]').href : document.location.href;
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).then(() => {
      })
      .catch(console.error);
    } else {
      //fallback
      console.log(url);
    }
  });
}

function setFunctionForLinkedEventMenuContent() {

  //functionality for share button
  document.getElementById('entity-event-share').addEventListener('click', () => {
    const title = document.title;
    const url = 'wichtigeURL'
    console.log(url);
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).then(() => {
      })
      .catch(console.error);
    } else {
      // fallback
    }
  });

  //functionality for export button


  //functionality for bookmark button
  document.getElementById('entity-event-bookmark').addEventListener('click', () => {
    const eventID = document.getElementById('event-menu-content').dataset.eventid;
    eventDB._getDoc(eventID).then(function(data) {
      let putItemBookmarksDB = new Promise(function(resolve, reject){
        bookmarksDB._putItem(data, resolve, reject);
      });
      putItemBookmarksDB.then(() => {
        bookmarksDB.infoLocal.then(function(info) {
          console.log(info);
        });
      });
    });
  });
}




















