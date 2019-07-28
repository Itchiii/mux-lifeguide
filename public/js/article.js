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
          articleTitle.innerHTML = doc.title.toUpperCase();
          articleTitle.classList.add("articletitle");
          articleForm.append(articleTitle);
  
          //div for articleHead
          const articleHead = document.createElement("div");
          articleHead.classList.add("articleHead");
  
          //div for daydate and month called articleDate
          const eventDate = document.createElement("div");
          const daydate = document.createElement("h4");
          const month = document.createElement("div");
          daydate.innerHTML = doc.date.substring(0, 2);
          month.innerHTML = doc.month.substring(0, 3).toUpperCase();
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
          const day = document.createElement("p");
          const start = document.createElement("p");
          const location = document.createElement("p");
          const street = document.createElement("p");
          const place = document.createElement("p");
          const daybegin = doc.day.substring(0, 2); //day with first 2 letters
          const dayadd = ".,\xa0";
          day.innerHTML = daybegin.concat(dayadd);
          const clock = doc.start;
          const uhr = "\xa0Uhr";
          start.innerHTML = clock.concat(uhr);
          location.innerHTML = doc.location;
          const streetstreet = doc.street;
          const streetadd = ",\xa0";
          street.innerHTML = streetstreet.concat(streetadd);
          place.innerHTML = doc.place;
          dayandstart.append(day);
          dayandstart.append(start);
          articleInfo.append(dayandstart);
          articleInfo.append(location);
          articleInfo.append(street);
          articleInfo.append(place);
          articleHead.append(articleInfo);
  
          //div for map
          const mapwrapper = document.createElement("div")
          mapwrapper.classList.add("map-wrapper");
          const map = document.createElement("p");
          const icon = document.createElement("IMG");
          icon.setAttribute("src", "public/assets/images/icons/needle_green.svg");
          icon.classList.add("needle-article");
          map.innerHTML = "Auf Karte anzeigen";
          map.style.color ="#7ECE96";
          mapwrapper.append(icon);
          mapwrapper.append(map);
          articleHead.append(mapwrapper);
          
  
          //div for summary and description
          const articleSummary = document.createElement("h3");
          articleSummary.innerHTML = doc.summary;
          articleSummary.classList.add("articleSummary");
          const articleText = document.createElement("p");
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

