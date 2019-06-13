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

function setRecommend(database) {
  switch (database) {
    case eventDB:   eventDB._getDocByFind('recommend', true).then(function(recommendLocations) {
      setAllTips(eventDB, recommendLocations);
    }); break;
    case locationDB: locationDB._getDocByFind('recommend', true).then(function(recommendLocations) {
      setAllTips(locationDB, recommendLocations);
   }); break;
    case tourDB:   tourDB._getDocByFind('recommend', true).then(function(recommendLocations) {
      setAllTips(tourDB, recommendLocations);
   }); break;
  }
}

function setAllTips(database, recommends) {
  for (const entry of recommends.docs) {
    const locationTips = document.getElementById('location-tips');
    const eventTips = document.getElementById('event-tips');
    const tourTips = document.getElementById('tour-tips');
    let container;

    switch (database) {
      case eventDB: container = eventTips; break;
      case locationDB: container = locationTips; break;
      case tourDB: container = tourTips; break;
      default:
        break;
    }

    const article = document.createElement('article');
    const img = document.createElement('img');
    const heading = document.createElement('h4');

    if (entry._attachments !== undefined) {
      database._getAttachment(entry._id, Object.keys(entry._attachments)[0]).then(function(blob){
        let url = URL.createObjectURL(blob);
        img.src = url;
        article.append(img);
        article.append(heading);
        container.append(article);
      }).catch(function(e) {
        console.error(e)
      });
    }

    else {
      article.append(img);
      article.append(heading);
      container.append(article);
    }

    heading.textContent = entry.title;
  }
}


//just for development
function setTipWithJSON(database, entry) {  
  const locationTips = document.getElementById('location-tips');
  const eventTips = document.getElementById('event-tips');
  const tourTips = document.getElementById('tour-tips');
  let container;

  switch (database) {
    case eventDB: container = eventTips; break;
    case locationDB: container = locationTips; break;
    case tourDB: container = tourTips; break;
    default:
      break;
  }

     
  const article = document.createElement('article');
  const img = document.createElement('img');
  const heading = document.createElement('h4');

  if (entry.attachmentName !== undefined) {
    database._getAttachment(entry.id, entry.attachmentName).then(function(blob){
      let url = URL.createObjectURL(blob);
      img.src = url;
      article.append(img);
      article.append(heading);
      container.append(article);
    }).catch(function(e) {
      console.error(e)
    });
  }

  else {
    article.append(img);
    article.append(heading);
    container.append(article);
  }

  heading.textContent = entry.title;
}