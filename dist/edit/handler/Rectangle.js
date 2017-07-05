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

var Rectangle = function (_SimpleShape) {
  (0, _inherits3.default)(Rectangle, _SimpleShape);

  function Rectangle() {
    (0, _classCallCheck3.default)(this, Rectangle);
    return (0, _possibleConstructorReturn3.default)(this, (Rectangle.__proto__ || Object.getPrototypeOf(Rectangle)).apply(this, arguments));
  }

  (0, _createClass3.default)(Rectangle, [{
    key: '_createMoveMarker',
    value: function _createMoveMarker() {
      var bounds = this._shape.getBounds();
      var center = bounds.getCenter();

      this._moveMarker = this._createMarker(center, this.options.moveIcon);
    }
  }, {
    key: '_createResizeMarker',
    value: function _createResizeMarker() {
      var _this2 = this;

      var corners = this._getCorners();

      this._resizeMarkers = corners.map(function (corner, idx) {
        var marker = _this2._createMarker(corner, _this2.options.resizeIcon);
        marker._cornerIndex = idx;
        return marker;
      });
    }
  }, {
    key: '_onMarkerDragStart',
    value: function _onMarkerDragStart(event) {
      _SimpleShape3.default.prototype._onMarkerDragStart.call(this, event);

      var corners = this._getCorners();
      var marker = event.target;
      var currentCornerIndex = marker._cornerIndex;

      this._oppositeCorner = corners[(currentCornerIndex + 2) % 4];

      this._toggleCornerMarkers(0);
    }
  }, {
    key: '_onMarkerDragEnd',
    value: function _onMarkerDragEnd(event) {
      var marker = event.target;

      if (marker === this._moveMarker) {
        var bounds = this._shape.getBounds();
        var center = bounds.getCenter();

        marker.setLatLng(center);
      }

      this._toggleCornerMarkers(1);

      this._repositionCornerMarkers();

      _SimpleShape3.default.prototype._onMarkerDragEnd.call(this, event);
    }
  }, {
    key: '_move',
    value: function _move(newCenter) {
      var latlngs = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs();
      var bounds = this._shape.getBounds();
      var center = bounds.getCenter();

      var newLatLngs = latlngs.map(function (ll) {
        return [newCenter.lat + (ll.lat - center.lat), newCenter.lng + (ll.lng - center.lng)];
      });

      this._shape.setLatLngs(newLatLngs);

      this._repositionCornerMarkers();

      this._map.fire(_Event2.default.EDITMOVE, { layer: this._shape });
    }
  }, {
    key: '_resize',
    value: function _resize(latlng) {
      this._shape.setBounds(_leaflet2.default.latLngBounds(latlng, this._oppositeCorner));

      var bounds = this._shape.getBounds();
      this._moveMarker.setLatLng(bounds.getCenter());

      this._map.fire(_Event2.default.EDITRESIZE, { layer: this._shape });
    }
  }, {
    key: '_getCorners',
    value: function _getCorners() {
      var bounds = this._shape.getBounds();

      return [bounds.getNorthWest(), bounds.getNorthEast(), bounds.getSouthEast(), bounds.getSouthWest()];
    }
  }, {
    key: '_toggleCornerMarkers',
    value: function _toggleCornerMarkers(opacity) {
      this._resizeMarkers.forEach(function (m) {
        return m.setOpacity(opacity);
      });
    }
  }, {
    key: '_repositionCornerMarkers',
    value: function _repositionCornerMarkers() {
      var corners = this._getCorners();

      this._resizeMarkers.forEach(function (m, idx) {
        m.setLatLng(corners[idx]);
      });
    }
  }]);
  return Rectangle;
}(_SimpleShape3.default);

exports.default = Rectangle;


_leaflet2.default.Rectangle.addInitHook(function addHook() {
  if (Rectangle) {
    this.editing = new Rectangle(this);

    if (this.options.editable) {
      this.editing.enable();
    }
  }
});