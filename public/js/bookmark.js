bookmarksDB.allDocsOfLocalDB.then(function(result) {
  for (const entry of result.rows) {
      console.log(entry);

      //div for daydate and month called eventDate
      const eventDate = document.createElement("div");
      const daydate = document.createElement("div");
      const month = document.createElement("div");
      daydate.innerHTML = entry.doc.daydate;
      month.innerHTML = entry.doc.month;
      daydate.classList.add("daydate");
      month.classList.add("month");
      eventDate.classList.add("eventDate");
      eventDate.append(daydate);
      eventDate.append(month);

      //div for title and summary called eventInfo
      const eventInfo = document.createElement("div");
      const title = document.createElement("h4");
      const summary = document.createElement("p");
      title.innerHTML = entry.doc.title;
      summary.innerHTML = entry.doc.summary;
      eventInfo.append(title);
      eventInfo.append(summary);
      eventInfo.classList.add("eventInfo");

      //div for eventInfo and eventDate called eventColumn
      const eventColumn = document.createElement("div");
      eventColumn.append(eventDate);
      eventColumn.append(eventInfo);
      eventColumn.classList.add("eventColumn", "b-column");

      //div for event with image called eventimg
      if (entry.doc._attachments !== undefined) {
        eventDB._getAttachment(entry.doc._id, Object.keys(entry.doc._attachments)[0]).then(function(blob){
          var url = URL.createObjectURL(blob);
          var eventimg = document.createElement('img');
          eventimg.src = url;
          eventimg.classList.add("eventimg");

          //div for eventimg and eventColumn
          const event = document.createElement("div");
          event.classList.add("event")
          event.append(eventimg);
          event.append(eventColumn);
          document.getElementById('b-event-entries').append(event);

          //dataset
          event.dataset.id = entry.doc._id;
          //Put events container in DOM
          //document.getElementById('b-events').append(events);
          event.addEventListener("click", function(){
            window.open(`article.html?id=${this.dataset.id}`, "_self");
          });
        });
      }
      //event when there's no image
      else {
          //div for eventimg and eventColumn
          const event = document.createElement("div");
          event.classList.add("event")
          //event.append(eventimg);
          event.append(eventColumn);
          document.getElementById('b-event-entries').append(event);

          //dataset
          event.dataset.id = entry.doc._id;
          //Put events container in DOM
          //document.getElementById('b-events').append(events);
          event.addEventListener("click", function(){
            window.open(`article.html?id=${this.dataset.id}`, "_self");
          });
      }
  }
}.bind(this));

// Setup isScrolling variable
let isScrolling;
document.getElementById('bookmarks').addEventListener('scroll', function ( event ) {

  // Clear our timeout throughout the scroll
  window.clearTimeout( isScrolling );

  // Set a timeout to run after scrolling ends
  isScrolling = setTimeout(function() {

    const aTags = document.querySelectorAll('.bookmark-header > a');
    for (const a of aTags) {
      a.classList.remove('active');
    }

    switch (event.srcElement.scrollLeft / window.innerWidth) {
      case 0: document.getElementById('b-h-events').classList.add('active'); break;
      case 1: document.getElementById('b-h-locations').classList.add('active'); break;
      case 2: document.getElementById('b-h-tours').classList.add('active'); break;
      default: document.getElementById('b-h-events').classList.add('active'); break;
    }
  }, 50);

}, false);