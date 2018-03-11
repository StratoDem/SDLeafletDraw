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

var _draw = require('../../draw');

var _draw2 = _interopRequireDefault(_draw);

var _Event = require('../../Event');

var _Event2 = _interopRequireDefault(_Event);

var _Tooltip = require('../../Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseDelete = function (_L$Handler) {
  (0, _inherits3.default)(BaseDelete, _L$Handler);

  function BaseDelete() {
    (0, _classCallCheck3.default)(this, BaseDelete);
    return (0, _possibleConstructorReturn3.default)(this, (BaseDelete.__proto__ || Object.getPrototypeOf(BaseDelete)).apply(this, arguments));
  }

  (0, _createClass3.default)(BaseDelete, [{
    key: 'initialize',
    value: function initialize(map, options) {
      _leaflet2.default.Handler.prototype.initialize.call(this, map);

      _leaflet2.default.Util.setOptions(this, options);

      this._deletableLayers = this.options.featureGroup;

      if (!(this._deletableLayers instanceof _leaflet2.default.FeatureGroup)) {
        throw new Error('options.featureGroup must be a L.FeatureGroup');
      }

      this.type = BaseDelete.TYPE;
    }
  }, {
    key: 'enable',
    value: function enable() {
      if (this._enabled || !this._hasAvailableLayers()) {
        return;
      }
      this.fire('enabled', { handler: this.type });

      this._map.fire(_Event2.default.DELETESTART, { handler: this.type });

      _leaflet2.default.Handler.prototype.enable.call(this);

      this._deletableLayers.on('layeradd', this._enableLayerDelete, this).on('layerremove', this._disableLayerDelete, this);
    }
  }, {
    key: 'disable',
    value: function disable() {
      if (!this._enabled) return;

      this._deletableLayers.off('layeradd', this._enableLayerDelete, this).off('layerremove', this._disableLayerDelete, this);

      _leaflet2.default.Handler.prototype.disable.call(this);

      this._map.fire(_Event2.default.DELETESTOP, { handler: this.type });

      this.fire('disabled', { handler: this.type });
    }
  }, {
    key: 'addHooks',
    value: function addHooks() {
      if (this._map) {
        this._map.getContainer().focus();

        this._deletableLayers.eachLayer(this._enableLayerDelete, this);
        this._deletedLayers = new _leaflet2.default.LayerGroup();

        this._tooltip = new _Tooltip2.default(this._map);
        this._tooltip.updateContent({ text: _draw2.default.edit.handlers.remove.tooltip.text });

        this._map.on('mousemove', this._onMouseMove, this);
      }
    }
  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      if (this._map) {
        this._deletableLayers.eachLayer(this._disableLayerDelete, this);
        this._deletedLayers = null;

        this._tooltip.dispose();
        this._tooltip = null;

        this._map.off('mousemove', this._onMouseMove, this);
      }
    }
  }, {
    key: 'revertLayers',
    value: function revertLayers() {
      this._deletedLayers.eachLayer(function revertLayer(layer) {
        this._deletableLayers.addLayer(layer);
        layer.fire('revert-deleted', { layer: layer });
      }, this);
    }
  }, {
    key: 'save',
    value: function save() {
      this._map.fire(_Event2.default.DELETED, { layers: this._deletedLayers });
    }
  }, {
    key: 'removeAllLayers',
    value: function removeAllLayers() {
      this._deletableLayers.eachLayer(function removeLayer(layer) {
        this._removeLayer({ layer: layer });
      }, this);
      this.save();
    }
  }, {
    key: '_enableLayerDelete',
    value: function _enableLayerDelete(event) {
      var layer = event.layer || event.target || event;

      layer.on('click', this._removeLayer, this);
    }
  }, {
    key: '_disableLayerDelete',
    value: function _disableLayerDelete(event) {
      var layer = event.layer || event.target || event;

      layer.off('click', this._removeLayer, this);

      this._deletedLayers.removeLayer(layer);
    }
  }, {
    key: '_removeLayer',
    value: function _removeLayer(event) {
      var layer = event.layer || event.target || event;

      this._deletableLayers.removeLayer(layer);

      this._deletedLayers.addLayer(layer);

      layer.fire('deleted');
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      this._tooltip.updatePosition(event.latlng);
    }
  }, {
    key: '_hasAvailableLayers',
    value: function _hasAvailableLayers() {
      return this._deletableLayers.getLayers().length !== 0;
    }
  }]);
  return BaseDelete;
}(_leaflet2.default.Handler);

BaseDelete.TYPE = _constants.TYPE_REMOVE;


var Delete = BaseDelete.include(_leaflet2.default.Evented.prototype);
exports.default = Delete;