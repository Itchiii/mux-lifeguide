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
            case 'address': obj[prop] = "address"; break;
            case 'zipCode': obj[prop] = "zip Code"; break;
            case 'openingHours': obj[prop] = '42 Uhr'; break;
            case 'phone': obj[prop] = '000'; break;
            case 'web': obj[prop] = '#'; break;
            case 'owner': obj[prop] = 'May Mustermann'; break;
            case 'rating': obj[prop] = 0; break;
            case 'summary': obj[prop] = "summary"; break;
            case 'recommend': obj[prop] = false; break;
            case 'start': obj[prop] = "start"; break;
            case 'date': obj[prop] = "date"; break;
            case 'daydate': obj[prop] = "daydate"; break;
            case 'day': obj[prop] = "day"; break;
            case 'month': obj[prop] = "month"; break;
            case 'location': obj[prop] = "location"; break;
            case 'street': obj[prop] = "street"; break;
            case 'place': obj[prop] = "place"; break;
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
        address: options.address,
        zipCode: options.zipCode,
        openingHours: options.openingHours,
        phone: options.phone,
        web: options.web,
        owner: options.owner,
        rating: options.rating,
        summary: options.summary,
        recommend: options.recommend,
        start: options.start,
        date: options.date,
        daydate: options.daydate,
        day: options.day,
        month: options.month,
        location: options.location,
        street: options.street,
        place: options.place,
      }).then(function (response) {
        resolve();
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
              address: options.address,
              zipCode: options.zipCode,
              openingHours: options.openingHours,
              phone: options.phone,
              web: options.web,
              owner: options.owner,
              rating: options.rating,
              summary: options.summary,
              recommend: options.recommend,
              start: options.start,
              date: options.date,
              daydate: options.daydate,
              day: options.day,
              month: options.month,
              location: options.location,
              street: options.street,
              place: options.place,
              //_rev is needed at document update
              _rev: doc._rev
            });
          }.bind(this)).then(function(response) {
            resolve();//Success -> Sync to remote
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
          resolve();
        }.bind(blob, this)).catch(function(){

          //ups, something did not work. Document already exits?
          this.localDB.get(id).then(function(doc) {
            this.localDB.putAttachment(id, name, doc._rev, blob, 'image/jpg').then(function(response) {
              this._syncFromLocalToRemote();
              resolve();
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
    return PouchDB.replicate(this.localDB, this.remoteDB, {
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


//if you want to change your local init, comment fetchJson out and setRecommend in.
locationDB._syncFromRemoteToLocal().on('complete', function(info){
  //setRecommend(locationDB);
  fetchJson(locationDB);
}).on('error', function (err) {
  setRecommend(locationDB);
  //fetchJson(locationDB); //for mobile, because you cant access the remote database
});

eventDB._syncFromRemoteToLocal().on('complete', function(info){
  //setRecommend(eventDB);
  fetchJson(eventDB);
}).on('error', function (err) {
    setRecommend(eventDB);
    //fetchJson(eventDB); //for mobile, because you cant access the remote database
});

tourDB._syncFromRemoteToLocal().on('complete', function(info){
  //setRecommend(tourDB);
  fetchJson(tourDB);
}).on('error', function (err) {
    setRecommend(tourDB);
    //fetchJson(tourDB); //for mobile, because you cant access the remote database
});


function fetchJson(database) {
//init from assets (only in development needed)
    switch (database) {
        case locationDB:  initLocations(); break;
        case eventDB: initEvents(); break;
        case tourDB: initTours(); break;
    }

    function initLocations() {
        fetch('./public/js/init.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(myJson) {
                //create an entry for all documents or update it
                for (const i of myJson) {
                    let putItemLocationDB = new Promise(function(resolve, reject){
                        locationDB._putItem(i, resolve, reject);
                    });
                    putItemLocationDB.then(function success(data){
                      let arrayOfPromises = [];
                        if (i.attachments !== undefined && i.attachments.length !== 0) {
                          let a = 0;
                          addImage();
                          function addImage() {
                            let p = new Promise(function(resolve, reject){
                              locationDB._putImage(i.id, i.attachments[a].attachmentFile, i.attachments[a].attachmentName, resolve, reject);
                            }).then(function(){
                              arrayOfPromises.push(p);
                              a++;
                              if (i.attachments[a] !== undefined) {
                                addImage();
                              }
                              else {
                                Promise.all(arrayOfPromises)
                                .then(_ => {
                                  setTipWithJSON(locationDB, i);
                                });
                              }
                            });
                          }
                        }
                    });
                }
            });
    }

    function initEvents() {
        fetch('./public/js/initEvents.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(myJson) {
                //create an entry for all documents or update it
                for (const i of myJson) {
                    let putItemEventDB = new Promise(function(resolve, reject){
                        eventDB._putItem(i, resolve, reject);
                    });
                    putItemEventDB.then(function success(data){
                        if (i.attachment !== undefined && i.attachmentName !== undefined) {
                            let putImageEventDB = new Promise(function(resolve, reject){
                                eventDB._putImage(i.id, i.attachment, i.attachmentName, resolve, reject);
                            });
                            putImageEventDB.then(function success(data) {
                                setTipWithJSON(eventDB, i);
                            });
                        }
                    });
                }
            });
    }

    function initTours() {
        fetch('./public/js/init.json')
            .then(function(response) {
                return response.json();
            })
            .then(function(myJson) {
                //create an entry for all documents or update it
                for (const i of myJson) {

                    let putItemTourDB = new Promise(function(resolve, reject){
                        tourDB._putItem(i, resolve, reject);
                    });
                    putItemTourDB.then(function success(data){
                        if (i.attachment !== undefined && i.attachmentName !== undefined) {
                            let putImageTourDB = new Promise(function(resolve, reject){
                                tourDB._putImage(i.id, i.attachment, i.attachmentName, resolve, reject);
                            });
                            putImageTourDB.then(function success(data) {
                                setTipWithJSON(tourDB, i);
                            });
                        }
                    });
                }
            });
    }
}

