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

var _index = require('../../ext/index');

var _Event = require('../../Event');

var _Event2 = _interopRequireDefault(_Event);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Marker = function (_L$Handler) {
  (0, _inherits3.default)(Marker, _L$Handler);

  function Marker() {
    (0, _classCallCheck3.default)(this, Marker);
    return (0, _possibleConstructorReturn3.default)(this, (Marker.__proto__ || Object.getPrototypeOf(Marker)).apply(this, arguments));
  }

  (0, _createClass3.default)(Marker, [{
    key: 'initialize',
    value: function initialize(marker, options) {
      this._marker = marker;
      _leaflet2.default.setOptions(this, options);
    }
  }, {
    key: 'addHooks',
    value: function addHooks() {
      var marker = this._marker;

      marker.dragging.enable();
      marker.on('dragend', this._onDragEnd, marker);
      this._toggleMarkerHighlight();
    }
  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      var marker = this._marker;

      marker.dragging.disable();
      marker.off('dragend', this._onDragEnd, marker);
      this._toggleMarkerHighlight();
    }
  }, {
    key: '_onDragEnd',
    value: function _onDragEnd(event) {
      var layer = event.target;
      layer.edited = true;
      this._map.fire(_Event2.default.EDITMOVE, { layer: layer });
    }
  }, {
    key: '_toggleMarkerHighlight',
    value: function _toggleMarkerHighlight() {
      var icon = this._marker._icon;

      if (!icon) return;

      icon.style.display = 'none';

      if (_leaflet2.default.DomUtil.hasClass(icon, 'leaflet-edit-marker-selected')) {
        _leaflet2.default.DomUtil.removeClass(icon, 'leaflet-edit-marker-selected');

        Marker._offsetMarker(icon, -4);
      } else {
        _leaflet2.default.DomUtil.addClass(icon, 'leaflet-edit-marker-selected');

        Marker._offsetMarker(icon, 4);
      }

      icon.style.display = '';
    }
  }], [{
    key: '_offsetMarker',
    value: function _offsetMarker(icon, offset) {
      var iconMarginTop = parseInt(icon.style.marginTop, 10) - offset;
      var iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset;

      icon.style.marginTop = iconMarginTop + 'px';

      icon.style.marginLeft = iconMarginLeft + 'px';
    }
  }]);
  return Marker;
}(_leaflet2.default.Handler);

exports.default = Marker;


_leaflet2.default.Marker.addInitHook(function addInit() {
  if (Marker) {
    this.editing = new Marker(this);

    if (this.options.editable) {
      this.editing.enable();
    }
  }
});