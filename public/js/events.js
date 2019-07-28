

document.getElementById("searchInput").addEventListener("keyup", search);
document.getElementById("searchglass").addEventListener("click", searchGlass);

function search() {
  var entrys = document.getElementsByClassName("eventInfo");
  var eventBlock = document.getElementsByClassName("event");
  //check if input is empty again
  if(document.getElementById("searchInput").value === "") {
    //Show all events
    for (i = 0; i<eventBlock.length; i++) {
      eventBlock[i].style.display="flex";
    }
  }
  if(event.key === "Enter") {
    var tippedWord = document.getElementById("searchInput").value.toLowerCase();
    //Show all events when you make a new search
    for (i = 0; i<eventBlock.length; i++) {
        eventBlock[i].style.display="flex";
    }
    //check tippedWord
    for (i = 0; i<entrys.length; i++) {
      if(entrys[i].textContent.toLowerCase().includes(tippedWord)) {
        console.log("Gefunden!");
      }
      else {
        eventBlock[i].style.display="none";
      }
    }
  }
}
function searchGlass() {
  var entrys = document.getElementsByClassName("eventInfo");
  var eventBlock = document.getElementsByClassName("event");
  //check if input is empty again
  if(document.getElementById("searchInput").value === "") {
    //Show all events
    for (i = 0; i<eventBlock.length; i++) {
      eventBlock[i].style.display="flex";
    }
  }
  else {
    var tippedWord = document.getElementById("searchInput").value.toLowerCase();
    //Show all events when you make a new search
    for (i = 0; i<eventBlock.length; i++) {
        eventBlock[i].style.display="flex";
    }
    //check tippedWord
    for (i = 0; i<entrys.length; i++) {
      if(entrys[i].textContent.toLowerCase().includes(tippedWord)) {
      }
      else {
        eventBlock[i].style.display="none";
      }
    }
  }
}

//div for every event
          const events = document.createElement("div");
          events.classList.add("events");

//function to get database entrys appear on events.html
eventDB.allDocsOfLocalDB.then(function(result) {
    for (const entry of result.rows) {
      if(entry.doc.month === undefined || entry.doc.title === undefined || entry.doc.date === undefined){
        console.log("ist leer");
      }
      else {


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
        const offset = 80;
        const content = document.getElementById('event-menu-content');
        //set position
        content.style.top = this.getBoundingClientRect().top - document.getElementById('events').getBoundingClientRect().top + offset + "px";
        
        //show menu
        if(content.dataset.eventid === this.closest('.event').dataset.id || content.classList.contains('hide')) {
          content.classList.toggle('hide');
        }

        //set event ID
        if (!content.classList.contains('hide')) {
          content.dataset.eventid = entry.doc._id;
        }

        //set or remove heart 
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
      eventColumn.classList.add("eventColumn");


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
          events.append(event);

          //dataset
          event.dataset.id = entry.doc._id;
          //Put events container in DOM
          document.getElementById('events').append(events);
          event.addEventListener("click", function(e){
            if (!e.target.classList.contains("eventMenu") && document.getElementById('event-menu-content').classList.contains('hide')) {
              window.open(`article.html?id=${this.dataset.id}`, "_self");
            }
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
          events.append(event);

          //dataset
          event.dataset.id = entry.doc._id;
          //Put events container in DOM
          document.getElementById('events').append(events);
          event.addEventListener("click", function(e){
            if (!e.target.classList.contains("eventMenu") && document.getElementById('event-menu-content').classList.contains('hide')) {
              window.open(`article.html?id=${this.dataset.id}`, "_self");
            }
          });
      }
    }
    }
  });


  setFunctionForLinkedEventMenuContent();

  //add body listener on click to hide the event menu
  document.body.addEventListener('click', function (event) {
    if (document.getElementById('event-menu-content') !== undefined && !document.getElementById('event-menu-content').classList.contains('hide') && !event.target.classList.contains('eventMenu')) {
      document.getElementById('event-menu-content').classList.add('hide');
    }
  });
  



  
  