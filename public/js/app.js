if(document.body.id === "index") setRecommend(locationDB);
if(document.body.id === "index" || document.body.id === "events" || document.body.id === "article-body") setRecommend(eventDB);
if(document.body.id === "index") setRecommend(tourDB);


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


function setFunctionForLinkedEventMenuContent() {

  //functionality for share button
  document.getElementById('entity-event-share').addEventListener('click', () => {
    const eventID = document.getElementById('event-menu-content').dataset.eventid;
    const url = `${window.location.origin}/article.html?id=${eventID}`;
    const title = "Lifeguide-Augsburg";
    
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
        document.querySelector(`.event[data-id^="${eventID}"]`).remove();
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