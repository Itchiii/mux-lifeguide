//get id from URL
let params = (new URL(document.location)).searchParams;
let iddata = params.get('id');

//init div for article.html
const articleForm = document.createElement("div");
articleForm.classList.add("articleform");
document.getElementById('article').append(articleForm);


eventDB._getDoc(iddata).then(function(doc) {
    
          //div for article title
          const articleTitle = document.createElement("h2");
          articleTitle.innerHTML = doc.title;
          articleTitle.classList.add("articletitle");
          articleForm.append(articleTitle);
  
          //div for articleHead
          const articleHead = document.createElement("div");
          articleHead.classList.add("articleHead");
  
          //div for daydate and month called articleDate
          const eventDate = document.createElement("div");
          const daydate = document.createElement("div");
          const month = document.createElement("div");
          daydate.innerHTML = doc.daydate;
          month.innerHTML = doc.month;
          daydate.classList.add("daydate");
          month.classList.add("month");
          eventDate.classList.add("eventDate");
          eventDate.append(daydate);
          eventDate.append(month);
          articleHead.append(eventDate);
          articleForm.append(articleHead);
  
          //div for day, start, place called articleInfo
          const articleInfo = document.createElement("div");
          articleInfo.classList.add("articleInfo");
          const dayandstart = document.createElement("div");
          dayandstart.classList.add("dayandstart");
          const day = document.createElement("div");
          const start = document.createElement("div");
          const location = document.createElement("div");
          const street = document.createElement("div");
          const place = document.createElement("div");
          day.innerHTML = doc.day;
          start.innerHTML = doc.start;
          location.innerHTML = doc.location;
          street.innerHTML = doc.street;
          place.innerHTML = doc.place;
          dayandstart.append(day);
          dayandstart.append(start);
          articleInfo.append(dayandstart);
          articleInfo.append(location);
          articleInfo.append(street);
          articleInfo.append(place);
          articleHead.append(articleInfo);
  
          //div for map
          const map = document.createElement("div");
          map.innerHTML = "Auf Karte anzeigen";
          articleHead.append(map);
  
          //div for summary and description
          const articleSummary = document.createElement("h4");
          articleSummary.innerHTML = doc.summary;
          articleSummary.classList.add("articleSummary");
          const articleText = document.createElement("div");
          articleText.innerHTML = doc.description;
          articleForm.append(articleSummary);
          articleForm.append(articleText);

          if (doc._attachments !== undefined) {

            eventDB._getAttachment(doc._id, Object.keys(doc._attachments)[0]).then(function(blob){
                var url = URL.createObjectURL(blob);
                var articleimg = document.createElement('img');
                articleimg.src = url;
                articleimg.classList.add("articleimg");
                articleForm.insertBefore(articleimg, articleTitle);
                console.log("Bild da");
            });
        }

    }).catch(function (err) {
        console.log("kein Bild!");
        
    });

