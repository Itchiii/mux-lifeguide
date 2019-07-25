var day;
var daydate;
var month;
var time;
var city;
var adress;
var titleEvent;
var hostID;
var subject;
var text;

var stepOne = document.getElementById('stepOne');
var stepTwo = document.getElementById('stepTwo');
var stepThree = document.getElementById('stepThree');

document.getElementById('stepOne').style.display="flex";
document.getElementById('stepTwo').style.display="none";
document.getElementById('stepThree').style.display="none";
document.getElementById('back').style.visibility="hidden";
document.getElementById('bar1').style.backgroundColor="green";
console.log("hallooA");
function nextStep() {
    if (stepOne.style.display === 'flex') {
        document.getElementById('stepOne').style.display="none";
        document.getElementById('stepTwo').style.display="flex";
        document.getElementById('stepThree').style.display="none";
        document.getElementById('bar1').style.backgroundColor="white";
        document.getElementById('bar2').style.backgroundColor="green";
        document.getElementById('back').style.visibility="visible";
    }
    else {
        document.getElementById('stepOne').style.display="none";
        document.getElementById('stepTwo').style.display="none";
        document.getElementById('stepThree').style.display="flex";
        document.getElementById('bar1').style.backgroundColor="white";
        document.getElementById('bar2').style.backgroundColor="white";
        document.getElementById('bar3').style.backgroundColor="green";
        document.getElementById('back').style.visibility="visible";
    }
}
function back() {
    if (stepTwo.style.display === 'flex') {
        document.getElementById('stepOne').style.display="flex";
        document.getElementById('stepTwo').style.display="none";
        document.getElementById('stepThree').style.display="none";
        document.getElementById('bar1').style.backgroundColor="green";
        document.getElementById('bar2').style.backgroundColor="white";
        document.getElementById('back').style.visibility="hidden";
    }
    else {
        document.getElementById('stepOne').style.display="none";
        document.getElementById('stepTwo').style.display="flex";
        document.getElementById('stepThree').style.display="none";
        document.getElementById('bar1').style.backgroundColor="white";
        document.getElementById('bar2').style.backgroundColor="green";
        document.getElementById('bar3').style.backgroundColor="white";
        document.getElementById('back').style.visibility="visible";
    }
}
function sendEvent() {
    hostID = document.getElementById('hostID').value;
    text = document.getElementById('description').value;

/*     const entry = {
        id: hostID,
        title: "test",
        summary: "Professor Dr. Nils Goldschmidt, Vorsitzender der Aktionsgemeinschaft Soziale Marktwirtschaft e. V. beim Boxenstopp",
        description: text,
        lat: 48.36756,
        long: 10.88579,
        date: "26.06.2019",
        daydate: "26",
        day: "Mi., ",
        month: "JUN",
        start: "18:30 Uhr",
        location: "The Box",
        street: "Werner-Heisenberg-Straße 4, ",
        place: "96123 Augsburg",
        "rating": 0,
        "recommend": true
    }
    const jsonString = JSON.stringify(entry, null, 2); */



/*     
    eventDB._putItem()({
        id: 'neu',
        title: 'test'
      }).then(function (response) {
        // handle response
      }).catch(function (err) {
        console.log(err);
      }); */
      
      
  

    var backdrop = document.createElement("div");
    backdrop.classList.add("backdrop");
    var warning = document.createElement("h4");
    warning.innerHTML = "Wir prüfen ihre Anfrage und stellen sie danach online. Ihre Veranstaltung steht ihnen lokal allerdings schon zur Verfügung.";
    warning.classList.add("warning");
    backdrop.append(warning);
    document.getElementById("eventformular").append(backdrop);
    backdrop.onclick = function() {
        location.href = "/events.html";
    }
}

