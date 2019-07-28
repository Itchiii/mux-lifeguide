# Lifeguide

*A prototype for a Progressive Web App for the map and calendar function of the sustainability magazine Lifeguide Augsburg.*

A project at the University of Applied Science Brandenburg in Digital Media.

![Preview of Lifeguide](https://raw.githubusercontent.com/Itchiii/mux-lifeguide/master/public/assets/images/preview.png)
______
##### Technologies / Frameworks / Libraries used in project:
* [npm/nodeJS](https://nodejs.org/en/)
* [ServiceWorkerAPI](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
* [PouchDB](https://pouchdb.com/)
* [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/api/)
* [ics.js](https://github.com/nwcell/ics.js/)
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

#### `Step 6` - initialize data

To load new data (important at the very first start), `fetchJson` must be initialized in db.js (row 291)

#### `Step 7` - open application on mobile

The ServiceWorker and the WebShareAPI need a secure connection to server. Localhost is considered secure but can not be opened remotely. You can use [ngrok](https://ngrok.com/) to tunnel localhost or follow [these](https://stackoverflow.com/questions/34160509/options-for-testing-service-workers-via-http#answer-43426714) instructions.

_____

In browser, open [http://localhost:8000](http://localhost:8000)

To open your remote database based on pouchedb-server: [http://localhost:5984/_utils/](http://localhost:5984/_utils/)

Note: To get the map tiles and use Mapbox API, you need a API-Token of Mapbox