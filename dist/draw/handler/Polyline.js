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

var _Tooltip = require('../../Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

var _Event = require('../../Event');

var _Event2 = _interopRequireDefault(_Event);

var _index = require('../../ext/index');

var _Feature2 = require('./Feature');

var _Feature3 = _interopRequireDefault(_Feature2);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_POLYLINE_OPTIONS = {
  allowIntersection: true,
  repeatMode: false,
  drawError: {
    color: '#b00b00',
    timeout: 2500,
    message: _draw2.default.draw.handlers.polyline.error
  },
  icon: new _leaflet2.default.DivIcon({
    iconSize: new _leaflet2.default.Point(8, 8),
    className: 'leaflet-div-icon leaflet-editing-icon'
  }),
  touchIcon: new _leaflet2.default.DivIcon({
    iconSize: new _leaflet2.default.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon'
  }),
  guidelineDistance: 20,
  maxGuideLineLength: 4000,
  shapeOptions: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: false,
    clickable: true
  },
  metric: true,
  feet: true,
  nautic: false,
  showLength: true,
  zIndexOffset: 2000 };

var Polyline = function (_Feature) {
  (0, _inherits3.default)(Polyline, _Feature);

  function Polyline() {
    (0, _classCallCheck3.default)(this, Polyline);
    return (0, _possibleConstructorReturn3.default)(this, (Polyline.__proto__ || Object.getPrototypeOf(Polyline)).apply(this, arguments));
  }

  (0, _createClass3.default)(Polyline, [{
    key: 'initialize',
    value: function initialize(map, options) {
      this.type = Polyline.TYPE;
      this.Poly = Polyline.Poly;

      var defaultIcon = _leaflet2.default.Browser.touch ? Polyline.options.touchIcon : Polyline.options.icon;
      (0, _get3.default)(Polyline.prototype.__proto__ || Object.getPrototypeOf(Polyline.prototype), 'initialize', this).call(this, map, (0, _extends3.default)({}, Polyline.options, {
        icon: defaultIcon
      }, options, {
        drawError: (0, _extends3.default)({}, Polyline.drawError, typeof options !== 'undefined' && options.drawError !== 'undefined' ? options.drawError : {})
      }));
    }
  }, {
    key: 'addHooks',
    value: function addHooks() {
      (0, _get3.default)(Polyline.prototype.__proto__ || Object.getPrototypeOf(Polyline.prototype), 'addHooks', this).call(this);
      if (this._map) {
        this._markers = [];

        this._markerGroup = new _leaflet2.default.LayerGroup();
        this._map.addLayer(this._markerGroup);

        this._poly = new _leaflet2.default.Polyline([], this.options.shapeOptions);

        this._tooltip.updateContent(this._getTooltipText());

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

        this._mouseMarker.on('mouseout', this._onMouseOut, this).on('mousemove', this._onMouseMove, this).on('mousedown', this._onMouseDown, this).on('mouseup', this._onMouseUp, this).addTo(this._map);

        this._map.on('mouseup', this._onMouseUp, this).on('mousemove', this._onMouseMove, this).on('zoomlevelschange', this._onZoomEnd, this).on('touchstart', this._onTouch, this).on('zoomend', this._onZoomEnd, this);
      }
    }
  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      (0, _get3.default)(Polyline.prototype.__proto__ || Object.getPrototypeOf(Polyline.prototype), 'removeHooks', this).call(this);

      this._clearHideErrorTimeout();

      this._cleanUpShape();

      this._map.removeLayer(this._markerGroup);
      delete this._markerGroup;
      delete this._markers;

      this._map.removeLayer(this._poly);
      delete this._poly;

      this._mouseMarker.off('mousedown', this._onMouseDown, this).off('mouseout', this._onMouseOut, this).off('mouseup', this._onMouseUp, this).off('mousemove', this._onMouseMove, this);
      this._map.removeLayer(this._mouseMarker);
      delete this._mouseMarker;

      this._clearGuides();

      // adds click handler to start of this line
      this._map.off('click', this._onClick, this).off('mouseup', this._onMouseUp, this).off('mousemove', this._onMouseMove, this).off('zoomlevelschange', this._onZoomEnd, this).off('zoomend', this._onZoomEnd, this).off('touchstart', this._onTouch, this).off('click', this._onTouch, this);
    }
  }, {
    key: 'deleteLastVertex',
    value: function deleteLastVertex() {
      if (this._markers.length <= 1) return;

      var lastMarker = this._markers.pop();
      var poly = this._poly;
      var latlngs = poly.getLatLngs();
      var latlng = latlngs.splice(-1, 1)[0];
      this._poly.setLatLngs(latlngs);

      this._markerGroup.removeLayer(lastMarker);

      if (poly.getLatLngs().length < 2) this._map.removeLayer(poly);

      this._vertexChanged(latlng, false);
    }
  }, {
    key: 'addVertex',
    value: function addVertex(latlng) {
      var markersLength = this._markers.length;

      if (markersLength >= 2 && !this.options.allowIntersection && this._poly.newLatLngIntersects(latlng)) {
        this._showErrorTooltip();
        return;
      } else if (this._errorShown) {
        this._hideErrorTooltip();
      }

      this._markers.push(this._createMarker(latlng));

      this._poly.addLatLng(latlng);

      if (this._poly.getLatLngs().length === 2) this._map.addLayer(this._poly);

      this._vertexChanged(latlng, true);
    }
  }, {
    key: 'completeShape',
    value: function completeShape() {
      if (this._markers.length <= 1) return;

      this._fireCreatedEvent();
      this.disable();

      if (this.options.repeatMode) this.enable();
    }
  }, {
    key: '_finishShape',
    value: function _finishShape() {
      var latlngs = this._poly._defaultShape ? this._poly._defaultShape() : this._poly.getLatLngs();
      var intersects = this._poly.newLatLngIntersects(latlngs[latlngs.length - 1]);

      if (!this.options.allowIntersection && intersects || !this._shapeIsValid()) {
        this._showErrorTooltip();
        return;
      }

      this._fireCreatedEvent();
      this.disable();
      if (this.options.repeatMode) this.enable();
    }
  }, {
    key: '_shapeIsValid',
    value: function _shapeIsValid() {
      return true;
    }
  }, {
    key: '_onZoomEnd',
    value: function _onZoomEnd() {
      if (this._markers !== null) this._updateGuide();
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var newPos = this._map.mouseEventToLayerPoint(event.originalEvent);
      var latlng = this._map.layerPointToLatLng(newPos);

      this._currentLatLng = latlng;

      this._updateTooltip(latlng);

      this._updateGuide(newPos);

      this._mouseMarker.setLatLng(latlng);

      _leaflet2.default.DomEvent.preventDefault(event.originalEvent);
    }
  }, {
    key: '_vertexChanged',
    value: function _vertexChanged(latlng, added) {
      this._map.fire(_Event2.default.DRAWVERTEX, { layers: this._markerGroup });
      this._updateFinishHandler();

      this._updateRunningMeasure(latlng, added);

      this._clearGuides();

      this._updateTooltip();
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      if (!this._clickHandled && !this._touchHandled && !this._disableMarkers) {
        this._onMouseMove(event);
        this._clickHandled = true;
        this._disableNewMarkers();
        var _originalEvent = event.originalEvent;
        var _clientX = _originalEvent.clientX;
        var _clientY = _originalEvent.clientY;
        this._startPoint.call(this, _clientX, _clientY);
      }
    }
  }, {
    key: '_startPoint',
    value: function _startPoint(clientX, clientY) {
      this._mouseDownOrigin = _leaflet2.default.point(clientX, clientY);
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp(event) {
      var originalEvent = event.originalEvent;
      var clientX = originalEvent.clientX,
          clientY = originalEvent.clientY;

      this._endPoint(clientX, clientY, originalEvent);
      this._clickHandled = null;
    }
  }, {
    key: '_endPoint',
    value: function _endPoint(clientX, clientY, event) {
      if (this._mouseDownOrigin) {
        var dragCheckDistance = _leaflet2.default.point(clientX, clientY).distanceTo(this._mouseDownOrigin);
        var lastPtDistance = this._calculateFinishDistance(event.latlng);
        if (lastPtDistance < 10 && _leaflet2.default.Browser.touch) {
          this._finishShape();
        } else if (Math.abs(dragCheckDistance) < 9 * (window.devicePixelRatio || 1)) {
          this.addVertex(event.latlng);
        }
        this._enableNewMarkers();
      }
      this._mouseDownOrigin = null;
    }
  }, {
    key: '_onTouch',
    value: function _onTouch(event) {
      var originalEvent = event.originalEvent;
      if (originalEvent.touches && originalEvent.touches[0] && !this._clickHandled && !this._touchHandled && !this._disableMarkers) {
        var _clientX2 = originalEvent.touches[0].clientX;
        var _clientY2 = originalEvent.touches[0].clientY;
        this._disableNewMarkers();
        this._touchHandled = true;
        this._startPoint(_clientX2, _clientY2);
        this._endPoint(_clientX2, _clientY2, event);
        this._touchHandled = null;
      }
      this._clickHandled = null;
    }
  }, {
    key: '_onMouseOut',
    value: function _onMouseOut() {
      if (this._tooltip) this._tooltip._onMouseOut.call(this._tooltip);
    }
  }, {
    key: '_calculateFinishDistance',
    value: function _calculateFinishDistance(potentialLatLng) {
      var lastPtDistance = void 0;

      if (this._markers.length > 0) {
        var finishMarker = void 0;

        if (this.type === _constants.TYPE_POLYLINE) finishMarker = this._markers[this._markers.length - 1];else if (this.type === _constants.TYPE_POLYGON) finishMarker = this._markers[0];else return Infinity;

        var lastMarkerPoint = this._map.latLngToContainerPoint(finishMarker.getLatLng());
        var potentialMarker = new _leaflet2.default.Marker(potentialLatLng, {
          icon: this.options.icon,
          zIndexOffset: this.options.zIndexOffset * 2
        });
        var potentialMarkerPint = this._map.latLngToContainerPoint(potentialMarker.getLatLng());
        lastPtDistance = lastMarkerPoint.distanceTo(potentialMarkerPint);
      } else {
        lastPtDistance = Infinity;
      }

      return lastPtDistance;
    }
  }, {
    key: '_updateFinishHandler',
    value: function _updateFinishHandler() {
      var markerCount = this._markers.length;

      if (markerCount > 1) this._markers[markerCount - 1].on('click', this._finishShape, this);

      if (markerCount > 2) this._markers[markerCount - 2].off('click', this._finishShape, this);
    }
  }, {
    key: '_createMarker',
    value: function _createMarker(latlng) {
      var marker = new _leaflet2.default.Marker(latlng, {
        icon: this.options.icon,
        zIndexOffset: this.options.zIndexOffset * 2
      });

      this._markerGroup.addLayer(marker);

      return marker;
    }
  }, {
    key: '_updateGuide',
    value: function _updateGuide(newPos) {
      var markerCount = this._markers ? this._markers.length : 0;

      if (markerCount > 0) {
        this._clearGuides();
        this._drawGuide(this._map.latLngToLayerPoint(this._markers[markerCount - 1].getLatLng()), newPos || this._map.latLngToLayerPoint(this._currentLatLng));
      }
    }
  }, {
    key: '_updateTooltip',
    value: function _updateTooltip(latLng) {
      var text = this._getTooltipText();

      if (latLng) this._tooltip.updatePosition(latLng);

      if (!this._errorShown) this._tooltip.updateContent(text);
    }
  }, {
    key: '_drawGuide',
    value: function _drawGuide(pointA, pointB) {
      var length = Math.floor(Math.sqrt(Math.pow(pointB.x - pointA.x, 2) + Math.pow(pointB.y - pointA.y, 2)));
      var guidelineDistance = this.options.guidelineDistance;
      var maxGuideLineLength = this.options.maxGuideLineLength;

      var fraction = void 0;
      var dashPoint = void 0;
      var dash = void 0;

      if (!this._guidesContainer) {
        this._guidesContainer = _leaflet2.default.DomUtil.create('div', 'leaflet-draw-guides', this._overlayPane);
      }

      for (var i = length > maxGuideLineLength ? length - maxGuideLineLength : guidelineDistance; i < length; i += this.options.guidelineDistance) {
        fraction = i / length;

        dashPoint = {
          x: Math.floor(pointA.x * (1 - fraction) + fraction * pointB.x),
          y: Math.floor(pointA.y * (1 - fraction) + fraction * pointB.y)
        };

        dash = _leaflet2.default.DomUtil.create('div', 'leaflet-draw-guide-dash', this._guidesContainer);
        dash.style.backgroundColor = !this._errorShown ? this.options.shapeOptions.color : this.options.drawError.color;

        _leaflet2.default.DomUtil.setPosition(dash, dashPoint);
      }
    }
  }, {
    key: '_updateGuideColor',
    value: function _updateGuideColor(color) {
      if (this._guidesContainer) {
        for (var i = 0, l = this._guidesContainer.childNodes.length; i < l; i += 1) {
          this._guidesContainer.childNodes[i].style.backgroundColor = color;
        }
      }
    }
  }, {
    key: '_clearGuides',
    value: function _clearGuides() {
      if (this._guidesContainer) {
        while (this._guidesContainer.firstChild) {
          this._guidesContainer.removeChild(this._guidesContainer.firstChild);
        }
      }
    }
  }, {
    key: '_getTooltipText',
    value: function _getTooltipText() {
      var showLength = this.options.showLength;
      var labelText = void 0;
      var distanceStr = void 0;
      if (_leaflet2.default.Browser.touch) showLength = false;

      if (this._markers.length === 0) {
        labelText = { text: _draw2.default.draw.handlers.polyline.tooltip.start };
      } else {
        distanceStr = showLength ? this._getMeasurementString() : '';

        if (this._markers.length === 1) labelText = {
          text: _draw2.default.draw.handlers.polyline.tooltip.cont,
          subtext: distanceStr
        };else labelText = {
          text: _draw2.default.draw.handlers.polyline.tooltip.end,
          subtext: distanceStr
        };
      }
      return labelText;
    }
  }, {
    key: '_updateRunningMeasure',
    value: function _updateRunningMeasure(latlng, added) {
      var markersLength = this._markers.length;
      var previousMarkerIndex = void 0;
      var distance = void 0;

      if (this._markers.length === 1) {
        this._measurementRunningTotal = 0;
      } else {
        previousMarkerIndex = markersLength - (added ? 2 : 1);
        distance = latlng.distanceTo(this._markers[previousMarkerIndex].getLatLng());

        this._measurementRunningTotal += distance * (added ? 1 : -1);
      }
    }
  }, {
    key: '_getMeasurementString',
    value: function _getMeasurementString() {
      var currentLatLng = this._currentLatLng;
      var previousLatLng = this._markers[this._markers.length - 1].getLatLng();

      var distance = previousLatLng && currentLatLng && currentLatLng.distanceTo ? this._measurementRunningTotal + currentLatLng.distanceTo(previousLatLng) : this._measurementRunningTotal || 0;

      return _index.GeometryUtil.readableDistance(distance, this.options.metric, this.options.feet, this.options.nautic, this.options.precision);
    }
  }, {
    key: '_showErrorTooltip',
    value: function _showErrorTooltip() {
      this._errorShown = true;

      this._tooltip.showAsError().updateContent({ text: this.options.drawError.message });

      this._updateGuideColor(this.options.drawError.color);
      this._poly.setStyle({ color: this.options.drawError.color });

      this._clearHideErrorTimeout();
      this._hideErrorTimeout = setTimeout(_leaflet2.default.Util.bind(this._hideErrorTooltip, this), this.options.drawError.timeout);
    }
  }, {
    key: '_hideErrorTooltip',
    value: function _hideErrorTooltip() {
      this._errorShown = false;

      this._clearHideErrorTimeout();

      this._tooltip.removeError().updateContent(this._getTooltipText());

      this._updateGuideColor(this.options.shapeOptions.color);
      this._poly.setStyle({ color: this.options.shapeOptions.color });
    }
  }, {
    key: '_clearHideErrorTimeout',
    value: function _clearHideErrorTimeout() {
      if (this._hideErrorTimeout) {
        clearTimeout(this._hideErrorTimeout);
        this._hideErrorTimeout = null;
      }
    }
  }, {
    key: '_disableNewMarkers',
    value: function _disableNewMarkers() {
      this._disableMarkers = true;
    }
  }, {
    key: '_enableNewMarkers',
    value: function _enableNewMarkers() {
      var _this2 = this;

      setTimeout(function () {
        _this2._disableMarkers = false;
      }, 50);
    }
  }, {
    key: '_cleanUpShape',
    value: function _cleanUpShape() {
      if (this._markers.length > 1) this._markers[this._markers.length - 1].off('click', this._finishShape, this);
    }
  }, {
    key: '_fireCreatedEvent',
    value: function _fireCreatedEvent() {
      var poly = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
      (0, _get3.default)(Polyline.prototype.__proto__ || Object.getPrototypeOf(Polyline.prototype), '_fireCreatedEvent', this).call(this, poly);
    }
  }]);
  return Polyline;
}(_Feature3.default);

Polyline.TYPE = _constants.TYPE_POLYLINE;
Polyline.options = DEFAULT_POLYLINE_OPTIONS;
exports.default = Polyline;