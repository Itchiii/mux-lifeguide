class Database {
  constructor(name) {
    this.name = name;
    this.remoteDB = new PouchDB(`http://localhost:5984/${this.name}`);
    this.localDB = new PouchDB(name);

    this.handlePreload();
  }

  handlePreload() {
    // https://pouchdb.com/2016/04/28/prebuilt-databases-with-pouchdb.html
    // check a local document to see if we've already preloaded
    this.remoteDB.get('_local/preloaded').then(function (doc, that) {
    }.bind(this)).catch(function (err) {
      if (err.name !== 'not_found') {
        throw err;
      }
      // we got a 404, so the local document doesn't exist. so let's preload!
      return this.remoteDB.load(`${this.name}.txt`).then(function () {
        // create the local document to note that we've preloaded
        return this.remoteDB.put({_id: '_local/preloaded'});
      }.bind(this));
    }.bind(this)).then(function () {
      return this.remoteDB.allDocs({include_docs: true});
    }.bind(this)).then(function (res) {
    }.bind(this)).catch(console.log.bind(console));
  }

  get infoRemote() {
    this.remoteDB
      .info()
      .then(function (info) {
        return console.log(info);
      })
  }

  get infoLocal() {
    this.localDB
      .info()
      .then(function (info) {
        return console.log(info);
      })
  }

  _putItem(id, desctiption) {
    //put an entry to movies
    this.localDB
      .put({
        _id: `location-${id}`,
        title: desctiption,
        director: desctiption
      }).then(function (response) {
        //Success
        this._syncFromLocalToRemote();
      }.bind(this)).catch(function (err) {
        console.warn("Error", err)
      });
  }

  _putImage() {
    //just a test function
    fetch('baby-cat.jpg')
      .then((response) => response.blob())
      .then((blob) => {
        this.localDB.putAttachment('meowth', 'meowth.png', blob, 'image/jpg').then(function () {
          console.log(blob);
          const imageUrl = URL.createObjectURL(blob);
          const img = document.querySelector('img');
          img.addEventListener('load', () => URL.revokeObjectURL(imageUrl));
          document.querySelector('img').src = imageUrl;
        }.bind(blob)).catch(function(){
          console.log("ah");
        })
      });
  }

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
      console.console.warn("boo, we hit an error!", err);
    });
  }
}



const locationDB = new Database('locations');
//locationDB.infoLocal;
locationDB.infoRemote;
locationDB._putItem('test5', 'test');
locationDB._putImage();



const eventDB = new Database('events');
eventDB.infoRemote;