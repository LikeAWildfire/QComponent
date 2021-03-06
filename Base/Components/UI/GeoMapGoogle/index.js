/**
 * Created by nikita on 29.08.16.
 */

var Property = require('../../../Property');
var Primitive = require('../Primitives');
var UIComponent = require('../../UIComponent');
var TextMarker = require('./TextMarker');
var charByNumber = require('./charByNumber');
var arrToLanLng = require('./arrToLanLng');
var minMax = require('./minMax');
var loadScript = require('./loadScript');
// require('./MapLabel');

function getApiByKey(apiKey) {
  return (
    'https://maps.googleapis.com/maps/api/js?key=' +
    apiKey +
    '&language=en' +
    '&libraries=places'
  )
}

module.exports = UIComponent.extend('GeoMapGoogle', {
  createEl: function() {
    var self = this;
    console.log('GeoMapGoogle createEl');

    this.el = UIComponent.document.createElement('div');
    this.el.id = this.id;

    // nikita's api key
    var apiKey = 'AIzaSyDgxDWQ9w-4tEtfV9dnACRN_eUBAp_OaBA';
    //
    loadScript({
      src: getApiByKey(apiKey),
      //
      globalName: 'google.maps',
      //
      onload: function() {
        console.log('GeoMapGoogle !todo onloadActions! loadScript.onload', google.maps);

        // TODO
        // make normal module
        // do only after first load
        require('./MapLabel');
        self._renderEl();
        self.set('ready', true);
      }
    });
  },

  _renderEl() {
    console.log('GeoMapGoogle _renderEl');
    var self = this;

    // Temporaly commented to fix error
    // Uncaught TypeError: Cannot read property 'offsetWidth' of null

    var elem = document.getElementById(self.id);
    var center = self.get('center');
    //
    self.gmap = new google.maps.Map(elem, {
      center: arrToLanLng(center),
      zoom: self.get('zoom'),

      // TODO
      // make alternatives
      // controls: ['zoomControl', 'searchControl']
    });

    self.mapApi = google.maps;
    self.directionsService = new google.maps.DirectionsService;
    self.directionsDisplay = new google.maps.DirectionsRenderer({
      // draggable: true,
      map: self.gmap,
      preserveViewport: true
    });
    // directionsDisplay.setOptions({ preserveViewport: true });

    self._makeSearchBox(self.gmap);

    self._createHome();
    self._createPins();

    self.gmap.addListener('dragend', function() {
      // var center = self.get('center');
      // self.set('center', center);

      if(!self._handlingCenterEvent) {
        var center = self.gmap.getCenter();
        var centerArr = [center.lat(), center.lng()];
        //
        self.set('center', centerArr);
      };
    });
  },

  // get: function (key, value) {
  //   console.log('gmap get '+ key, value);
  //   if(this.mapApi && this.gmap) {
  //     var center = this.gmap.getCenter();
  //     //
  //     return [center.lat(), center.lng()];
  //   }
  //   else return value;
  // },

  _makeSearchBox: function(map) {
    console.log('GeoMapGoogle _makeSearchBox');

    var input = UIComponent.document.createElement('input');
    input.type = "text";

    var style = [
      input.getAttribute('style'),
      "padding: 8px",
      "margin: 8px",
      "font-family: Roboto,Arial,sans-serif",
      "font-size: 15px",
      "box-shadow: rgba(0, 0, 0, 0.298039) 0px 1px 4px -1px",
      "border-radius: 2px"
    ].join('; ');
    input.setAttribute('style', style);

    var searchBox = new google.maps.places.SearchBox(input);
    // var searchBox = new google.maps.places.Autocomplete(input);
    map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener('bounds_changed', function() {
      searchBox.setBounds(map.getBounds());
    });

    var markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener('places_changed', function () {
      var places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach(function(marker) {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      var bounds = new google.maps.LatLngBounds();
      places.forEach(function(place) {
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        // Create a marker for each place.
        markers.push(new google.maps.Marker({
          map: map,
          icon: icon,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  },

  _createHome: function() {
    console.log('GeoMapGoogle _createHome');

    var homeData = this.get('home');
    //
    if(homeData) {
      this.home = TextMarker.create({
        position: arrToLanLng(homeData),
        map: this.gmap,
        label: 'A',
        text: 'You are here'
      });
    }
  },

  _removeHome: function() {
    console.log('GeoMapGoogle _removeHome');

    if(this.home)
      TextMarker.remove(this.home);
  },

  _createPins: function() {
    console.log('GeoMapGoogle _createPins');

    var self = this;

    var pinsData = this.get('pins');
    //
    if(pinsData) {
      self.pins = pinsData
      .filter(function(options) { return options.coords && options.name; })
      .map(function(options, index) {
        var name    = options.name;
        var coords  = options.coords;

        var icon    = options.icon;
        var route   = options.route;
        var moving  = options.moving;

        // name: 'Такси',
        // icon: "https://maps.gstatic.com/mapfiles/ms2/micons/cabs.png",
        // coords: [55.751617, 37.617887],
        // route: [55.794425,37.587836],
        // moving: true

        console.log('pin options', options);

        var textMarker = TextMarker.create({
          position: arrToLanLng(coords),
          map: self.gmap,
          label: charByNumber(index),
          text: name
        });

        // if(route) {
        //   self.makeRoute(coords, route);
        // }

        return textMarker;
      });
    }
  },

  _removePins: function() {
    console.log('GeoMapGoogle _removePins');

    if(this.pins)
      this.pins.forEach(function(pin) {
        TextMarker.remove(pin);
      });
  },

  makeRoute: function(from, to) {
      console.log('GeoMapGoogle makeRoute');

      if (!this.mapApi) return;

      var self = this;

      this.route = this.directionsService.route({
        origin: arrToLanLng(from),
        destination: arrToLanLng(to),
        travelMode: google.maps.TravelMode.TRANSIT,
        // provideRouteAlternatives: true, // DOESNT work
        optimizeWaypoints: true
      }, function(response, status) {
        if (status === google.maps.DirectionsStatus.OK) {

          // Draw only current route
          self.directionsDisplay.setDirections(response);

          // this.route
          // pin: {marker, route}

          var newMoveList = self._updateMoveList(self);
          self.set('moveList', newMoveList);
        } else {
          console.error('Directions request failed due to ' + status);
          self.set('moveList', []);
        }
      });
  },

  _updateMoveList: function() {
    console.log('GeoMapGoogle _updateMoveList');

    // Route connects start and end point
    var firstRoute = this.directionsDisplay.directions.routes[0];
    // Necessary point of route split it to legs
    // We have only 2 points === 1 leg
    var firstLeg = firstRoute.legs[0];
    // Steps are route moving guides
    var moveList = firstLeg.steps.map(function(step) {
      var instructions = step.instructions;
      var durationText = step.duration.text;
      return [instructions, durationText].join('. ')
    });

    return moveList;
  },

  _prop: {
    ready: new Property('Boolean', {
        description: 'True if GoogleMap api ready'
      }, {
        get: Property.defaultGetter,
        set: function(key, value) {
          console.log('GeoMapGoogle set '+ key);
          return value;
        }
      }, false
    ),

    value: new Property.generate.proxy('ready'),

    zoom: new Property('Number',
        {
            description: 'Map zoom level (setZoom for gmap)',
            get: function(key, value) {
                // console.log('get', this);
                if (this.mapApi && this.gmap)
                    return this.gmap.getZoom();
                else return value;
            },
            set: function(key, value) {
                // console.log('set', this);
                if (this.mapApi && this.gmap) {
                    var zoomFixed = minMax(value, 0, 18);
                    this.gmap.setZoom(zoomFixed);
                    return zoomFixed;
                }
            },
            defaultValue: 11
        }
    ),

    pins: new Property('Array', {
        description: 'Mark on map'
      }, {
        get: Property.defaultGetter,
        set: function(key, value) {
          // CHANGE to update pins on module load
          //
          if (this.mapApi) {
            this._removePins(this);
            this._createPins(this);
          }
        }
      }
    ),
    home: new Property('Array', {description: 'You are here point'}, {
      get: Property.defaultGetter,
      set: function(key, value) {
        if (this.mapApi) {
          this._removeHome(this);
          this._createHome(this);
        }
      }
    }),
    moveList: new Property('Array', {}, {
      get: Property.defaultGetter,
      set: function() {}
    }, []),
    center: new Property('Array', {description: 'Map viewport center position'}, {
        get: Property.defaultGetter,
        set: function (key, value) {
          console.log('gmap set '+ key, value);
          if(this.mapApi && this.gmap) {
            var center = arrToLanLng(value);
            //
            this._handlingCenterEvent = true;

            this.gmap.setCenter(center);
            this._handlingCenterEvent = false;
          }
        },
    }, [55.76, 37.64]),
  }
});
