var CACHE_VERSION = 4;
var CURRENT_CACHES = {
  app: 'mux-lifeguide-v' + CACHE_VERSION
};

// Files to cache
var contentToCache = [
  './',
  './index.html',
  './map.html',
  './events.html',
  './article.html',
  './bookmarks.html',
  './eventformular.html',
  '/public/js/register-worker.js',
  '/public/js/app.js',
  '/public/js/map.js',
  '/public/js/bookmark.js',
  '/public/js/article.js',
  '/public/js/eventformular.js',
  '/public/js/events.js',
  '/public/js/index.js',
  '/public/css/compress/style.min.css',
  '/node_modules/mapbox-gl/dist/mapbox-gl.css',
  '/node_modules/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css',
  '/public/assets/favicon.ico',
  '/public/assets/images/LifeguideLogogruen.svg',
  '/accessTokenMapBox.txt',
  '/mux-lifeguide.manifest',
  '/node_modules/pouchdb/dist/pouchdb.find.js',
  '/node_modules/mapbox-gl/dist/mapbox-gl.js',
  '/node_modules/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.min.js',
  '/vendor/ics/ics.js'
];

//code from https://github.com/gokulkrishh/demo-progressive-web-app/blob/master/serviceWorker.js
//TODO: Understand that.

//Adding `install` event listener
self.addEventListener('install', (event) => {
  //console.info('Event: Install');

  event.waitUntil(
    caches.open(CURRENT_CACHES.app)
    .then((cache) => {
      //[] of files to cache & if any of the file not present `addAll` will fail
      return cache.addAll(contentToCache)
      .then(() => {
        console.info('All files are cached');
        return self.skipWaiting(); //To forces the waiting service worker to become the active service worker
      })
      .catch((error) =>  {
        console.error('Failed to cache', error);
      })
    })
  );
});


//TODO: Dont fetch all tiles of map!
/*
  FETCH EVENT: triggered for every request made by index page, after install.
*/

//Adding `fetch` event listener
self.addEventListener('fetch', (event) => {
  //console.info('Event: Fetch');

  var request = event.request;

  //Tell the browser to wait for newtwork request and respond with below
  event.respondWith(
    //If request is already in cache, return it
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }

      //if request is not cached or navigation preload response, add it to cache
      return fetch(request).then((response) => {
        var responseToCache = response.clone();
        caches.open(CURRENT_CACHES.app).then((cache) => {
            cache.put(request, responseToCache).catch((err) => {
              console.warn(request.url + ': ' + err.message);
            });
          });

        return response;
      });
    })
  );
});

/*
  ACTIVATE EVENT: triggered once after registering, also used to clean up caches.
*/

//Adding `activate` event listener
self.addEventListener('activate', (event) => {
  //console.info('Event: Activate');

  //Remove old and unwanted caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CURRENT_CACHES.app) {
            return caches.delete(cache); //Deleting the old cache (cache v1)
          }
        })
      );
    })
    .then(function () {
      console.info("Old caches are cleared!");
      // To tell the service worker to activate current one 
      // instead of waiting for the old one to finish.
      return self.clients.claim(); 
    }) 
  );
});