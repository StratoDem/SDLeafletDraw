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

var _Event = require('../../Event');

var _Event2 = _interopRequireDefault(_Event);

var _Tooltip = require('../../Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseFeature = function (_L$Handler) {
  (0, _inherits3.default)(BaseFeature, _L$Handler);

  function BaseFeature() {
    (0, _classCallCheck3.default)(this, BaseFeature);
    return (0, _possibleConstructorReturn3.default)(this, (BaseFeature.__proto__ || Object.getPrototypeOf(BaseFeature)).apply(this, arguments));
  }

  (0, _createClass3.default)(BaseFeature, [{
    key: 'initialize',
    value: function initialize(map, options) {
      this._map = map;
      this._container = map._container;
      this._overlayPane = map._panes.overlayPane;
      this._popupPane = map._panes.popupPane;

      _leaflet2.default.setOptions(this, options);
    }
  }, {
    key: 'enable',
    value: function enable() {
      if (this._enabled) return;

      (0, _get3.default)(BaseFeature.prototype.__proto__ || Object.getPrototypeOf(BaseFeature.prototype), 'enable', this).call(this);
      this.fire('enabled', { handler: this.type });

      this._map.fire(_Event2.default.DRAWSTART, { layerType: this.type });
    }
  }, {
    key: 'disable',
    value: function disable() {
      if (!this._enabled) return;

      (0, _get3.default)(BaseFeature.prototype.__proto__ || Object.getPrototypeOf(BaseFeature.prototype), 'disable', this).call(this);

      this._map.fire(_Event2.default.DRAWSTOP, { layerType: this.type });

      this.fire('disabled', { handler: this.type });
    }

    /** Adds event listeners to this handler **/

  }, {
    key: 'addHooks',
    value: function addHooks() {
      if (this._map) {
        _leaflet2.default.DomUtil.disableTextSelection();

        this._map.getContainer().focus();
        console.log('creating tooltip');
        this._tooltip = new _Tooltip2.default(this._map);

        _leaflet2.default.DomEvent.on(this._container, 'keyup', this._cancelDrawing, this);
      }
    }

    /** Removes event listeners from this handler **/

  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      if (this._map) {
        _leaflet2.default.DomUtil.enableTextSelection();

        this._tooltip.dispose();
        this._tooltip = null;

        _leaflet2.default.DomEvent.off(this._container, 'keyup', this._cancelDrawing, this);
      }
    }

    /** Sets new options to this handler **/

  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      _leaflet2.default.setOptions(this, options);
    }
  }, {
    key: '_fireCreatedEvent',
    value: function _fireCreatedEvent(layer) {
      this._map.fire(_Event2.default.CREATED, { layer: layer, layerType: this.type });
    }

    /** Cancel the drawing when the escape key is pressed **/

  }, {
    key: '_cancelDrawing',
    value: function _cancelDrawing(event) {
      this._map.fire('draw:canceled', { layerType: this.type });
      if (event.keyCode === 27) {
        this.disable();
      }
    }
  }]);
  return BaseFeature;
}(_leaflet2.default.Handler); /** 
                               * StratoDem Analytics : Draw.Feature
                               * Principal Author(s) : Michael Clawar
                               * Secondary Author(s) :
                               * Description :
                               *
                               *  (c) 2016- StratoDem Analytics, LLC
                               *  All Rights Reserved
                               */

var Feature = BaseFeature.extend({ includes: _leaflet2.default.Evented.prototype });
exports.default = Feature;

//# sourceMappingURL=Feature.js.map