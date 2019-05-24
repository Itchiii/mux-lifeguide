//create a remote database named kittens
var remoteDB = new PouchDB('http://localhost:5984/kittens');

//db should be empty
remoteDB
 .info()
 .then(function (info) {
   console.log(info);
 })

//create a local database named movies
var localDB = new PouchDB('Movies');

//put an entry to movies
localDB
  .put({
    _id: 'tgd',
    title: 'The Great Dictator',
    director: '	Charlie Chaplin'
  }).then(function (response) {
    console.log("Success", response)
  }).then(function (err) {
    console.log("Error", err)
  })

 //keeps syncing changes as they occur
 localDB.sync(remoteDB, {live: true}).on('complete', function () {

  //kittens should now contain a movie
  remoteDB
  .info()
  .then(function (info) {
    console.log(info);
  })
}).on('error', function (err) {
  console.log("boo, we hit an error!");
});