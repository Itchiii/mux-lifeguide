# Lifeguide

*A prototype for a Progressive Web App for the map and calendar function of the sustainability magazine Lifeguide Augsburg.*

A project at the University of Applied Science Brandenburg in Digital Media.
______
##### Technologies / Frameworks / Libraries used in project:
* [npm/nodeJS](https://nodejs.org/en/)
* [ServiceWorkerAPI](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
* [PouchDB](https://pouchdb.com/)
* [Leaflet](https://leafletjs.com/)
* [Slideout.js](https://slideout.js.org/)
* [SCSS](https://sass-lang.com/)
* [Gulp](https://gulpjs.com/)
* [Git](https://git-scm.com/)
_____
### Installation

#### `Step 1` - navigate to your destination folder

#### `Step 2` - clone the repo
  
```bash
$ git clone https://github.com/Itchiii/mux-lifeguide.git
```

#### `Step 3` - cd in the repo

```bash
$ cd mux-lifeguide
```

#### `Step 4` - install dependencies

```bash
$ npm install
```

#### `Step 5` - run application

```bash
$ npm start
```

#### `Step 6` - open application on mobile

A ServiceWorker and a the WebShareAPI need a secure connection to server. Localhost is considered secure but can not be opened remotely. You can use [ngrok](https://ngrok.com/) to tunnel localhost or follow [these](https://stackoverflow.com/questions/34160509/options-for-testing-service-workers-via-http#answer-43426714) instruction.

_____

In browser, open [http://localhost:8000](http://localhost:8000)

To open your remote database based on pouchedb-server: [http://localhost:5984/_utils/](http://localhost:5984/_utils/)

Note: To get the map tiles, you need a API Token of Mapbox or you have to change the tiles server e.g http://{s}.tile.osm.org/{z}/{x}/{y}{r}.png