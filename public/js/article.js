let params = (new URL(document.location)).searchParams;
let iddata = params.get('id');


const ausgabe = document.createElement("h1");
//ausgabe.innerHTML = entry.doc.title;
ausgabe.innerHTML = iddata;
document.getElementById('article').append(ausgabe);


