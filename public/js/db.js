class Database {
  constructor(name) {
    this.name = name;
    this.remoteDB = new PouchDB(`http://localhost:5984/${this.name}`);
    this.localDB = new PouchDB(name);

    //remote database will be initialized only with first use
    this.infoRemote.then(function(info) {
      this._syncFromRemoteToLocal();
    }.bind(this));
  }

  //get info about remote database
  get infoRemote() {
    return this.remoteDB.info()
  }

  //get info about local database
  get infoLocal() {
    return this.localDB.info()
  }

  /* Put an item in local database with given parameter
   * and check if item already exits
  */
  _putItem(params, resolve, reject) {

    //add default values for unspedified parameters
    var handler = {
      get: function(obj, prop) {
        if (prop in obj) {
          return obj[prop];
        }
        else {
          switch (prop) {
            case 'id': obj[prop] = makeid(10); break;
            case 'title': obj[prop] = "title"; break;
            case 'description': obj[prop] = "description"; break;
            case 'lat': obj[prop] = 0; break;
            case 'long': obj[prop] = 0; break;
            case 'rating': obj[prop] = 0; break;
            case 'summary': obj[prop] = "summary"; break;
            case 'recommend': obj[prop] = false; break;
            default: obj[prop] = null; break;
          }
        }
        return obj[prop];
      }
    };

    let options = new Proxy(params, handler);

    //add a new document
    this.localDB
      .put({
        _id: options.id.toString(),
        title: options.title,
        description: options.description,
        lat: options.lat,
        long: options.long,
        rating: options.rating,
        summary: options.summary,
        recommend: options.recommend
      }).then(function (response) {
        resolve("hello world")
        //Success -> Sync to remote
        this._syncFromLocalToRemote();
      }.bind(this)).catch(function () {

        //ups, something did not work. Document already exits?
        this.localDB.get(options.id.toString()).then(function(doc) {
            this.localDB.put({
              _id: options.id.toString(),
              title: options.title,
              description: options.description,
              lat: options.lat,
              long: options.long,
              rating: options.rating,
              summary: options.summary,
              recommend: options.recommend,
              //_rev is needed at document update
              _rev: doc._rev
            });
          }.bind(this)).then(function(response) {
            resolve("hello world2")//Success -> Sync to remote
            this._syncFromLocalToRemote();
          }.bind(this)).catch(function (err) {
            //Nope, here is an error
            console.error(err);
          });
      }.bind(this));
  }

  /* Put an image to a document in local database with given parameter
   * path must be defined!
   TODO: change path, if user upload an image
  */
  _putImage(id, path, name, resolve, reject) {
    fetch(path)
      .then((response) => response.blob())
      .then((blob) => {
        this.localDB.putAttachment(id, name, blob, 'image/jpg').then(function () {
          //Success -> Sync to remote
          this._syncFromLocalToRemote();
          resolve("hello world01")
        }.bind(blob, this)).catch(function(){

          //ups, something did not work. Document already exits?
          this.localDB.get(id).then(function(doc) {
            this.localDB.putAttachment(id, name, doc._rev, blob, 'image/jpg').then(function(response) {
              this._syncFromLocalToRemote();
              resolve("hello world02");
            }.bind(this, blob)).catch(function (err) {
              //Nope, here is an error
              console.error(err);
            });
          }.bind(this));
        }.bind(this))
      });
  }

  //get all documents
  get allDocsOfLocalDB() {
    return this.localDB.allDocs({
      include_docs: true,
      attachments: true
    });
  }

  //get a specific document with given id
  _getDoc(id) {
    return this.localDB.get(id);
  }

  //get a specific attachment with given id and image name
  _getAttachment(id, image) {
    return this.localDB.getAttachment(id, image);
  }

  _getDocByFind(field, param) {
    return this.localDB.createIndex({
      index: {fields: [field]}
    }).then(function(){
      return this.localDB.find({
        selector: {
          [field]: param
        }
      })
    }.bind(this));
  }

  /*sync from local to remote database, 
   *checkpoint if needed: [URL]
  */
  _syncFromLocalToRemote() {
    var sync = PouchDB.replicate(this.localDB, this.remoteDB, {
      live: false,
      retry: false,
      checkpoint: 'source'
    }).on('change', function (info) {
      // handle change
    }).on('paused', function (err) {
      // replication paused (e.g. replication up to date, user went offline)
    }).on('active', function () {
      // replicate resumed (e.g. new changes replicating, user went back online)
    }).on('denied', function (err) {
      // a document failed to replicate (e.g. due to permissions)
    }).on('complete', function (info) {
      // handle complete
    }).on('error', function (err) {
      //console.error("boo, we hit an error!", err);
    });
  }

  /*sync from remote to local database, 
   *checkpoint if needed: [URL]
  */
  _syncFromRemoteToLocal() {
    return PouchDB.replicate(this.remoteDB, this.localDB, {
      live: false,
      retry: false,
      checkpoint: 'target'
    }).on('change', function (info) {
      // handle change
    }).on('paused', function (err) {
      // replication paused (e.g. replication up to date, user went offline)
    }).on('active', function () {
      // replicate resumed (e.g. new changes replicating, user went back online)
    }).on('denied', function (err) {
      // a document failed to replicate (e.g. due to permissions)
    }).on('complete', function (info) {
      // handle complete
    }).on('error', function (err) {
      //console.error("boo, we hit an error!", err);
    });
  }
}

//function to make a random id, if id not specific
//https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript#answer-1349426
function makeid(length) {
  var result           = '';
  var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for ( var i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


//init location and event database
const locationDB = new Database('locations');
const eventDB = new Database('events');
const tourDB = new Database('tours');


//if you want change your local init, comment fetchJson out and setRecommend in.
locationDB._syncFromRemoteToLocal().on('complete', function(info){
  setRecommend(locationDB);
  //fetchJson();
}).on('error', function (err) {
  setRecommend(locationDB);
  //fetchJson(); //for mobile, because you cant access the remote database
});

eventDB._syncFromRemoteToLocal().on('complete', function(info){
  setRecommend(eventDB);
});

tourDB._syncFromRemoteToLocal().on('complete', function(info){
  setRecommend(tourDB);
});


function fetchJson() {
//init from assets (only in development needed)
fetch('./public/js/init.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    //create an entry for all documents or update it
    for (const i of myJson) {
      let putItemEventDB = new Promise(function(resolve, reject){
        eventDB._putItem(i, resolve, reject);
      })
      putItemEventDB.then(function success(data){
        if (i.attachment !== undefined && i.attachmentName !== undefined) {
          let putImageEventDB = new Promise(function(resolve, reject){
            eventDB._putImage(i.id, i.attachment, i.attachmentName, resolve, reject);
          })
          putImageEventDB.then(function success(data) {
            setTipWithJSON(eventDB, i);
          });
        }
      })

      let putItemTourDB = new Promise(function(resolve, reject){
        tourDB._putItem(i, resolve, reject);
      })
      putItemTourDB.then(function success(data){
        if (i.attachment !== undefined && i.attachmentName !== undefined) {
          let putImageTourDB = new Promise(function(resolve, reject){
            tourDB._putImage(i.id, i.attachment, i.attachmentName, resolve, reject);
          })
          putImageTourDB.then(function success(data) {
            setTipWithJSON(tourDB, i);
          });
        }
      })

      let putItemLocationDB = new Promise(function(resolve, reject){
        locationDB._putItem(i, resolve, reject);
      })
      putItemLocationDB.then(function success(data){
        if (i.attachment !== undefined && i.attachmentName !== undefined) {
          let putImageLocationDB = new Promise(function(resolve, reject){
            locationDB._putImage(i.id, i.attachment, i.attachmentName, resolve, reject);
          })
          putImageLocationDB.then(function success(data) {
            setTipWithJSON(locationDB, i);
          });
        }
      })
    }
  });
}

//function to get database entrys appear on events.html
locationDB.allDocsOfLocalDB.then(function(result) {
  for (const entry of result.rows) {
    const newDiv = document.createElement("div");
    const newH = document.createElement("h1");
    const newP = document.createElement("p");
    newH.innerHTML = entry.doc.title;
    newP.innerHTML = entry.doc.description;
    newDiv.append(newH);
    newDiv.append(newP);
    document.getElementById('events').append(newDiv);
    if (entry.doc._attachments !== undefined) {
      locationDB._getAttachment(entry.doc._id, Object.keys(entry.doc._attachments)[0]).then(function(blob){
        console.log("test");
        var url = URL.createObjectURL(blob);
        var img = document.createElement('img');
        img.src = url;
        document.body.appendChild(img);
      });
    }
  }
});