bookmarksDB.allDocsOfLocalDB.then(function(result) {
  for (const entry of result.rows) {
      if (entry.doc.date !== "") {
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

      else {
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
        eventColumn.append(eventInfo);
        eventColumn.classList.add("eventColumn", "b-column");
        
        //div for eventimg and eventColumn
        const event = document.createElement("div");
        event.classList.add("event")
        //event.append(eventimg);
        event.append(eventColumn);
        document.getElementById('b-locations-entries').append(event);

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