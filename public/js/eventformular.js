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
var venue;

const wrapper = document.getElementById('wrapperFormular');
const stepOne = document.getElementById('stepOne');
const stepTwo = document.getElementById('stepTwo');
const stepThree = document.getElementById('stepThree');
const bar1 = document.getElementById('bar1');
const bar2 = document.getElementById('bar2');
const bar3 = document.getElementById('bar3');

//check that there is on page one no way back
function checkback() {
    if (wrapper.classList.contains("showStepOne")) {
        document.getElementById('back').style.visibility="hidden";
    }
    else{
        document.getElementById('back').style.visibility="visible";
    }
}
checkback();

function nextStep1() {
    wrapper.classList.remove('showStepOne');
    bar1.classList.remove('greenbar');
    wrapper.classList.add('showStepTwo');
    bar2.classList.add('greenbar');
    checkback();
}
function nextStep2() {
    wrapper.classList.remove('showStepTwo');
    bar2.classList.remove('greenbar');
    wrapper.classList.add('showStepThree');
    bar3.classList.add('greenbar');
    checkback();
}
function back() {
    console.log(wrapper.classList);
    if (wrapper.classList.contains("showStepTwo")) {
        wrapper.classList.remove('showStepTwo');
        bar2.classList.remove('greenbar');
        wrapper.classList.add('showStepOne');
        bar1.classList.add('greenbar');
    }
    if (wrapper.classList.contains('showStepThree')) {
        wrapper.classList.remove('showStepThree');
        bar3.classList.remove('greenbar');
        wrapper.classList.add('showStepTwo');
        bar2.classList.add('greenbar');
    }
    checkback();
}
function sendEvent() {
    hostID = document.getElementById('hostID').value;
    text = document.getElementById('description').value;
    day = document.getElementById('day').value;
    daydate = document.getElementById('daydate').value;
    month = document.getElementById('month').value;
    time = document.getElementById('time').value;
    city = document.getElementById('city').value;
    adress = document.getElementById('adress').value;
    titleEvent = document.getElementById('titleEvent').value;
    subject = document.getElementById('subject').value;
    venue = document.getElementById('venue').value;

    let putItemInEvents = new Promise(function(resolve, reject){
        eventDB._putItem({
          id: hostID,
          title: titleEvent,
          summary: subject,
          description: text,
          lat: 48.36756,
          long: 10.88579,
          day: day,
        daydate: daydate,
        month: month,
        start: time,
        place: city,
        street: adress,
        location: venue
        }, resolve, reject);
      });
      putItemInEvents.then(() => {
    });
      
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

