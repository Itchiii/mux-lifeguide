//function to get database entrys appear on events.html
eventDB.allDocsOfLocalDB.then(function(result) {
    for (const entry of result.rows) {
      const newDiv = document.createElement("div");
      const newF = document.createElement("img");
      const newD = document.createElement("p");
      const newH = document.createElement("h2");
      const newS = document.createElement("h3");
      const newP = document.createElement("p");
      newF.innerHTML = entry.doc.attachment;
      newD.innerHTML = entry.doc.datum;
      newH.innerHTML = entry.doc.title;
      newS.innerHTML = entry.doc.summary;
      newP.innerHTML = entry.doc.description;
      newDiv.append(newF);
      newDiv.append(newD);
      newDiv.append(newH);
      newDiv.append(newS);
      newDiv.append(newP);
      document.getElementById('events').append(newDiv);
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