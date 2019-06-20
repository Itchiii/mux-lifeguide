//function to get database entrys appear on events.html
eventDB.allDocsOfLocalDB.then(function(result) {
    for (const entry of result.rows) {

      //div for dates called eventDate
      const eventDate = document.createElement("h5");
      eventDate.innerHTML = entry.doc.date;
      eventDate.classList.add("eventDate");

      //div for titel and summary called eventInfo
      const eventInfo = document.createElement("div");
      const titel = document.createElement("h4");
      const summary = document.createElement("p");
      titel.innerHTML = entry.doc.title;
      summary.innerHTML = entry.doc.summary;
      eventInfo.append(titel);
      eventInfo.append(summary);
      eventInfo.classList.add("eventInfo");

      //div for eventInfo and eventDate called eventColumn
      const eventColumn = document.createElement("div");
      eventColumn.append(eventDate);
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
            const article = document.createElement('p');
            article.innerHTML = entry.doc.summary;
            document.getElementById('article').append(article);
            window.open("article.html", "_self");
          });
        });
      }

    }
  });