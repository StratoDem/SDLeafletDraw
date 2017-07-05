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

var _draw = require('../../draw');

var _draw2 = _interopRequireDefault(_draw);

var _Event = require('../../Event');

var _Event2 = _interopRequireDefault(_Event);

var _Tooltip = require('../../Tooltip');

var _Tooltip2 = _interopRequireDefault(_Tooltip);

var _index = require('../../ext/index');

var _constants = require('./constants');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** 
 * StratoDem Analytics : Edit
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

var BaseEdit = function (_L$Handler) {
  (0, _inherits3.default)(BaseEdit, _L$Handler);

  function BaseEdit() {
    (0, _classCallCheck3.default)(this, BaseEdit);
    return (0, _possibleConstructorReturn3.default)(this, (BaseEdit.__proto__ || Object.getPrototypeOf(BaseEdit)).apply(this, arguments));
  }

  (0, _createClass3.default)(BaseEdit, [{
    key: 'initialize',
    value: function initialize(map, options) {
      (0, _get3.default)(BaseEdit.prototype.__proto__ || Object.getPrototypeOf(BaseEdit.prototype), 'initialize', this).call(this, map);
      _leaflet2.default.setOptions(this, options);

      // Store the selectable layer group for ease of access
      this._featureGroup = options.featureGroup;

      if (!(this._featureGroup instanceof _leaflet2.default.FeatureGroup)) {
        throw new Error('options.featureGroup must be a L.FeatureGroup');
      }

      this._uneditedLayerProps = {};

      // Save the type so super can fire, need to do this as cannot do this.TYPE :(
      this.type = BaseEdit.TYPE;
    }

    /** Enable the edit toolbar **/

  }, {
    key: 'enable',
    value: function enable() {
      if (this._enabled || !this._hasAvailableLayers()) return;
      this.fire('enabled', { handler: this.type });
      // this disable other handlers
      this._map.fire(_Event2.default.EDITSTART, { handler: this.type });

      // allow drawLayer to be updated before beginning edition.
      (0, _get3.default)(BaseEdit.prototype.__proto__ || Object.getPrototypeOf(BaseEdit.prototype), 'enable', this).call(this);
      this._featureGroup.on('layeradd', this._enableLayerEdit, this).on('layerremove', this._disableLayerEdit, this);
    }

    /** Disable the edit toolbar **/

  }, {
    key: 'disable',
    value: function disable() {
      if (!this._enabled) return;

      this._featureGroup.off('layeradd', this._enableLayerEdit, this).off('layerremove', this._disableLayerEdit, this);
      (0, _get3.default)(BaseEdit.prototype.__proto__ || Object.getPrototypeOf(BaseEdit.prototype), 'disable', this).call(this);
      this._map.fire(_Event2.default.EDITSTOP, { handler: this.type });
      this.fire('disabled', { handler: this.type });
    }

    /** Add listener hooks for this handler **/

  }, {
    key: 'addHooks',
    value: function addHooks() {
      if (this._map) {
        this._map.getContainer().focus();

        this._featureGroup.eachLayer(this._enableLayerEdit, this);

        this._tooltip = new _Tooltip2.default(this._map);
        this._tooltip.updateContent({
          text: _draw2.default.edit.handlers.edit.tooltip.text,
          subtext: _draw2.default.edit.handlers.edit.tooltip.subtext
        });

        // Quickly access the tooltip to update for intersection checking
        this._map._editTooltip = this._tooltip;

        this._updateTooltip();

        this._map.on('mousemove', this._onMouseMove, this).on('touchmove', this._onMouseMove, this).on('MSPointerMove', this._onMouseMove, this).on(_Event2.default.EDITVERTEX, this._updateTooltip, this);
      }
    }

    /** Remove listener hooks for this handler **/

  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      if (this._map) {
        // Clean up selected layers.
        this._featureGroup.eachLayer(this._disableLayerEdit, this);

        // Clear the backups of the original layers
        this._uneditedLayerProps = {};

        this._tooltip.dispose();
        this._tooltip = null;

        this._map.off('mousemove', this._onMouseMove, this).off('touchmove', this._onMouseMove, this).off('MSPointerMove', this._onMouseMove, this).off(_Event2.default.EDITVERTEX, this._updateTooltip, this);
      }
    }

    /** Revert each layer's geometry changes **/

  }, {
    key: 'revertLayers',
    value: function revertLayers() {
      this._featureGroup.eachLayer(function revertLayer(layer) {
        this._revertLayer(layer);
      }, this);
    }
  }, {
    key: 'save',
    value: function save() {
      var editedLayers = new _leaflet2.default.LayerGroup();
      this._featureGroup.eachLayer(function (layer) {
        if (layer.edited) {
          editedLayers.addLayer(layer);
          // eslint-disable-next-line
          layer.edited = false; // TODO no reassignment
        }
      });
      this._map.fire(_Event2.default.EDITED, { layers: editedLayers });
    }
  }, {
    key: '_backupLayer',
    value: function _backupLayer(layer) {
      var id = _leaflet2.default.Util.stamp(layer);

      if (!this._uneditedLayerProps[id]) {
        // Polyline, Polygon or Rectangle
        if (layer instanceof _leaflet2.default.Polyline || layer instanceof _leaflet2.default.Polygon || layer instanceof _leaflet2.default.Rectangle) {
          this._uneditedLayerProps[id] = {
            latlngs: _index.LatLngUtil.cloneLatLngs(layer.getLatLngs())
          };
        } else if (layer instanceof _leaflet2.default.Circle) {
          this._uneditedLayerProps[id] = {
            latlng: _index.LatLngUtil.cloneLatLng(layer.getLatLng()),
            radius: layer.getRadius()
          };
        } else if (layer instanceof _leaflet2.default.Marker) {
          // Marker
          this._uneditedLayerProps[id] = {
            latlng: _index.LatLngUtil.cloneLatLng(layer.getLatLng())
          };
        }
      }
    }
  }, {
    key: '_updateTooltip',
    value: function _updateTooltip() {
      this._tooltip.updateContent(BaseEdit._getTooltipText());
    }
  }, {
    key: '_revertLayer',
    value: function _revertLayer(layer) {
      var id = _leaflet2.default.Util.stamp(layer);
      // eslint-disable-next-line
      layer.edited = false; // TODO no reassignment
      if (id in this._uneditedLayerProps) {
        // Polyline, Polygon or Rectangle
        if (layer instanceof _leaflet2.default.Polyline || layer instanceof _leaflet2.default.Polygon || layer instanceof _leaflet2.default.Rectangle) {
          layer.setLatLngs(this._uneditedLayerProps[id].latlngs);
        } else if (layer instanceof _leaflet2.default.Circle) {
          layer.setLatLng(this._uneditedLayerProps[id].latlng);
          layer.setRadius(this._uneditedLayerProps[id].radius);
        } else if (layer instanceof _leaflet2.default.Marker) {
          // Marker
          layer.setLatLng(this._uneditedLayerProps[id].latlng);
        }

        layer.fire('revert-edited', { layer: layer });
      }
    }
  }, {
    key: '_enableLayerEdit',
    value: function _enableLayerEdit(event) {
      var layer = event.layer || event.target || event;

      // Back up this layer (if haven't before)
      this._backupLayer(layer);

      if (this.options.poly) {
        // $FlowFixMe
        layer.options.poly = _leaflet2.default.Util.extend({}, this.options.poly);
      }

      // Set different style for editing mode
      if (this.options.selectedPathOptions) {
        var pathOptions = _leaflet2.default.Util.extend({}, this.options.selectedPathOptions);

        // Use the existing color of the layer
        if (pathOptions.maintainColor) {
          // $FlowFixMe
          pathOptions.color = layer.options.color;
          // $FlowFixMe
          pathOptions.fillColor = layer.options.fillColor;
        }

        // $FlowFixMe
        layer.options.original = _leaflet2.default.extend({}, layer.options);
        // $FlowFixMe
        layer.options.editing = pathOptions;
      }

      if (layer instanceof _leaflet2.default.Marker) {
        if (layer.editing) layer.editing.enable();
        layer.dragging.enable();
        layer.on('dragend', this._onMarkerDragEnd)
        // #TODO: remove when leaflet finally fixes their draggable so it's touch friendly again.
        .on('touchmove', this._onTouchMove, this).on('MSPointerMove', this._onTouchMove, this).on('touchend', this._onMarkerDragEnd, this).on('MSPointerUp', this._onMarkerDragEnd, this);
      } else // $FlowFixMe
        layer.editing.enable();
    }
  }, {
    key: '_disableLayerEdit',
    value: function _disableLayerEdit(event) {
      var layer = event.layer || event.target || event;

      // $FlowFixMe
      layer.edited = false;
      if (layer.editing) // $FlowFixMe
        layer.editing.disable();

      // $FlowFixMe
      delete layer.options.editing;
      // $FlowFixMe
      delete layer.options.original;
      // Reset layer styles to that of before select
      if (this._selectedPathOptions) {
        if (layer instanceof _leaflet2.default.Marker) {
          this._toggleMarkerHighlight(layer);
        } else {
          // reset the layer style to what is was before being selected
          // $FlowFixMe
          layer.setStyle(layer.options.previousOptions);
          // remove the cached options for the layer object
          // $FlowFixMe
          delete layer.options.previousOptions;
        }
      }

      if (layer instanceof _leaflet2.default.Marker) {
        layer.dragging.disable();
        layer.off('dragend', this._onMarkerDragEnd, this).off('touchmove', this._onTouchMove, this).off('MSPointerMove', this._onTouchMove, this).off('touchend', this._onMarkerDragEnd, this).off('MSPointerUp', this._onMarkerDragEnd, this);
      } else // $FlowFixMe
        layer.editing.disable();
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      this._tooltip.updatePosition(event.latlng);
    }
  }, {
    key: '_onMarkerDragEnd',
    value: function _onMarkerDragEnd(event) {
      var layer = event.target;
      layer.edited = true;
      this._map.fire(_Event2.default.EDITMOVE, { layer: layer });
    }
  }, {
    key: '_onTouchMove',
    value: function _onTouchMove(event) {
      var touchEvent = event.originalEvent.changedTouches[0];
      var layerPoint = this._map.mouseEventToLayerPoint(touchEvent);
      var latlng = this._map.layerPointToLatLng(layerPoint);
      event.target.setLatLng(latlng);
    }
  }, {
    key: '_hasAvailableLayers',
    value: function _hasAvailableLayers() {
      return this._featureGroup.getLayers().length !== 0;
    }
  }], [{
    key: '_getTooltipText',
    value: function _getTooltipText() {
      return {
        text: _draw2.default.edit.handlers.edit.tooltip.text,
        subtext: _draw2.default.edit.handlers.edit.tooltip.subtext
      };
    }
  }]);
  return BaseEdit;
}(_leaflet2.default.Handler);

BaseEdit.TYPE = _constants.TYPE_EDIT;


var Edit = BaseEdit.extend({ includes: _leaflet2.default.Evented.prototype });
exports.default = Edit;

//# sourceMappingURL=Edit.js.map