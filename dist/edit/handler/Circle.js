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

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _Event = require('../../Event');

var _Event2 = _interopRequireDefault(_Event);

var _SimpleShape2 = require('./SimpleShape');

var _SimpleShape3 = _interopRequireDefault(_SimpleShape2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Circle = function (_SimpleShape) {
  (0, _inherits3.default)(Circle, _SimpleShape);

  function Circle() {
    (0, _classCallCheck3.default)(this, Circle);
    return (0, _possibleConstructorReturn3.default)(this, (Circle.__proto__ || Object.getPrototypeOf(Circle)).apply(this, arguments));
  }

  (0, _createClass3.default)(Circle, [{
    key: '_createMoveMarker',
    value: function _createMoveMarker() {
      var center = this._shape.getLatLng();

      this._moveMarker = this._createMarker(center, this.options.moveIcon);
    }
  }, {
    key: '_createResizeMarker',
    value: function _createResizeMarker() {
      var center = this._shape.getLatLng();
      var resizemarkerPoint = this._getResizeMarkerPoint(center);

      this._resizeMarkers = [];
      this._resizeMarkers.push(this._createMarker(resizemarkerPoint, this.options.resizeIcon));
    }
  }, {
    key: '_getResizeMarkerPoint',
    value: function _getResizeMarkerPoint(latlng) {
      var delta = this._shape._radius * Math.cos(Math.PI / 4);
      var point = this._map.project(latlng);
      return this._map.unproject([point.x + delta, point.y - delta]);
    }
  }, {
    key: '_move',
    value: function _move(latlng) {
      var resizemarkerPoint = this._getResizeMarkerPoint(latlng);

      this._resizeMarkers[0].setLatLng(resizemarkerPoint);

      this._shape.setLatLng(latlng);

      this._map.fire(_Event2.default.EDITMOVE, { layer: this._shape });
    }
  }, {
    key: '_resize',
    value: function _resize(latlng) {
      var moveLatLng = this._moveMarker.getLatLng();
      var radius = moveLatLng.distanceTo(latlng);

      this._shape.setRadius(radius);

      this._map.fire(_Event2.default.EDITRESIZE, { layer: this._shape });
    }
  }]);
  return Circle;
}(_SimpleShape3.default);

exports.default = Circle;


_leaflet2.default.Circle.addInitHook(function initHook() {
  if (Circle) {
    this.editing = new Circle(this);

    if (this.options.editable) {
      this.editing.enable();
    }
  }

  this.on('add', function onAdd() {
    if (this.editing && this.editing.enabled()) {
      this.editing.addHooks();
    }
  });

  this.on('remove', function onRemove() {
    if (this.editing && this.editing.enabled()) {
      this.editing.removeHooks();
    }
  });
});