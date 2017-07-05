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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Tooltip = function (_L$Class) {
  (0, _inherits3.default)(Tooltip, _L$Class);

  function Tooltip(map) {
    (0, _classCallCheck3.default)(this, Tooltip);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Tooltip.__proto__ || Object.getPrototypeOf(Tooltip)).call(this));

    _this._map = map;
    _this._popupPane = _this._map._panes.popupPane;
    _this._visible = false;

    _this._container = _this._map.options.drawControlTooltips ? _leaflet2.default.DomUtil.create('div', 'leaflet-draw-tooltip', _this._popupPane) : null;
    _this._singleLineLabel = false;

    _this._map.on('mouseout', _this._onMouseOut, _this);
    return _this;
  }

  (0, _createClass3.default)(Tooltip, [{
    key: 'dispose',
    value: function dispose() {
      this._map.off('mouseout', this._onMouseOut, this);

      if (this._container) {
        this._popupPane.removeChild(this._container);
        this._container = null;
      }
    }
  }, {
    key: 'updateContent',
    value: function updateContent(labelText) {
      if (!this._container) return this;

      var localText = {
        text: labelText.text,
        subtext: typeof labelText.subtext === 'string' ? labelText.subtext : ''
      };

      if (localText.subtext.length === 0 && !this._singleLineLabel) {
        _leaflet2.default.DomUtil.addClass(this._container, 'leaflet-draw-tooltip-single');
        this._singleLineLabel = true;
      } else if (localText.subtext.length > 0 && this._singleLineLabel) {
        _leaflet2.default.DomUtil.removeClass(this._container, 'leaflet-draw-tooltip-single');
        this._singleLineLabel = false;
      }

      var subtext = localText.subtext.length > 0 ? '<span class="leaflet-draw-tooltip-subtext">' + localText.subtext + '</span><br />' : '';
      this._container.innerHTML = subtext + '<span>' + localText.text + '</span>';

      if (!localText.text && !localText.subtext) {
        this._visible = false;
        this._container.style.visibility = 'hidden';
      } else {
        this._visible = true;
        this._container.style.visibility = 'inherit';
      }

      return this;
    }
  }, {
    key: 'updatePosition',
    value: function updatePosition(latlng) {
      var pos = this._map.latLngToLayerPoint(latlng);
      var tooltipContainer = this._container;

      if (this._container) {
        if (this._visible) tooltipContainer.style.visibility = 'inherit';
        _leaflet2.default.DomUtil.setPosition(tooltipContainer, pos);
      }

      return this;
    }
  }, {
    key: 'showAsError',
    value: function showAsError() {
      if (this._container) _leaflet2.default.DomUtil.addClass(this._container, 'leaflet-error-draw-tooltip');
      return this;
    }
  }, {
    key: 'removeError',
    value: function removeError() {
      if (this._container) _leaflet2.default.DomUtil.removeClass(this._container, 'leaflet-error-draw-tooltip');
      return this;
    }
  }, {
    key: '_onMouseOut',
    value: function _onMouseOut() {
      if (this._container) this._container.style.visibility = 'hidden';
    }
  }]);
  return Tooltip;
}(_leaflet2.default.Class);

exports.default = Tooltip;