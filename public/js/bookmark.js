bookmarksDB.allDocsOfLocalDB.then(function(result) {
  for (const entry of result.rows) {
      if (entry.doc.date !== "") {
      //div for daydate and month called eventDate
      const eventDate = document.createElement("div");
      const daydate = document.createElement("h4");
      const month = document.createElement("div");
      daydate.innerHTML = entry.doc.date.substring(0, 2);
      const whichMonth = entry.doc.date.substring(3, 5);
      switch (whichMonth) {
        case "01":
          month.innerHTML = "JAN";
          break;
        case "02":
          month.innerHTML = "FEB";
          break;
          case "03":
            month.innerHTML = "MÄR";
            break;
          case "04":
            month.innerHTML = "APR";
            break;
            case "05":
              month.innerHTML = "MAI";
              break;
            case "06":
              month.innerHTML = "JUN";
              break;
              case "07":
                month.innerHTML = "JUL";
                break;
              case "08":
                month.innerHTML = "AUG";
                break;
                case "09":
                  month.innerHTML = "SEP";
                  break;
                case "10":
                  month.innerHTML = "OKT";
                  break;
                  case "11":
                    month.innerHTML = "NOV";
                    break;
                  case "12":
                    month.innerHTML = "DEZ";
                    break;   
      }
        daydate.classList.add("daydate");
        month.classList.add("month");
        eventDate.classList.add("eventDate");
        eventDate.append(daydate);
        eventDate.append(month);

        //div for title and summary called eventInfo
        const eventInfo = document.createElement("div");
        const title = document.createElement("h2");
        title.classList.add("title-event");
        const summary = document.createElement("p");
        title.innerHTML = entry.doc.title.toUpperCase();
        summary.innerHTML = entry.doc.summary;
        eventInfo.append(title);
        eventInfo.append(summary);
        eventInfo.classList.add("eventInfo");


        const menu = document.createElement('div');
        menu.classList.add('eventMenu');
        //move and toggle display of menu content
        menu.addEventListener('click', function () {
          const offset = 50;
          const content = document.getElementById('event-menu-content');
          //set position
          content.style.top = this.getBoundingClientRect().top - document.getElementById('bookmarks').getBoundingClientRect().top + offset + "px";
                
          if(content.dataset.eventid === this.closest('.event').dataset.id || content.classList.contains('hide')) {
            content.classList.toggle('hide');
          }

          if (!content.classList.contains('hide')) {
            content.dataset.eventid = entry.doc._id;
          }

          const eventID = content.dataset.eventid;
          bookmarksDB._getDoc(eventID).then(function(data) {
            document.getElementById('entity-event-bookmark').classList.add('marked');
          }).catch(function(){
            document.getElementById('entity-event-bookmark').classList.remove('marked');
          });
        });

        //div for eventInfo and eventDate called eventColumn
        const eventColumn = document.createElement("div");
        eventColumn.append(eventDate);
        eventColumn.append(eventInfo);
        eventColumn.append(menu);
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
        event.addEventListener("click", function(e){
          if (!e.target.classList.contains("eventMenu") && document.getElementById('event-menu-content').classList.contains('hide')) {
            window.open(`article.html?id=${this.dataset.id}`, "_self");
          }
        });
       }

      else {
        //div for title and summary called eventInfo
        const eventInfo = document.createElement("div");
        const title = document.createElement("h2");
        title.classList.add("title-event");
        const summary = document.createElement("p");
        title.innerHTML = entry.doc.titletoUpperCase();
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


setFunctionForLinkedEventMenuContent();

//add body listener on click to hide the event menu
document.body.addEventListener('click', function (event) {
  if (document.getElementById('event-menu-content') !== undefined && !document.getElementById('event-menu-content').classList.contains('hide') && !event.target.classList.contains('eventMenu')) {
    document.getElementById('event-menu-content').classList.add('hide');
  }
});