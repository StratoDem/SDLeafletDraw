'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PolyVerticesEdit = exports.Poly = undefined;

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

var _draw = require('../../draw');

var _draw2 = _interopRequireDefault(_draw);

var _Event = require('../../Event');

var _Event2 = _interopRequireDefault(_Event);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Poly = exports.Poly = function (_L$Handler) {
  (0, _inherits3.default)(Poly, _L$Handler);

  function Poly() {
    (0, _classCallCheck3.default)(this, Poly);
    return (0, _possibleConstructorReturn3.default)(this, (Poly.__proto__ || Object.getPrototypeOf(Poly)).apply(this, arguments));
  }

  (0, _createClass3.default)(Poly, [{
    key: 'initialize',
    value: function initialize(poly, options) {
      this.latlngs = [poly._latlngs];
      if (poly._holes) {
        this.latlngs = this.latlngs.concat(poly._holes);
      }

      this._poly = poly;
      _leaflet2.default.setOptions(this, options);

      this._poly.on('revert-edited', this._updateLatLngs, this);
    }
  }, {
    key: '_defaultShape',
    value: function _defaultShape() {
      if (!_leaflet2.default.Polyline._flat) return this._poly._latlngs;

      return _leaflet2.default.Polyline._flat(this._poly._latlngs) ? this._poly._latlngs : this._poly._latlngs[0];
    }
  }, {
    key: '_eachVertexHandler',
    value: function _eachVertexHandler(callback) {
      this._verticesHandlers.forEach(function (vh) {
        return callback(vh);
      });
    }
  }, {
    key: 'addHooks',
    value: function addHooks() {
      this._initHandlers();
      this._eachVertexHandler(function (handler) {
        handler.addHooks();
      });
    }
  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      this._eachVertexHandler(function (handler) {
        handler.removeHooks();
      });
    }
  }, {
    key: 'updateMarkers',
    value: function updateMarkers() {
      this._eachVertexHandler(function (handler) {
        handler.updateMarkers();
      });
    }
  }, {
    key: '_initHandlers',
    value: function _initHandlers() {
      var _this2 = this;

      this._verticesHandlers = this.latlngs.map(function (ll) {
        return new PolyVerticesEdit(_this2._poly, ll, _this2.options);
      });
    }
  }, {
    key: '_updateLatLngs',
    value: function _updateLatLngs(event) {
      this.latlngs = [event.layer._latlngs];
      if (event.layer._holes) {
        this.latlngs = this.latlngs.concat(event.layer._holes);
      }
    }
  }]);
  return Poly;
}(_leaflet2.default.Handler);

Poly.options = {};

var DEFAULT_POLYVERTICES_OPTIONS = {
  icon: new _leaflet2.default.DivIcon({
    iconSize: new _leaflet2.default.Point(8, 8),
    className: 'leaflet-div-icon leaflet-editing-icon'
  }),
  touchIcon: new _leaflet2.default.DivIcon({
    iconSize: new _leaflet2.default.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
  }),
  drawError: {
    color: '#b00b00',
    timeout: 1000
  }
};

var PolyVerticesEdit = exports.PolyVerticesEdit = function (_L$Handler2) {
  (0, _inherits3.default)(PolyVerticesEdit, _L$Handler2);

  function PolyVerticesEdit() {
    (0, _classCallCheck3.default)(this, PolyVerticesEdit);
    return (0, _possibleConstructorReturn3.default)(this, (PolyVerticesEdit.__proto__ || Object.getPrototypeOf(PolyVerticesEdit)).apply(this, arguments));
  }

  (0, _createClass3.default)(PolyVerticesEdit, [{
    key: 'initialize',
    value: function initialize(poly, latlngs, options) {
      this._poly = poly;
      this._latlngs = latlngs;

      var defaultIcon = _leaflet2.default.Browser.touch ? PolyVerticesEdit.options.touchIcon : PolyVerticesEdit.options.icon;
      _leaflet2.default.setOptions(this, {
        icon: typeof options.icon !== 'undefined' ? options.icon : defaultIcon,
        touchIcon: typeof options.touchIcon !== 'undefined' ? options.touchIcon : PolyVerticesEdit.options.touchIcon,
        drawError: (0, _extends3.default)({}, PolyVerticesEdit.options.drawError, typeof options.drawError !== 'undefined' ? options.drawError : {})
      });
    }
  }, {
    key: '_defaultShape',
    value: function _defaultShape() {
      if (typeof _leaflet2.default.LineUtil._flat === 'undefined') return this._latlngs;

      return _leaflet2.default.LineUtil._flat(this._latlngs) ? this._latlngs : this._latlngs[0];
    }
  }, {
    key: 'addHooks',
    value: function addHooks() {
      var poly = this._poly;

      if (!(poly instanceof _leaflet2.default.Polygon)) {
        poly.options.fill = false;
        if (poly.options.editing) {
          poly.options.editing.fill = false;
        }
      }

      poly.setStyle(poly.options.editing);

      if (this._poly._map) {
        this._map = this._poly._map;

        if (!this._markerGroup) this._initMarkers();

        this._poly._map.addLayer(this._markerGroup);
      }
    }
  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      var poly = this._poly;

      poly.setStyle(poly.options.original);

      if (poly._map) {
        poly._map.removeLayer(this._markerGroup);
        delete this._markerGroup;
        delete this._markers;
      }
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
      var _this4 = this;

      if (!this._markerGroup) this._markerGroup = new _leaflet2.default.LayerGroup();

      this._markers = this._defaultShape().map(function (ll, idx) {
        var marker = _this4._createMarker(ll, idx);
        marker.on('click', _this4._onMarkerClick, _this4);
        return marker;
      });

      this._markers.forEach(function (markerRight, idxRight) {
        if (!(idxRight === 0 && !(_leaflet2.default.Polygon && _this4._poly instanceof _leaflet2.default.Polygon))) {
          var idxLeft = idxRight === 0 ? _this4._markers.length - 1 : idxRight - 1;
          var markerLeft = _this4._markers[idxLeft];

          _this4._createMiddleMarker(markerLeft, markerRight);
          PolyVerticesEdit._updatePrevNext(markerLeft, markerRight);
        }
      });
    }
  }, {
    key: '_createMarker',
    value: function _createMarker(latlng, index) {
      var marker = new _index.TouchMarker(latlng, {
        draggable: true,
        icon: this.options.icon
      });

      marker._origLatLng = latlng;
      marker._index = index;

      marker.on('dragstart', this._onMarkerDragStart, this).on('drag', this._onMarkerDrag, this).on('dragend', this._fireEdit, this).on('touchmove', this._onTouchMove, this).on('touchend', this._fireEdit, this).on('MSPointerMove', this._onTouchMove, this).on('MSPointerUp', this._fireEdit, this);

      this._markerGroup.addLayer(marker);

      return marker;
    }
  }, {
    key: '_onMarkerDragStart',
    value: function _onMarkerDragStart() {
      this._poly.fire('editstart');
    }
  }, {
    key: '_spliceLatLngs',
    value: function _spliceLatLngs(idx1, idx2, latlng) {
      var latlngs = this._defaultShape();
      var removed = latlngs.splice(idx1, idx2, latlng);
      this._poly._convertLatLngs(latlngs, true);
      this._poly.redraw();
      return removed;
    }
  }, {
    key: '_removeMarker',
    value: function _removeMarker(marker) {
      var i = marker._index;

      this._markerGroup.removeLayer(marker);
      this._markers.splice(i, 1);
      this._spliceLatLngs(i, 1);
      this._updateIndexes(i, -1);

      marker.off('dragstart', this._onMarkerDragStart, this).off('drag', this._onMarkerDrag, this).off('dragend', this._fireEdit, this).off('touchmove', this._onMarkerDrag, this).off('touchend', this._fireEdit, this).off('click', this._onMarkerClick, this).off('MSPointerMove', this._onTouchMove, this).off('MSPointerUp', this._fireEdit, this);
    }
  }, {
    key: '_fireEdit',
    value: function _fireEdit() {
      this._poly.edited = true;
      this._poly.fire('edit');
      this._poly._map.fire(_Event2.default.EDITVERTEX, { layers: this._markerGroup, poly: this._poly });
    }
  }, {
    key: '_onMarkerDrag',
    value: function _onMarkerDrag(event) {
      var marker = event.target;
      var poly = this._poly;

      _leaflet2.default.extend(marker._origLatLng, marker._latlng);

      if (marker._middleLeft) marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
      if (marker._middleRight) marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));

      if (poly.options.poly) {
        var tooltip = poly._map._editTooltip;
        if (!poly.options.poly.allowIntersection && poly.intersects()) {
          var originalColor = poly.options.color;
          poly.setStyle({ color: this.options.drawError.color });

          if (_leaflet2.default.version.indexOf('0.7') !== 0) marker.dragging._draggable._onUp(event);

          this._onMarkerClick(event);

          if (tooltip) {
            tooltip.updateContent({
              text: _draw2.default.draw.handlers.polyline.error
            });
          }

          setTimeout(function () {
            poly.setStyle({ color: originalColor });
            if (tooltip) {
              tooltip.updateContent({
                text: _draw2.default.edit.handlers.edit.tooltip.text,
                subtext: _draw2.default.edit.handlers.edit.tooltip.subtext
              });
            }
          }, 1000);
        }
      }

      this._poly.redraw();
      this._poly.fire('editdrag');
    }
  }, {
    key: '_onMarkerClick',
    value: function _onMarkerClick(event) {
      var minPoints = _leaflet2.default.Polygon && this._poly instanceof _leaflet2.default.Polygon ? 4 : 3;
      var marker = event.target;

      if (this._defaultShape().length < minPoints) return;

      this._removeMarker(marker);

      PolyVerticesEdit._updatePrevNext(marker._prev, marker._next);

      if (marker._middleLeft) {
        this._markerGroup.removeLayer(marker._middleLeft);
      }
      if (marker._middleRight) {
        this._markerGroup.removeLayer(marker._middleRight);
      }

      if (marker._prev && marker._next) this._createMiddleMarker(marker._prev, marker._next);else if (!marker._prev) marker._next._middleLeft = null;else if (!marker._next) marker._prev._middleRight = null;

      this._fireEdit();
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(event) {
      var layerPoint = this._map.mouseEventToLayerPoint(event.originalEvent.touches[0]);
      var latlng = this._map.layerPointToLatLng(layerPoint);
      var marker = event.target;

      _leaflet2.default.extend(marker._origLatLng, latlng);

      if (marker._middleLeft) marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
      if (marker._middleRight) marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));

      this._poly.redraw();
      this.updateMarkers();
    }
  }, {
    key: '_updateIndexes',
    value: function _updateIndexes(index, delta) {
      this._markerGroup.eachLayer(function (marker) {
        if (marker._index > index) marker._index += delta;
      });
    }
  }, {
    key: '_createMiddleMarker',
    value: function _createMiddleMarker(marker1, marker2) {
      var _this5 = this;

      var latlng = this._getMiddleLatLng(marker1, marker2);
      var marker = this._createMarker(latlng);
      var onClick = void 0;

      marker.setOpacity(0.6);

      marker1._middleRight = marker2._middleLeft = marker;

      function onDragStart() {
        marker.off('touchmove', onDragStart, this);
        var i = marker2._index;

        marker._index = i;

        marker.off('click', onClick, this).on('click', this._onMarkerClick, this);

        latlng.lat = marker.getLatLng().lat;

        latlng.lng = marker.getLatLng().lng;
        this._spliceLatLngs(i, 0, latlng);
        this._markers.splice(i, 0, marker);

        marker.setOpacity(1);

        this._updateIndexes(i, 1);

        marker2._index += 1;
        PolyVerticesEdit._updatePrevNext(marker1, marker);
        PolyVerticesEdit._updatePrevNext(marker, marker2);

        this._poly.fire('editstart');
      }

      function onDragEnd() {
        marker.off('dragstart', onDragStart, this);
        marker.off('dragend', onDragEnd, this);
        marker.off('touchmove', onDragStart, this);

        this._createMiddleMarker(marker1, marker);
        this._createMiddleMarker(marker, marker2);
      }

      onClick = function onClick() {
        onDragStart.call(_this5);
        onDragEnd.call(_this5);
        _this5._fireEdit();
      };

      marker.on('click', onClick, this).on('dragstart', onDragStart, this).on('dragend', onDragEnd, this).on('touchmove', onDragStart, this);

      this._markerGroup.addLayer(marker);
    }
  }, {
    key: '_getMiddleLatLng',
    value: function _getMiddleLatLng(marker1, marker2) {
      var map = this._poly._map;
      var p1 = map.project(marker1.getLatLng());
      var p2 = map.project(marker2.getLatLng());

      return map.unproject(p1._add(p2)._divideBy(2));
    }
  }], [{
    key: '_updatePrevNext',
    value: function _updatePrevNext(marker1, marker2) {
      if (marker1) marker1._next = marker2;
      if (marker2) marker2._prev = marker1;
    }
  }]);
  return PolyVerticesEdit;
}(_leaflet2.default.Handler);

PolyVerticesEdit.options = DEFAULT_POLYVERTICES_OPTIONS;


_leaflet2.default.Polyline.addInitHook(function addInit() {
  if (this.editing) return;

  if (Poly) {
    this.editing = new Poly(this, this.options.poly);

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