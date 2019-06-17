//function to get database entrys appear on events.html
eventDB.allDocsOfLocalDB.then(function(result) {
    for (const entry of result.rows) {

      //div for dates
      const newDate = document.createElement("h4");
      newDate.innerHTML = entry.doc.date;
      newDate.className = "eventDates";
      //document.getElementById('events').append(newDate);

      const newDiv = document.createElement("div");
      //const newF = document.createElement("img");
      const newH = document.createElement("h3");
      const newS = document.createElement("p");
      //newF.innerHTML = entry.doc.attachmentName;
      newH.innerHTML = entry.doc.title;
      newS.innerHTML = entry.doc.summary;
      //newDiv.append(newF);
      newDiv.append(newH);
      newDiv.append(newS);
      newDiv.className = "eventList";
      //document.getElementById('events').append(newDiv);

      const eventColumn = document.createElement("div");
      eventColumn.append(newDate);
      eventColumn.append(newDiv);
      eventColumn.className = "eventColumn";
      document.getElementById('events').append(eventColumn);
/*       if (entry.doc._attachments !== undefined) {
        locationDB._getAttachment(entry.doc._id, Object.keys(entry.doc._attachments)[0]).then(function(blob){
          console.log("test");
          var url = URL.createObjectURL(blob);
          var img = document.createElement('img');
          img.src = url;
          document.body.appendChild(img);
        });
      } */
    }
  });