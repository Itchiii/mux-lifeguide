let params = (new URL(document.location)).searchParams;
let iddata = params.get('id');

eventDB._getDoc(iddata).then(function(doc) {

    eventDB._getAttachment(doc._id, Object.keys(doc._attachments)[0]).then(function(blob){
        var url = URL.createObjectURL(blob);
        var articleimg = document.createElement('img');
        articleimg.src = url;
        articleimg.classList.add("articleimg");
        const articleform = document.createElement("div");
        articleform.classList.add("articleform")
        articleform.append(articleimg);
        document.getElementById('article').append(articleform);
    });
    const ausgabe = document.createElement("h1");
    ausgabe.innerHTML = doc.date;
    document.getElementById('article').append(ausgabe);

    }).catch(function (err) {
});

