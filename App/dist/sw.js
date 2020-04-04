/* eslint-env node */


var CACHE_NAME = 'tele-md-cache-v1';
//new
var urlsToCache = ['/css/main.css'];

self.addEventListener('install', function (event) ***REMOVED***
  console.log('installing');
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) ***REMOVED***
        console.log('Opened cache');
        return cache.addAll(urlsToCache).then(function () ***REMOVED***
          console.log('All resources have been fetched and cached.');
      ***REMOVED***);
    ***REMOVED***)
  );
***REMOVED***);

self.addEventListener('fetch', function (event) ***REMOVED***
  event.respondWith(
    caches.match(event.request).then(function (response) ***REMOVED***
      return response || fetch(event.request);

  ***REMOVED***)
  );

***REMOVED***);
