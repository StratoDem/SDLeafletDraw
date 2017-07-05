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

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _index = require('../../ext/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_SIMPLESHAPE_OPTIONS = {
  moveIcon: new _leaflet2.default.DivIcon({
    iconSize: new _leaflet2.default.Point(8, 8),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move'
  }),
  resizeIcon: new _leaflet2.default.DivIcon({
    iconSize: new _leaflet2.default.Point(8, 8),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize'
  }),
  touchMoveIcon: new _leaflet2.default.DivIcon({
    iconSize: new _leaflet2.default.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move leaflet-touch-icon'
  }),
  touchResizeIcon: new _leaflet2.default.DivIcon({
    iconSize: new _leaflet2.default.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize leaflet-touch-icon'
  })
};

var SimpleShape = function (_L$Handler) {
  (0, _inherits3.default)(SimpleShape, _L$Handler);

  function SimpleShape() {
    (0, _classCallCheck3.default)(this, SimpleShape);
    return (0, _possibleConstructorReturn3.default)(this, (SimpleShape.__proto__ || Object.getPrototypeOf(SimpleShape)).apply(this, arguments));
  }

  (0, _createClass3.default)(SimpleShape, [{
    key: 'initialize',
    value: function initialize(shape, options) {
      var moveIcon = _leaflet2.default.Browser.touch ? SimpleShape.options.touchMoveIcon : SimpleShape.options.moveIcon;
      var resizeIcon = _leaflet2.default.Browser.touch ? SimpleShape.options.touchResizeIcon : SimpleShape.options.resizeIcon;

      this._shape = shape;
      _leaflet2.default.Util.setOptions(this, (0, _extends3.default)({
        moveIcon: moveIcon,
        resizeIcon: resizeIcon,
        touchMoveIcon: SimpleShape.options.touchMoveIcon,
        touchResizeIcon: SimpleShape.options.touchResizeIcon
      }, options));
    }
  }, {
    key: 'addHooks',
    value: function addHooks() {
      var shape = this._shape;
      if (this._shape._map) {
        this._map = this._shape._map;
        shape.setStyle(shape.options.editing);

        if (shape._map) {
          this._map = shape._map;
          if (!this._markerGroup) {
            this._initMarkers();
          }
          this._map.addLayer(this._markerGroup);
        }
      }
    }
  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      var _this2 = this;

      var shape = this._shape;

      shape.setStyle(shape.options.original);

      if (shape._map) {
        this._unbindMarker(this._moveMarker);

        this._resizeMarkers.forEach(function (marker) {
          return _this2._unbindMarker(marker);
        });
        this._resizeMarkers = null;

        this._map.removeLayer(this._markerGroup);
        delete this._markerGroup;
      }

      this._map = null;
    }
  }, {
    key: 'updateMarkers',
    value: function updateMarkers() {
      this._markerGroup.clearLayers();
      this._initMarkers();
    }
  }, {
    key: '_initMarkers',
    value: function _initMarkers() {
      if (!this._markerGroup) this._markerGroup = new _leaflet2.default.LayerGroup();

      this._createMoveMarker();

      this._createResizeMarker();
    }
  }, {
    key: '_createMoveMarker',
    value: function _createMoveMarker() {}
  }, {
    key: '_createResizeMarker',
    value: function _createResizeMarker() {}
  }, {
    key: '_createMarker',
    value: function _createMarker(latlng, icon) {
      var marker = new _index.TouchMarker(latlng, {
        draggable: true,
        icon: icon,
        zIndexOffset: 10
      });

      this._bindMarker(marker);

      this._markerGroup.addLayer(marker);

      return marker;
    }
  }, {
    key: '_bindMarker',
    value: function _bindMarker(marker) {
      marker.on('dragstart', this._onMarkerDragStart, this).on('drag', this._onMarkerDrag, this).on('dragend', this._onMarkerDragEnd, this).on('touchstart', this._onTouchStart, this).on('touchmove', this._onTouchMove, this).on('MSPointerMove', this._onTouchMove, this).on('touchend', this._onTouchEnd, this).on('MSPointerUp', this._onTouchEnd, this);
    }
  }, {
    key: '_unbindMarker',
    value: function _unbindMarker(marker) {
      marker.off('dragstart', this._onMarkerDragStart, this).off('drag', this._onMarkerDrag, this).off('dragend', this._onMarkerDragEnd, this).off('touchstart', this._onTouchStart, this).off('touchmove', this._onTouchMove, this).off('MSPointerMove', this._onTouchMove, this).off('touchend', this._onTouchEnd, this).off('MSPointerUp', this._onTouchEnd, this);
    }
  }, {
    key: '_onMarkerDragStart',
    value: function _onMarkerDragStart(event) {
      var marker = event.target;
      marker.setOpacity(0);

      this._shape.fire('editstart');
    }
  }, {
    key: '_fireEdit',
    value: function _fireEdit() {
      this._shape.edited = true;
      this._shape.fire('edit');
    }
  }, {
    key: '_onMarkerDrag',
    value: function _onMarkerDrag(event) {
      var marker = event.target;
      var latlng = marker.getLatLng();

      if (marker === this._moveMarker) this._move(latlng);else this._resize(latlng);

      this._shape.redraw();
      this._shape.fire('editdrag');
    }
  }, {
    key: '_onMarkerDragEnd',
    value: function _onMarkerDragEnd(event) {
      var marker = event.target;
      marker.setOpacity(1);

      this._fireEdit();
    }
  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(event) {
      SimpleShape.prototype._onMarkerDragStart.call(this, event);

      if (typeof this._getCorners === 'function') {
        var corners = this._getCorners();
        var marker = event.target;
        var currentCornerIndex = marker._cornerIndex;

        marker.setOpacity(0);

        this._oppositeCorner = corners[(currentCornerIndex + 2) % 4];
        this._toggleCornerMarkers(0, currentCornerIndex);
      }

      this._shape.fire('editstart');
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(event) {
      var layerPoint = this._map.mouseEventToLayerPoint(event.originalEvent.touches[0]);
      var latlng = this._map.layerPointToLatLng(layerPoint);
      var marker = event.target;

      if (marker === this._moveMarker) this._move(latlng);else this._resize(latlng);

      this._shape.redraw();

      return false;
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(event) {
      var marker = event.target;
      marker.setOpacity(1);
      this.updateMarkers();
      this._fireEdit();
    }
  }, {
    key: '_move',
    value: function _move() {}
  }, {
    key: '_resize',
    value: function _resize() {}
  }]);
  return SimpleShape;
}(_leaflet2.default.Handler);

SimpleShape.options = DEFAULT_SIMPLESHAPE_OPTIONS;
exports.default = SimpleShape;