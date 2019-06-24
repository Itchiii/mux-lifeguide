//function to get database entrys appear on events.html
eventDB.allDocsOfLocalDB.then(function(result) {
    for (const entry of result.rows) {

      //div for dates called daydate
      const daydate = document.createElement("h5");
      daydate.innerHTML = entry.doc.daydate;
      daydate.classList.add("daydate");

      //div for titel and summary called eventInfo
      const eventInfo = document.createElement("div");
      const titel = document.createElement("h4");
      const summary = document.createElement("p");
      titel.innerHTML = entry.doc.title;
      summary.innerHTML = entry.doc.summary;
      eventInfo.append(titel);
      eventInfo.append(summary);
      eventInfo.classList.add("eventInfo");

      //div for eventInfo and daydate called eventColumn
      const eventColumn = document.createElement("div");
      eventColumn.append(daydate);
      eventColumn.append(eventInfo);
      eventColumn.classList.add("eventColumn");


      //div for event image called eventimg
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
/*        link container
          const link = document.createElement("a");
          link.append(event); */

          //dataset
          event.dataset.id = entry.doc._id;
          //Put events container in DOM
          document.getElementById('events').append(event);
          event.addEventListener("click", function(){
            window.open(`article.html?id=${this.dataset.id}`, "_self");
          });
        });
      }

    }
  });