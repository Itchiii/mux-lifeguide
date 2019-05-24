// Registering Service Worker after the page loaded and removed old one
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      
      //remove all old service Worker 
      //TODO: this is just for development
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