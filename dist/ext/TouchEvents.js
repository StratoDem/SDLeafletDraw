'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TouchMarker = undefined;

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leaflet2.default.Map.mergeOptions({ touchExtend: true });

var TouchExtend = function (_L$Handler) {
  (0, _inherits3.default)(TouchExtend, _L$Handler);

  function TouchExtend() {
    (0, _classCallCheck3.default)(this, TouchExtend);
    return (0, _possibleConstructorReturn3.default)(this, (TouchExtend.__proto__ || Object.getPrototypeOf(TouchExtend)).apply(this, arguments));
  }

  (0, _createClass3.default)(TouchExtend, [{
    key: 'initialize',
    value: function initialize(map) {
      this._map = map;
      this._container = map._container;
      this._pane = map._panes.overlayPane;
    }
  }, {
    key: 'addHooks',
    value: function addHooks() {
      _leaflet2.default.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
      _leaflet2.default.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this);
      _leaflet2.default.DomEvent.on(this._container, 'touchmove', this._onTouchMove, this);

      if (TouchExtend._detectIE()) {
        _leaflet2.default.DomEvent.on(this._container, 'MSPointerDown', this._onTouchStart, this);
        _leaflet2.default.DomEvent.on(this._container, 'MSPointerUp', this._onTouchEnd, this);
        _leaflet2.default.DomEvent.on(this._container, 'MSPointerMove', this._onTouchMove, this);
        _leaflet2.default.DomEvent.on(this._container, 'MSPointerCancel', this._onTouchCancel, this);
      } else {
        _leaflet2.default.DomEvent.on(this._container, 'touchcancel', this._onTouchCancel, this);
        _leaflet2.default.DomEvent.on(this._container, 'touchleave', this._onTouchLeave, this);
      }
    }
  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      _leaflet2.default.DomEvent.off(this._container, 'touchstart', this._onTouchStart);
      _leaflet2.default.DomEvent.off(this._container, 'touchend', this._onTouchEnd);
      _leaflet2.default.DomEvent.off(this._container, 'touchmove', this._onTouchMove);
      if (TouchExtend._detectIE()) {
        _leaflet2.default.DomEvent.off(this._container, 'MSPointerDowm', this._onTouchStart);
        _leaflet2.default.DomEvent.off(this._container, 'MSPointerUp', this._onTouchEnd);
        _leaflet2.default.DomEvent.off(this._container, 'MSPointerMove', this._onTouchMove);
        _leaflet2.default.DomEvent.off(this._container, 'MSPointerCancel', this._onTouchCancel);
      } else {
        _leaflet2.default.DomEvent.off(this._container, 'touchcancel', this._onTouchCancel);
        _leaflet2.default.DomEvent.off(this._container, 'touchleave', this._onTouchLeave);
      }
    }
  }, {
    key: '_touchEvent',
    value: function _touchEvent(event, type) {
      var touchEvent = {};
      if (typeof event.touches !== 'undefined') {
        if (!event.touches.length) return;
        touchEvent = event.touches[0];
      } else if (event.pointerType === 'touch') {
        touchEvent = event;
        if (!TouchExtend._filterClick(event)) return;
      } else return;

      var containerPoint = this._map.mouseEventToContainerPoint(touchEvent);
      var layerPoint = this._map.mouseEventToLayerPoint(touchEvent);
      var latlng = this._map.layerPointToLatLng(layerPoint);

      this._map.fire(type, {
        latlng: latlng,
        layerPoint: layerPoint,
        containerPoint: containerPoint,
        pageX: touchEvent.pageX,
        pageY: touchEvent.pageY,
        originalEvent: event
      });
    }
  }, {
    key: '_onTouchStart',
    value: function _onTouchStart(event) {
      if (!this._map._loaded) return;

      var type = 'touchstart';
      this._touchEvent(event, type);
    }
  }, {
    key: '_onTouchEnd',
    value: function _onTouchEnd(event) {
      if (!this._map._loaded) return;

      var type = 'touchend';
      this._touchEvent(event, type);
    }
  }, {
    key: '_onTouchCancel',
    value: function _onTouchCancel(event) {
      if (!this._map._loaded) return;

      var type = TouchExtend._detectIE() ? 'pointercancel' : 'touchcancel';
      this._touchEvent(event, type);
    }
  }, {
    key: '_onTouchLeave',
    value: function _onTouchLeave(event) {
      if (!this._map._loaded) return;

      var type = 'touchleave';
      this._touchEvent(event, type);
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(event) {
      if (!this._map._loaded) return;

      var type = 'touchmove';
      this._touchEvent(event, type);
    }
  }], [{
    key: '_filterClick',
    value: function _filterClick(event) {
      var timeStamp = event.timeStamp || event.originalEvent.timeStamp;
      var elapsed = _leaflet2.default.DomEvent._lastClick && timeStamp - _leaflet2.default.DomEvent._lastClick;

      if (elapsed && elapsed > 100 && elapsed < 500 || event.target._simulatedClick && !event._simulated) {
        _leaflet2.default.DomEvent.stop(event);
        return false;
      }

      _leaflet2.default.DomEvent._lastClick = timeStamp;
      return true;
    }
  }, {
    key: '_detectIE',
    value: function _detectIE() {
      var ua = window.navigator.userAgent;

      var msie = ua.indexOf('MSIE ');
      if (msie > 0) {
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
      }

      var trident = ua.indexOf('Trident/');
      if (trident > 0) {
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
      }

      var edge = ua.indexOf('Edge/');
      if (edge > 0) {
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
      }

      return false;
    }
  }]);
  return TouchExtend;
}(_leaflet2.default.Handler);

_leaflet2.default.Map.addInitHook('addHandler', 'touchExtend', TouchExtend);

var TouchMarker = exports.TouchMarker = function (_L$Marker) {
  (0, _inherits3.default)(TouchMarker, _L$Marker);

  function TouchMarker() {
    (0, _classCallCheck3.default)(this, TouchMarker);
    return (0, _possibleConstructorReturn3.default)(this, (TouchMarker.__proto__ || Object.getPrototypeOf(TouchMarker)).apply(this, arguments));
  }

  (0, _createClass3.default)(TouchMarker, [{
    key: '_initInteraction',
    value: function _initInteraction() {
      if (!this.addInteractiveTarget) return this._initInteractionLegacy();

      return (0, _get3.default)(TouchMarker.prototype.__proto__ || Object.getPrototypeOf(TouchMarker.prototype), '_initInteraction', this).call(this);
    }
  }, {
    key: '_initInteractionLegacy',
    value: function _initInteractionLegacy() {
      var _this3 = this;

      if (!this.options.clickable) return;

      var icon = this._icon;
      var events = ['dblclick', 'mousedown', 'mouseover', 'mouseout', 'contextmenu', 'touchstart', 'touchend', 'touchmove'];
      if (TouchMarker._detectIE) events.concat(['MSPointerDown', 'MSPointerUp', 'MSPointerMove', 'MSPointerCancel']);else events.concat(['touchcancel']);

      _leaflet2.default.DomUtil.addClass(icon, 'leaflet-clickable');
      _leaflet2.default.DomEvent.on(icon, 'click', this._onMouseClick, this);
      _leaflet2.default.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

      events.forEach(function (event) {
        return _leaflet2.default.DomEvent.on(icon, event, _this3._fireMouseEvent, _this3);
      });

      if (_leaflet2.default.Handler.MarkerDrag) {
        this.dragging = new _leaflet2.default.Handler.MarkerDrag(this);

        if (this.options.draggable) this.dragging.enable();
      }
    }
  }], [{
    key: '_detectIE',
    value: function _detectIE() {
      var ua = window.navigator.userAgent;

      var msie = ua.indexOf('MSIE ');
      if (msie > 0) {
        return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
      }

      var trident = ua.indexOf('Trident/');
      if (trident > 0) {
        var rv = ua.indexOf('rv:');
        return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
      }

      var edge = ua.indexOf('Edge/');
      if (edge > 0) {
        return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
      }

      return false;
    }
  }]);
  return TouchMarker;
}(_leaflet2.default.Marker);