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

    const article = document.createElement('a');
    const img = document.createElement('img');
    const heading = document.createElement('h4');
    heading.classList.add('recommend-sub-heading');

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

    switch (database) {
      case eventDB: article.href = `article.html?id=${entry._id}`; break;
      case locationDB: article.href = `map.html?id=${entry._id}`; break;
      case tourDB: container = tourTips; break;
      default:
        break;
    }
    
    heading.textContent = entry.title;
  }
}


//just for development
function setTipWithJSON(database, entry) {  
  const locationTips = document.getElementById('location-tips');

  if (locationTips === null || locationTips === undefined) {
    //return;
  }
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

     
  const article = document.createElement('a');
  const img = document.createElement('img');
  const heading = document.createElement('h4');
  heading.classList.add('recommend-sub-heading');

  if (entry.attachments !== undefined && entry.attachments.length !== 0) {
    database._getAttachment(entry.id, entry.attachments[0].attachmentName).then(function(blob){
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

  switch (database) {
    case eventDB: article.href = `article.html?id=${entry.id}`; break;
    case locationDB: article.href = `map.html?id=${entry.id}`; break;
    case tourDB: container = tourTips; break;
    default:
      break;
  }
  
  heading.textContent = entry.title;
}