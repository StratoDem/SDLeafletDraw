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

var _SimpleShape2 = require('./SimpleShape');

var _SimpleShape3 = _interopRequireDefault(_SimpleShape2);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_RECTANGLE_OPTIONS = {
  shapeOptions: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: true,
    fillColor: null,
    fillOpacity: 0.2,
    showArea: true,
    clickable: true
  },
  metric: true };

var Rectangle = function (_SimpleShape) {
  (0, _inherits3.default)(Rectangle, _SimpleShape);

  function Rectangle() {
    (0, _classCallCheck3.default)(this, Rectangle);
    return (0, _possibleConstructorReturn3.default)(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).apply(this, arguments));
  }

  (0, _createClass3.default)(Rectangle, [{
    key: 'initialize',
    value: function initialize(map, options) {
      this.type = Rectangle.TYPE;

      this._initialLabelText = _draw2.default.draw.handlers.rectangle.tooltip.start;
      (0, _get3.default)(Rectangle.prototype.__proto__ || Object.getPrototypeOf(Rectangle.prototype), 'initialize', this).call(this, map, (0, _extends3.default)({}, Rectangle.options, options, {
        shapeOptions: (0, _extends3.default)({}, Rectangle.options.shapeOptions, typeof options !== 'undefined' && options.shapeOptions !== 'undefined' ? options.shapeOptions : {})
      }));
    }
  }, {
    key: '_drawShape',
    value: function _drawShape(latlng) {
      if (!this._shape) {
        this._shape = new _leaflet2.default.Rectangle(new _leaflet2.default.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
        this._map.addLayer(this._shape);
      } else {
        this._shape.setBounds(new _leaflet2.default.LatLngBounds(this._startLatLng, latlng));
      }
    }
  }, {
    key: '_fireCreatedEvent',
    value: function _fireCreatedEvent() {
      var rectangle = new _leaflet2.default.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
      (0, _get3.default)(Rectangle.prototype.__proto__ || Object.getPrototypeOf(Rectangle.prototype), '_fireCreatedEvent', this).call(this, rectangle);
    }
  }, {
    key: '_getTooltipText',
    value: function _getTooltipText() {
      var tooltipText = (0, _get3.default)(Rectangle.prototype.__proto__ || Object.getPrototypeOf(Rectangle.prototype), '_getTooltipText', this).call(this);
      var shape = this._shape;
      var showArea = this.options.showArea;
      var latLngs = void 0;
      var area = void 0;
      var subtext = void 0;

      if (shape) {
        latLngs = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs();
        area = _index.GeometryUtil.geodesicArea(latLngs);
        subtext = showArea ? _index.GeometryUtil.readableArea(area, this.options.metric) : '';
      }

      return {
        text: tooltipText.text,
        subtext: subtext
      };
    }
  }]);
  return Rectangle;
}(_SimpleShape3.default);

Rectangle.TYPE = _constants.TYPE_RECTANGLE;
Rectangle.options = DEFAULT_RECTANGLE_OPTIONS;
exports.default = Rectangle;