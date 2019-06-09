//Added Slideout
var slideout = new Slideout({
  'panel': document.getElementById('panel'),
  'menu': document.getElementById('menu'),
  'padding': 256,
  'tolerance': 70,
  'duration': 1
});

// Toggle button
document.getElementById('toggle-button').addEventListener('click', function() {
  slideout.toggle();
});

slideout.on('beforeopen', function() { 
  document.getElementById('menu').style.display = "block";
 });

slideout.on('open', function() { 
  
  document.getElementById('toggle-button').style.transform = 'translateX(256px)';
  document.getElementById('menu').style.transform = "translateX(0)";
 });

 slideout.on('close', function() { 
  
  document.getElementById('toggle-button').style.transform = 'translateX(0)';
  document.getElementById('menu').style.transform = "translateX(-256px)";
  document.getElementById('menu').style.display = "block";
  setTimeout(function(){
    document.getElementById('menu').style.display = "none";
  }, 250)
 });

//https://css-tricks.com/how-to-use-the-web-share-api/
const title = document.title;
const url = document.querySelector('link[rel=canonical]') ? document.querySelector('link[rel=canonical]').href : document.location.href;

document.getElementById('share-button').addEventListener('click', event => {
  if (navigator.share) {
    navigator.share({
      title: title,
      url: url
    }).then(() => {
      console.log('Thanks for sharing!');
    })
    .catch(console.error);
  } else {
    // fallback
  }
});