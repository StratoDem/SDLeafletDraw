'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _draw = require('../../draw');

var _draw2 = _interopRequireDefault(_draw);

var _index = require('../../ext/index');

var _Feature2 = require('./Feature');

var _Feature3 = _interopRequireDefault(_Feature2);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_MARKER_OPTIONS = {
  icon: new _leaflet2.default.Icon.Default(),
  repeatMode: false,
  zIndexOffset: 2000 // This should be > than the highest z-index any markers
}; /** 
    * StratoDem Analytics : Draw.Marker
    * Principal Author(s) : Michael Clawar
    * Secondary Author(s) :
    * Description :
    *
    *  (c) 2016- StratoDem Analytics, LLC
    *  All Rights Reserved
    */

var Marker = function (_Feature) {
  (0, _inherits3.default)(Marker, _Feature);

  function Marker() {
    (0, _classCallCheck3.default)(this, Marker);
    return (0, _possibleConstructorReturn3.default)(this, (Marker.__proto__ || Object.getPrototypeOf(Marker)).apply(this, arguments));
  }

  (0, _createClass3.default)(Marker, [{
    key: 'initialize',
    value: function initialize(map, options) {
      // Save the type so super can fire, need to do this as cannot do this.TYPE :(
      this.type = Marker.TYPE;
      (0, _get3.default)(Marker.prototype.__proto__ || Object.getPrototypeOf(Marker.prototype), 'initialize', this).call(this, map, (0, _extends3.default)({}, Marker.options, options));
    }

    /** Add listener hooks to this handler **/

  }, {
    key: 'addHooks',
    value: function addHooks() {
      (0, _get3.default)(Marker.prototype.__proto__ || Object.getPrototypeOf(Marker.prototype), 'addHooks', this).call(this);

      if (this._map) {
        this._tooltip.updateContent({ text: _draw2.default.draw.handlers.marker.tooltip.start });

        // Same mouseMarker as in Draw.Polyline
        if (!this._mouseMarker) {
          this._mouseMarker = _leaflet2.default.marker(this._map.getCenter(), {
            icon: _leaflet2.default.divIcon({
              className: 'leaflet-mouse-marker',
              iconAnchor: [20, 20],
              iconSize: [40, 40]
            }),
            opacity: 0,
            zIndexOffset: this.options.zIndexOffset
          });
        }

        this._mouseMarker.on('click', this._onClick, this).addTo(this._map);

        this._map.on('mousemove', this._onMouseMove, this);
        this._map.on('click', this._onTouch, this);
      }
    }

    /** Remove listener hooks from this handler **/

  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      (0, _get3.default)(Marker.prototype.__proto__ || Object.getPrototypeOf(Marker.prototype), 'removeHooks', this).call(this);

      if (this._map) {
        if (this._marker) {
          this._marker.off('click', this._onClick, this);
          this._map.off('click', this._onClick, this).off('click', this._onTouch, this).removeLayer(this._marker);
          delete this._marker;
        }

        this._mouseMarker.off('click', this._onClick, this);
        this._map.removeLayer(this._mouseMarker);
        delete this._mouseMarker;

        this._map.off('mousemove', this._onMouseMove, this);
      }
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var latlng = event.latlng;


      this._tooltip.updatePosition(latlng);
      this._mouseMarker.setLatLng(latlng);

      if (!this._marker) {
        this._marker = new _leaflet2.default.Marker(latlng, {
          icon: this.options.icon,
          zIndexOffset: this.options.zIndexOffset
        });
        // Bind to both marker and map to make sure we get the click event.
        this._marker.on('click', this._onClick, this);
        this._map.on('click', this._onClick, this).addLayer(this._marker);
      } else {
        this._marker.setLatLng(this._mouseMarker.getLatLng());
      }
    }
  }, {
    key: '_onClick',
    value: function _onClick() {
      this._fireCreatedEvent();

      this.disable();
      if (this.options.repeatMode) this.enable();
    }

    /** Handle touch event **/

  }, {
    key: '_onTouch',
    value: function _onTouch(event) {
      this._onMouseMove(event); // Creates & places marker
      this._onClick(); // Permanently places marker and ends interaction
    }
  }, {
    key: '_fireCreatedEvent',
    value: function _fireCreatedEvent() {
      var marker = new _index.TouchMarker(this._marker.getLatLng(), { icon: this.options.icon });
      (0, _get3.default)(Marker.prototype.__proto__ || Object.getPrototypeOf(Marker.prototype), '_fireCreatedEvent', this).call(this, marker);
    }
  }]);
  return Marker;
}(_Feature3.default);

Marker.options = DEFAULT_MARKER_OPTIONS;
Marker.type = _constants.TYPE_MARKER;
exports.default = Marker;

//# sourceMappingURL=Marker.js.map