'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _SimpleShape2 = require('./SimpleShape');

var _SimpleShape3 = _interopRequireDefault(_SimpleShape2);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_CIRCLE_OPTIONS = {
  shapeOptions: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: true,
    fillColor: null,
    fillOpacity: 0.2,
    clickable: true
  },
  showRadius: true,
  metric: true,
  feet: true,
  nautic: false };

var Circle = function (_SimpleShape) {
  (0, _inherits3.default)(Circle, _SimpleShape);

  function Circle() {
    (0, _classCallCheck3.default)(this, Circle);
    return (0, _possibleConstructorReturn3.default)(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).apply(this, arguments));
  }

  (0, _createClass3.default)(Circle, [{
    key: 'initialize',
    value: function initialize(map, options) {
      this.type = Circle.TYPE;

      this._initialLabelText = _draw2.default.draw.handlers.circle.tooltip.start;

      (0, _get3.default)(Circle.prototype.__proto__ || Object.getPrototypeOf(Circle.prototype), 'initialize', this).call(this, map, options);
    }
  }, {
    key: '_drawShape',
    value: function _drawShape(latlng) {
      if (!this._shape) {
        this._shape = new _leaflet2.default.Circle(this._startLatLng, this._startLatLng.distanceTo(latlng), this.options.shapeOptions);
        this._map.addLayer(this._shape);
      } else {
        this._shape.setRadius(this._startLatLng.distanceTo(latlng));
      }
    }
  }, {
    key: '_fireCreatedEvent',
    value: function _fireCreatedEvent() {
      var circle = new _leaflet2.default.Circle(this._startLatLng, this._shape.getRadius(), this.options.shapeOptions);
      (0, _get3.default)(Circle.prototype.__proto__ || Object.getPrototypeOf(Circle.prototype), '_fireCreatedEvent', this).call(this, circle);
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var latlng = event.latlng;
      var showRadius = this.options.showRadius;
      var useMetric = this.options.metric;
      var radius = void 0;

      this._tooltip.updatePosition(latlng);
      if (this._isDrawing) {
        this._drawShape(latlng);

        radius = this._shape.getRadius().toFixed(1);

        var subtext = showRadius ? _draw2.default.draw.handlers.circle.radius + ': ' + _index.GeometryUtil.readableDistance(radius, useMetric, this.options.feet, this.options.nautic) : '';
        this._tooltip.updateContent({
          text: this._endLabelText,
          subtext: subtext
        });
      }
    }
  }]);
  return Circle;
}(_SimpleShape3.default);

Circle.options = DEFAULT_CIRCLE_OPTIONS;
Circle.type = _constants.TYPE_CIRCLE;
exports.default = Circle;