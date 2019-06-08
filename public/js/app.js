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