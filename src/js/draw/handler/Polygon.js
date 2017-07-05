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

var _Polyline2 = require('./Polyline');

var _Polyline3 = _interopRequireDefault(_Polyline2);

var _constants = require('./constants');

var _index = require('../../ext/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_POLYGON_OPTIONS = {
  showArea: false,
  showLength: false,
  shapeOptions: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: true,
    fillColor: null, // same as color by default
    fillOpacity: 0.2,
    clickable: true
  },
  // Whether to use the metric measurement system (truthy) or not (falsy).
  // Also defines the units to use for the metric system as an array of
  // strings (e.g. `['ha', 'm']`).
  metric: true,
  feet: true, // When not metric, to use feet instead of yards for display.
  nautic: false, // When not metric, not feet use nautic mile for display
  // Defines the precision for each type of unit (e.g. {km: 2, ft: 0}
  precision: {}
}; /** 
    * StratoDem Analytics : Polygon
    * Principal Author(s) : Michael Clawar
    * Secondary Author(s) :
    * Description :
    *
    *  (c) 2016- StratoDem Analytics, LLC
    *  All Rights Reserved
    */

var Polygon = function (_Polyline) {
  (0, _inherits3.default)(Polygon, _Polyline);

  function Polygon() {
    (0, _classCallCheck3.default)(this, Polygon);
    return (0, _possibleConstructorReturn3.default)(this, (Polygon.__proto__ || Object.getPrototypeOf(Polygon)).apply(this, arguments));
  }

  (0, _createClass3.default)(Polygon, [{
    key: 'initialize',
    value: function initialize(map, options) {
      (0, _get3.default)(Polygon.prototype.__proto__ || Object.getPrototypeOf(Polygon.prototype), 'initialize', this).call(this, map, (0, _extends3.default)({}, Polygon.options, options, {
        drawError: (0, _extends3.default)({}, Polygon.drawError, typeof options.drawError !== 'undefined' ? options.drawError : {})
      }));

      this.Poly = Polygon.Poly;
      // Save the type so super can fire, need to do this as cannot do this.TYPE :(
      this.type = Polygon.TYPE;
    }
  }, {
    key: '_updateFinishHandler',
    value: function _updateFinishHandler() {
      var markerCount = this._markers.length;

      // The first marker should have a click handler to close the polygon
      if (markerCount === 1) this._markers[0].on('click', this._finishShape, this);

      // Add and update the double click handler
      if (markerCount > 2) {
        this._markers[markerCount - 1].on('dblclick', this._finishShape, this);
        // Only need to remove handler if has been added before
        if (markerCount > 3) this._markers[markerCount - 2].off('dblclick', this._finishShape, this);
      }
    }
  }, {
    key: '_getTooltipText',
    value: function _getTooltipText() {
      var text = void 0;
      var subtext = void 0;

      if (this._markers.length === 0) {
        text = _draw2.default.draw.handlers.polygon.tooltip.start;
      } else if (this._markers.length < 3) {
        text = _draw2.default.draw.handlers.polygon.tooltip.cont;
        subtext = this._getMeasurementString();
      } else {
        text = _draw2.default.draw.handlers.polygon.tooltip.end;
        subtext = this._getMeasurementString();
      }

      return { text: text, subtext: subtext };
    }
  }, {
    key: '_getMeasurementString',
    value: function _getMeasurementString() {
      var area = this._area;
      var measurementString = '';

      if (!area && !this.options.showLength) return measurementString;

      if (this.options.showLength) measurementString = (0, _get3.default)(Polygon.prototype.__proto__ || Object.getPrototypeOf(Polygon.prototype), '_getMeasurementString', this).call(this);

      if (area) measurementString += '<br>' + _index.GeometryUtil.readableArea(area, this.options.metric, this.options.precision);

      return measurementString;
    }
  }, {
    key: '_shapeIsValid',
    value: function _shapeIsValid() {
      return this._markers.length >= 3;
    }
  }, {
    key: '_vertexChanged',
    value: function _vertexChanged(latlng, added) {
      // Check to see if we should show the area
      if (!this.options.allowIntersection && this.options.showArea) {
        var latLngs = this._poly.getLatLngs();

        this._area = _index.GeometryUtil.geodesicArea(latLngs);
      }

      (0, _get3.default)(Polygon.prototype.__proto__ || Object.getPrototypeOf(Polygon.prototype), '_vertexChanged', this).call(this, latlng, added);
    }
  }, {
    key: '_cleanUpShape',
    value: function _cleanUpShape() {
      var markerCount = this._markers.length;

      if (markerCount > 0) {
        this._markers[0].off('click', this._finishShape, this);

        if (markerCount > 2) this._markers[markerCount - 1].off('dblclick', this._finishShape, this);
      }
    }
  }]);
  return Polygon;
}(_Polyline3.default);

Polygon.TYPE = _constants.TYPE_POLYGON;
Polygon.Poly = _leaflet2.default.Polygon;
Polygon.options = DEFAULT_POLYGON_OPTIONS;
exports.default = Polygon;

//# sourceMappingURL=Polygon.js.map