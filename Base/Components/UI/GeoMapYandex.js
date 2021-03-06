/**
 * Created by ravenor on 13.07.16.
 */

var Property = require('../../Property');
var Primitive = require('./Primitives');
var UIComponent = require('../UIComponent');
var loadScript = require('./GeoMapGoogle/loadScript');

module.exports = UIComponent.extend('GeoMapYandex', {
    createEl: function () {
        var self = this;

        this.el = UIComponent.document.createElement('div');
        this.el.id = this.id;

        var script = document.createElement("script");
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=en_US';
        document.head.appendChild(script);

        loadScript({
          src: 'https://api-maps.yandex.ru/2.1/?lang=en_US',
          //
          globalName: 'ymaps',
          //
          onload: function() {
            ymaps.ready(function () {
                console.log('GeoMapYandex onload');

                self._renderEl();
                self.set('ready', true);

                window.m = self.ymap;
            });
          }
        });
    },

    _renderEl() {
      console.log('GeoMapYandex _renderEl');
      var self = this;

      self.mapApi = ymaps;
      var center = self.get('center');

      console.log("GeoMapYandex center", center);
      self.ymap = new ymaps.Map(self.id, {
          center: center,
          zoom: self.get('zoom'),
          controls: ['zoomControl', 'searchControl']
      });

      self.pins = new ymaps.GeoObjectCollection(null, {
          preset: 'islands#blueCircleDotIconWithCaption'
      });
      self.home = new ymaps.GeoObjectCollection(null, {
          preset: 'islands#redCircleDotIconWithCaption'
      });

      self._createHome();
      self._createPins();
      self.ymap.geoObjects.add(self.pins).add(self.home);

      self.ymap.events.add('boundschange', function() {
        if(!self._handlingCenterEvent) {
          var center = self.ymap.getCenter();
          //
          self.set('center', center);
        };
      });
    },

    makeRoute:function(from, to) {
        if (!this.mapApi) return;

        var self = this;

        self.ymap.geoObjects.remove(this.route);

        self.mapApi.route(
            [from, to],
            {routingMode: 'masstransit', multiRoute: true}
        ).done(function (route) {
                //self.mapApi.route({referencePoints:[from,to],params:{routingMode: 'masstransit'}}).then(function(route){
                self.route = route;
                self.ymap.geoObjects.add(self.route);

                // Was binded one more time in every method call
                // route.events.add('activeroutechange',self._updateMoveList);
                self._updateMoveList();
            });
    },

    _updateMoveList: function() {
        var way, segments, moveList = [],
            tempRoute = this.route.getActiveRoute();

        for (var i = 0; i < tempRoute.getPaths().getLength(); i++) {
            way = tempRoute.getPaths().get(i);
            segments = way.getSegments();
            for (var j = 0; j < segments.getLength(); j++) {
                var segment = segments.get(j);
                moveList.push(segment.properties.get('text'));
            }
        }

        this.set('moveList', moveList);
    },

    _createHome: function() {
      var homeData = this.get('home');
      //
      if(homeData && this.home) {
        this.home.add(
          new ymaps.Placemark(homeData, { iconCaption: 'You are here' })
        );
      }

    },

    _removeHome: function() {
      if(this.home)
        this.home.removeAll();
    },

    _createPins: function() {
      var self = this;

      var pinsData = this.get('pins');
      //
      if(pinsData && this.pins) {
        for (var i = 0; i < pinsData.length; i++) {
          var p = pinsData[i];
          self.pins.add(
            new ymaps.Placemark(p.coords, {
              iconCaption: p.name
            })
          );
        }
      }
    },

    _removePins: function() {
      if(this.pins)
        this.pins.removeAll();
    },

    _prop: {
        ready: new Property('Boolean', {description: 'True if YMap api ready'}, {
            get: function (key, value) {
              console.log('ymap '+key+' get', value);
              return value;
            },
            set: function (key, value) {
              console.log('ymap '+key+' set', value);
            }
        }, false),

        zoom: new Property('Number', {description: 'Map zoom level (setZoom for ymap)'}, {
            get: Property.defaultGetter,
            set: function (key, value) {
                if (value > 18)
                    value = 18;
                if (value < 0)
                    value = 0;

                if (this.ymap)
                    this.ymap.setZoom(value, {duration: 200});

                return value;
            }
        }, 11),

        pins: new Property('Array', {description: 'Mark on map'}, {
            get: Property.defaultGetter,
            set: function (key, value) {
                if (this.mapApi) {
                    this._removePins(this);
                    this._createPins(this);
                }
            }
        }),
        home: new Property('Array', {description: 'You are here point'}, {
            get: Property.defaultGetter,
            set: function (key, value) {
                if (this.mapApi)
                    this._removeHome(this);
                    this._createHome(this);
            }
        }),
        moveList: new Property('Array',{},{
            get: Property.defaultGetter,
            set: function(){}
        },[]),

        center: new Property('Array', {description: 'Map viewport center position'}, {
            get: Property.defaultGetter,
            set: function (key, value) {
              console.log('ymap set '+ key, value);

              if(this.mapApi) {
                this._handlingCenterEvent = true;

                this.ymap.setCenter(value);
                this._handlingCenterEvent = false;
              }
            },
        }, [55.76, 37.64]),
    }
});
