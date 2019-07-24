//get accessToken
fetch('accessTokenMapBox.txt')
  .then(response => response.text())
  .then((data) => {
    const accessTokenMapBox = data;

    // initialize the map on the "map" div with a given center and zoom
    mapboxgl.accessToken = accessTokenMapBox;
    var map = new mapboxgl.Map({
      container: 'mapid',
      style: 'mapbox://styles/student123456/cjyg2vfgp02sy1cr6dp37yer7',
      center: [10.89851, 48.37154], // starting position [lng, lat]
      zoom: 12 // starting zoom
    });

    //add geolocate control to the map.
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      });
    document.getElementById('topSearch').append(geolocate.onAdd(map));
    
    //set all entries as a marker on map
    locationDB.allDocsOfLocalDB.then(function(result) {
      for (const entry of result.rows) {
        if (entry.doc.lat !== undefined) {
          //TODO: switch case mit Klassenname

          var el = document.createElement('div');
          el.className = 'marker';
          //set id to data attribute
          el.setAttribute("data-id", entry.doc._id);
          
          var marker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
          }).setLngLat([entry.doc.long, entry.doc.lat]).addTo(map);
          
          //add eventListener to create a new bottom layer
          el.addEventListener('click', function(){
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

    //add listener to remove entity on bottom
    document.getElementById('mapid').addEventListener('click', function(event) {
      if (!event.target.classList.contains('marker')) {
        const entityWrapper = document.getElementById('location-entity-wrapper')
        entityWrapper.classList.remove('show');
        entityWrapper.style.removeProperty('top');
        entityWrapper.style.removeProperty('padding-bottom');
        entityWrapper.removeAttribute("data-id");
        removeContentToEntity();
        removeParam("open");
        removeParam("id");
        document.getElementById('location-entity-createRoute').classList.add('hide');
      }

      document.getElementById('menu').classList.remove('open');
      document.getElementById('panel').classList.remove('panel');      
    });


    /* 
     * Routing functionality 
     */

    //add geocoder to routing field
    const startInput = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      enableEventLogging: false,
      flyTo: false,
      bbox: [10.68626, 48.27465, 11.10512, 48.48126],
      placeholder: "Startpunkt",
      marker: false
    });
    document.getElementById('create-routing-inputs').prepend(startInput.onAdd(map));

    //click on "create routing"
    document.getElementById('location-entity-createRoute').addEventListener('click', function() {
      const routeWrapper = document.getElementById('location-routing')
      routeWrapper.removeEventListener('transitionend', hideRoutingAfterTransition);
      routeWrapper.classList.remove('hide');
      if (!routeWrapper.classList.contains('hide')) {
        routeWrapper.classList.remove('transitionOut');

      }

      //fullscreen -> preview of entity
      if (document.getElementById('location-entity-wrapper').classList.contains('show-complete')) {
        changeToPreview();
      }

      const destination = document.getElementById('c-r-to');
      const startpoint = document.querySelector('.mapboxgl-ctrl-geocoder > input');
      startpoint.value = "";

      //get id param from url
      let params = new URLSearchParams(document.location.search.substring(1));
      const id = params.get("id");

      //get entry with param id
      locationDB._getDoc(id).then(function(data) {
        //create Routing with waypoints and geocoder api
        destination.value = data.title;
        end = [data.long, data.lat];
      });

      //on result of startpoint setRoute
      startInput.on('result', function(data) {
        start = [data.result.center[0], data.result.center[1]];
        setRoute(start, end);
      });
    });

    // click on back button on routing form
    document.getElementById('create-routing-back').addEventListener('click', function(){
      const routeWrapper = document.getElementById('location-routing');
      routeWrapper.classList.add('transitionOut');
      routeWrapper.addEventListener('transitionend', hideRoutingAfterTransition);
    });

    function hideRoutingAfterTransition() {
      document.getElementById('location-routing').classList.add('hide');
    }

    // create a function to make a directions request
    function setRoute(start, end) {
      // make a directions request using cycling profile
      var url = 'https://api.mapbox.com/directions/v5/mapbox/cycling/' + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?geometries=geojson&access_token=' + mapboxgl.accessToken;
      
      // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
      var req = new XMLHttpRequest();
      req.responseType = 'json';
      req.open('GET', url, true);
      req.onload = function() {
        var data = req.response.routes[0];
        var route = data.geometry.coordinates;
        var geojson = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: route
          }
        };
        
        // if the route already exists on the map, reset it using setData
        if (map.getSource('route')) {
          map.getSource('route').setData(geojson);
        } else { // otherwise, make a new request
          map.addLayer({
            id: 'route',
            type: 'line',
            source: {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: geojson.geometry.coordinates
                }
              }
            },
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#fff',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });
        }
      };
      req.send();
    }
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
    addContentToEntity();
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

    //show create route button
    document.getElementById('location-entity-createRoute').classList.remove('hide');

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
    changeToPreview();
  }

  //preview -> fullscreen
  else {
    changeToFullscreen();
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
    changeToFullscreen();
  }
  else if (touchDif < (minDifference * (-1))) {
    changeToPreview();
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

function addContentToEntity() {
  document.getElementById('location-entity-shareButton').classList.remove('hide');
  document.getElementById('location-entity-markButton').classList.remove('hide');
  document.getElementById('location-entity-full-text').classList.remove('hide');
  document.getElementById('location-entity-open-text').classList.remove('hide');
  document.getElementById('location-entity-open-text').classList.remove('hide');
  document.getElementById('location-entity-text').classList.add('hide');
}

function removeContentToEntity() {
  document.getElementById('location-entity-shareButton').classList.add('hide');
  document.getElementById('location-entity-full-text').classList.add('hide');
  document.getElementById('location-entity-markButton').classList.add('hide');
  document.getElementById('location-entity-createRoute').classList.remove('hide');
  document.getElementById('location-entity-text').classList.remove('hide');
  document.getElementById('location-entity-open-text').classList.add('hide');
}

function changeToFullscreen() {
  smallEntityWrapper.style.removeProperty('top');
  smallEntityWrapper.classList.add('show-complete');
  addContentToEntity();
  addParamOpen();
}

function changeToPreview() {
  let params = new URLSearchParams(document.location.search.substring(1));
  
  //set initial top property from URL (important after comming from click this URL as a link)
  if (params.get("startTopProperty")) {
    startTopProperty = params.get('startTopProperty');
  }

  smallEntityWrapper.style.setProperty('top', `${startTopProperty}vh`);
  smallEntityWrapper.classList.remove('show-complete');
  removeContentToEntity();
  removeParam("open");
}

function removeParam(param) {
  let params = new URLSearchParams(document.location.search.substring(1));

  if (params.get(param) !== null && history.pushState) {
    params.delete(param);

    if (params.get("startTopProperty") !== null) {
      params.delete('startTopProperty');
    }

    let newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${params.toString()}`;
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
  var cal = ics();
	cal.addEvent('Demo Event', 'This is an all day event', 'Nome, AK', '8/7/2013', '8/7/2013');
  cal.addEvent('Demo Event', 'This is thirty minute event', 'Nome, AK', '8/7/2013 5:30 pm', '8/7/2013 6:00 pm');
  
  // You can use this for easy debugging
  makelogs = function(obj) {
    console.log('Events Array');
    console.log('=================');
    console.log(obj.events());
    console.log('Calendar With Header');
    console.log('=================');
    console.log(obj.calendar());
  }

  makelogs(cal);

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




















