//get accessToken
fetch('accessTokenMapBox.txt')
  .then(response => response.text())
  .then((data) => {
    const accessTokenMapBox = data;

    // initialize the map on the "map" div with a given center and zoom
    mapboxgl.accessToken = accessTokenMapBox;
    var map = new mapboxgl.Map({
      container: 'mapid',
      style: 'mapbox://styles/student123456/cjyg2mizy00731cpb3g66n986',
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
    document.getElementById('search').append(geolocate.onAdd(map));
    
    //set all entries as a marker on map
    locationDB.allDocsOfLocalDB.then(function(result) {
      for (const entry of result.rows) {
        if (entry.doc.lat !== undefined) {
          //TODO: switch case mit Klassenname

          var el = document.createElement('div');
          el.classList.add('marker', entry.doc.category);
          //set id to data attribute
          el.setAttribute("data-id", entry.doc._id);
          
          var marker = new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
          }).setLngLat([entry.doc.long, entry.doc.lat]).addTo(map);
          
          //add eventListener to create a new bottom layer
          el.addEventListener('click', function(){
            if(document.getElementById('filter-add').classList.contains('open')) {
              document.getElementById('filter-add').click();
            }
            if (!this.classList.contains('openPreview')) {
              removeStyleOfMarker();
            }
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

    //add listener to remove entity on bottom, remove sidebar and search results
    document.getElementById('mapid').addEventListener('click', function(event) {
      if (!event.target.classList.contains('marker')) {
        removePreview();
      }

      //document.getElementById('menu').classList.remove('open');
     //document.getElementById('panel').classList.remove('open');  
      
      document.getElementById('search-results').classList.add('hide');
    });


    /* 
     * Search functionality 
     */
    document.getElementById('searchLocations').addEventListener('keyup', searchLocation);

    function searchLocation() {
      const searchResults = document.getElementById('search-results');
      searchResults.textContent = ""
      searchResults.classList.remove('hide');
      
      locationDB.allDocsOfLocalDB.then(function(result) {
        for (const entry of result.rows) {
          if (entry.doc.title !== undefined) {
            const title = entry.doc.title.toUpperCase();
            const summary = entry.doc.summary.toUpperCase();
            if (title.includes(this.value.toUpperCase()) || summary.includes(this.value.toUpperCase())) {
              const li = document.createElement('li');
              li.textContent = entry.doc.title;
              li.addEventListener('click', () => {
                removeStyleOfMarker();
                if (history.pushState) {
                  let newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?id=${entry.doc._id}`;
                  window.history.pushState({path:newurl},'',newurl);
                }
                document.getElementById('searchLocations').value = entry.doc.title;
                map.flyTo({center: [entry.doc.long, entry.doc.lat], zoom: 16});
                setEntityContent(entry.doc._id);
                document.querySelector(`.marker[data-id=${entry.doc._id}`).classList.add('openPreview');
                searchResults.classList.add('hide');
              });
              searchResults.append(li);
            }
          }
        }
      }.bind(this));
    }


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


    //add geolocate control to search field.
    const geolocateForRoute = new mapboxgl.GeolocateControl({
      positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: false,
        showUserLocation: false
      });

    let endMarkerEle = document.createElement('div');
    endMarkerEle.classList.add('end-marker', 'hide');
    
    let endMarker = new mapboxgl.Marker({
      element: endMarkerEle,
      anchor: 'center'
    }).setLngLat([0, 0]).addTo(map);

    document.getElementById('create-routing-inputs').prepend(geolocateForRoute.onAdd(map));
    geolocateForRoute.on('geolocate', function(data) {
      const input = document.querySelector('.create-routing-inputs .mapboxgl-ctrl-geocoder input');
      input.value = "Mein Standort";

      console.log(data);


      //get id param from url
      let params = new URLSearchParams(document.location.search.substring(1));
      const id = params.get("id");

      //get entry with param id
      locationDB._getDoc(id).then(function(entry) {
        //create Routing with waypoints and geocoder api
        let end = [entry.long, entry.lat];


        let start = [data.coords.longitude, data.coords.latitude];
        console.log(start, end);

        setRoute(start, end);
      });


    });

    //click on "create routing"
    document.getElementById('location-entity-createRoute').addEventListener('click', function() {
      const routeWrapper = document.getElementById('location-routing')
      routeWrapper.removeEventListener('transitionend', hideRoutingAfterTransition);
      routeWrapper.classList.remove('hide');
      routeWrapper.classList.remove('transitionOut');

      //fullscreen -> preview of entity
      if (document.getElementById('location-entity-wrapper').classList.contains('show-complete')) {
        changeToPreview();
      }

      const destination = document.getElementById('c-r-to');
      const startpoint = document.querySelector('.mapboxgl-ctrl-geocoder > input');
      startpoint.value = "";
      startpoint.focus();

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
        const start = [data.result.center[0], data.result.center[1]];
        setRoute(start, end);
      });
    });

    // click on back button on routing form
    document.getElementById('create-routing-back').addEventListener('click', function(){
      endMarkerEle.classList.add('hide');
      if (map.getSource('route')) {
        map.removeLayer('route');
      }
      
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
          endMarker.setLngLat([start[0], start[1]]);
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
              'line-color': '#7ECE96',
              'line-width': 5,
              'line-opacity': 0.75
              //'line-dasharray': [1, 2]
            }
          });

          endMarkerEle.classList.remove('hide');
          endMarker.setLngLat([start[0], start[1]]);

          map.flyTo({center: [start[0], start[1]], zoom: 15});

        }
      };
      req.send();
    }

    map.on('load', () => {
      let params = new URLSearchParams(document.location.search.substring(1));

      let id = params.get("id");
      if (id !== null) {
        locationDB._getDoc(id).then(function(data) {
          map.flyTo({center: [data.long, data.lat], zoom: 16});
        });
        document.querySelector(`.marker[data-id=${id}`).classList.add('openPreview');
      }
    })
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

  setFunctionForLinkedEventMenuContent();
  setFunctionForLocationActions();
  setFuntionForFilter();
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

    changeHeart();

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
      console.log(data[entry] === "");

      if (data[entry] !== "") {
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
      else {
        switch (entry) {
          case 'title':
            entityCollapsedHeading.textContent = "";
            entityCollapsedHeading.classList.add('hide');
            entityOpenHeading.textContent = "";
            entityOpenHeading.classList.add('hide');
            break;
          case 'address':
            entityCollapsedAddress.textContent = "";
            entityCollapsedAddress.classList.add('hide');
            entityFullAddress.textContent = "";
            entityFullAddress.classList.add('hide');
            break;
          case 'zipCode':
            entityCollapsedZipCode.textContent = "";
            entityCollapsedZipCode.classList.add('hide');
            break;
          case 'summary':
            entityOpenDescription.textContent = "";
            entityOpenDescription.classList.add('hide');
            break;
          case 'openingHours':
            entityFullOpeningHours.insertAdjacentHTML('afterbegin', "");
            entityFullOpeningHours.classList.add('hide');
            break;
          case 'phone':
            entityFullPhone.textContent = "";
            entityFullPhone.classList.add('hide');
            break;
          case 'web':
            entityFullWeb.textContent = "";
            entityFullWeb.classList.add('hide');
            break;
          case 'owner':
            entityFullOwner.textContent = "";
            entityFullOwner.classList.add('hide');
            break;
          default:
            break;
        }
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

            const eventID = content.dataset.eventid;
            bookmarksDB._getDoc(eventID).then(function(data) {
              document.getElementById('entity-event-bookmark').classList.add('marked');
            }).catch(function(){
              document.getElementById('entity-event-bookmark').classList.remove('marked');
            });
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

    if (document.querySelector(`.marker[data-id=${id}`) !== null) {
      document.querySelector(`.marker[data-id=${id}`).classList.add('openPreview');
    }

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
  if (e !== undefined && (e.target.id === 'location-entity-shareButton' || e.target.id === 'location-entity-markButton')) {
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
let cancelMoveFunktion;

function touchDown(e) {
  cancelMoveFunktion = false;
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
  if (this === smallEntityWrapper &&  smallEntityWrapper.classList.contains('show-complete') && touchDif < 0 && smallEntityWrapper.scrollTop != 0 || cancelMoveFunktion === true) {
    cancelMoveFunktion = true;
    return;
  }
  if (this === smallEntityWrapper &&  smallEntityWrapper.classList.contains('show-complete') && touchDif > 0 && smallEntityWrapper.scrollTop >= 0 || cancelMoveFunktion === true) {
    cancelMoveFunktion = true;
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
    addContentToEntity();
  }
  //change top on preview on scroll down -> just show a animation
  if (touchDif < 0 && !smallEntityWrapper.classList.contains('show-complete')) {
    smallEntityWrapper.style.setProperty('top', `${vhDifUp}vh`);
  }

  //change top from fullscreen version to preview 
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
  if (this === smallEntityWrapper &&  smallEntityWrapper.classList.contains('show-complete') && touchDif <= 0 && smallEntityWrapper.scrollTop != 0 || cancelMoveFunktion === true) {
    return;
  }
  if (this === smallEntityWrapper &&  smallEntityWrapper.classList.contains('show-complete') && touchDif >= 0 && smallEntityWrapper.scrollTop >= 0 || cancelMoveFunktion === true) {
    return;
  }

  //100px as min touch difference
  const minDifference = 50;
  if (touchDif > minDifference) {
    changeToFullscreen();
  }
  else if (smallEntityWrapper.classList.contains('show-complete') && touchDif < (minDifference * (-1))) {
    changeToPreview();
  }
  //after click on holder in fullscreen
  else if (smallEntityWrapper.classList.contains('show-complete')) {
    smallEntityWrapper.style.removeProperty('top');
  }
  //from preview with small touchDif -> still on preview
  else if (!smallEntityWrapper.classList.contains('show-complete') && touchDif * (-1) < minDifference) {
    smallEntityWrapper.style.setProperty('top', `${startTopProperty}vh`);
    removeContentToEntity();
  }
  //from preview with higher touchDif -> remove Preview
  else if (!smallEntityWrapper.classList.contains('show-complete') && touchDif < minDifference * (-1)) {
    removePreview();
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

function removePreview() {
  removeStyleOfMarker();
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

function removeStyleOfMarker() {
  let params = new URLSearchParams(document.location.search.substring(1));

  if (params.get("id") !== null && history.pushState) {
    document.querySelector(`.marker[data-id=${params.get("id")}`).classList.remove('openPreview');
  }
}

function setFuntionForFilter() {
  document.getElementById('filter-add').addEventListener('click', function() {
    this.classList.toggle('open');
    if (this.classList.contains('open')) {
      const array = document.querySelectorAll('.wrapping-filter button:not(.filter-add)');
      for (const button of array) {
        button.classList.remove('hide');
      }
    }

    setTimeout(() => {
      this.parentNode.classList.toggle('showElements');
      if (!this.parentNode.classList.contains('showElements')) {
        const array = document.querySelectorAll('.wrapping-filter button:not(.filter-add)');
        for (const button of array) {
          button.addEventListener('transitionend', function () {
            if (!this.parentNode.classList.contains('showElements')) {
              this.classList.add('hide');
            }
          }); 
        }
      } 
    }, 1);
  });

  const allButtons = document.querySelectorAll('.wrapping-filter .floatingButton:not(:last-child)');
  for (const button of allButtons) {
    button.addEventListener('click', function() {
      this.classList.toggle('active');

      const allActiveButtons = document.querySelectorAll('.wrapping-filter .floatingButton.active');
      const allMarker = document.querySelectorAll('.mapboxgl-canvas-container > div.marker');

      for (const marker of allMarker) {
        marker.classList.add('hide');
      }

      for (const activeButton of allActiveButtons) {
        for (const marker of allMarker) {
          if (marker.classList.contains(activeButton.dataset.category)) {
            marker.classList.remove('hide');
          }
        }
      }

      if (allActiveButtons.length === 0) {
        for (const marker of allMarker) {
          marker.classList.remove('hide');
        }
      }
    });
  }
}

function setFunctionForLinkedEventMenuContent() {

  //functionality for share button
  document.getElementById('entity-event-share').addEventListener('click', () => {
    const eventID = document.getElementById('event-menu-content').dataset.eventid;
    const url = `${window.location.origin}/article.html?id=${eventID}`;
    const title = document.title;
    if (navigator.share) {
      navigator.share({
        title: title,
        url: url
      }).then(() => {
      })
      .catch(console.error);
    } else {
      console.log(url);
    }
  });

  //functionality for export button
  document.getElementById('entity-event-export').addEventListener('click', () => {
    const eventID = document.getElementById('event-menu-content').dataset.eventid;
    eventDB._getDoc(eventID).then(function(data) {
      const cal = ics();
      const date = data.date.split('.').reverse().join('-');
      const time = data.start.replace(/[^\d:]/g, '');
      //add offset to UTC 
      cal.addEvent(data.title, data.summary, data.location, `${date}T${time}+02:00`, `${date}T${time}+02:00`);

      //time is not local time format
      cal.download(data.title);
    });
  });


  //functionality for bookmark button
  document.getElementById('entity-event-bookmark').addEventListener('click', () => {
    const eventID = document.getElementById('event-menu-content').dataset.eventid;
    bookmarksDB._getDoc(eventID).then(function(data) {
      bookmarksDB._removeDoc(data).then(() => {
        showNotificationForBookmark(false, "event");  
      });
    }).catch(function(){
      //put element on bookmarks
      eventDB._getDoc(eventID).then(function(data) {
        let putItemBookmarksDB = new Promise(function(resolve, reject){
          bookmarksDB._putItem(data, resolve, reject);
        });
        putItemBookmarksDB.then(() => {
          bookmarksDB.infoLocal.then(() => {
            showNotificationForBookmark(true, "event");  
            //TODO: add image to bookmark
          });
        });
      });
    });
  });
}

function showNotificationForBookmark(add, string) {

  if (string === "location") {
    document.getElementById('n-bookmark-text').textContent = add ? "Der Ort wurde zu deiner Merkliste hinzugefügt." : "Der Ort wurde aus deiner Merkliste entfernt."
  }
  else {
    document.getElementById('n-bookmark-text').textContent = add ? "Die Veranstaltung wurde zu deiner Merkliste hinzugefügt." : "Die Veranstaltung wurde aus deiner Merkliste entfernt."
  }
  
  document.getElementById('notification-bookmark').classList.remove('hide');
  
  setTimeout(() => {
    document.getElementById('notification-bookmark').classList.remove('transformOut');
  }, 10);

  setTimeout(() => {
    document.getElementById('notification-bookmark').classList.add('transformOut');

    setTimeout(() => {
      document.getElementById('notification-bookmark').classList.add('hide');
    }, 300);

  }, 4000);
}

function setFunctionForLocationActions() {
  //function foor bookmark button
  document.getElementById('location-entity-markButton').addEventListener('click', () => {
    const locationID = document.getElementById('location-entity-wrapper').getAttribute('data-id');
    bookmarksDB._getDoc(locationID).then(function(data) {
      bookmarksDB._removeDoc(data).then(() => {
        showNotificationForBookmark(false, "location");
        changeHeart();
      });
    }).catch(function(){
      //put element on bookmarks
      locationDB._getDoc(locationID).then(function(data) {
        let putItemBookmarksDB = new Promise(function(resolve, reject){
          bookmarksDB._putItem(data, resolve, reject);
        });
        putItemBookmarksDB.then(() => {
          bookmarksDB.infoLocal.then(() => {
            showNotificationForBookmark(true, "location");
            changeHeart();
            //TODO: add image to bookmark
          });
        });
      });
    });
  });

  //function for shareButton
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

function changeHeart() {
  const locationID = document.getElementById('location-entity-wrapper').getAttribute('data-id');

  bookmarksDB._getDoc(locationID).then(function(data) {
    document.getElementById('location-entity-markButton').src = "/public/assets/images/icons/heart-full-green.svg";
  }).catch(function(){
    document.getElementById('location-entity-markButton').src = "/public/assets/images/icons/heart-green.svg";
  });
}



















