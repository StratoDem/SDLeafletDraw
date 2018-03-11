/** @flow
 * StratoDem Analytics : Edit
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import drawLocal from '../../draw';
import Event from '../../Event';
import Tooltip from '../../Tooltip';
import { LatLngUtil } from '../../ext/index';
import { TYPE_EDIT } from './constants';


type T_ORIGINAL_EVENT = {
  clientX: number,
  clientY: number,
  latlng: L.LatLng,
  changedTouches: Array<{clientX: number, clientY: number}>,
};


class BaseEdit extends L.Handler {
  _enabled: boolean;
  _featureGroup: L.FeatureGroup;
  _map: L.Map;
  _uneditedLayerProps: Object;
  type: string;

  static TYPE = TYPE_EDIT;

  static _getTooltipText(): {text: string, subtext: string} {
    return ({
      text: drawLocal.edit.handlers.edit.tooltip.text,
      subtext: drawLocal.edit.handlers.edit.tooltip.subtext,
    });
  }

  initialize(map: L.Map, options: Object): void {
    super.initialize(map);
    L.setOptions(this, options);

    // Store the selectable layer group for ease of access
    this._featureGroup = options.featureGroup;

    if (!(this._featureGroup instanceof L.FeatureGroup)) {
      throw new Error('options.featureGroup must be a L.FeatureGroup');
    }

    this._uneditedLayerProps = {};

    // Save the type so super can fire, need to do this as cannot do this.TYPE :(
    this.type = BaseEdit.TYPE;
  }

  /** Enable the edit toolbar */
  enable(): void {
    if (this._enabled || !this._hasAvailableLayers())
      return;
    this.fire('enabled', { handler: this.type });
    // this disable other handlers
    this._map.fire(Event.EDITSTART, { handler: this.type });

    // allow drawLayer to be updated before beginning edition.
    super.enable();
    this._featureGroup
      .on('layeradd', this._enableLayerEdit, this)
      .on('layerremove', this._disableLayerEdit, this);
  }

  /** Disable the edit toolbar */
  disable(): void {
    if (!this._enabled)
      return;

    this._featureGroup
      .off('layeradd', this._enableLayerEdit, this)
      .off('layerremove', this._disableLayerEdit, this);
    super.disable();
    this._map.fire(Event.EDITSTOP, { handler: this.type });
    this.fire('disabled', { handler: this.type });
  }

  /** Add listener hooks for this handler */
  addHooks(): void {
    if (this._map) {
      this._map.getContainer().focus();

      this._featureGroup.eachLayer(this._enableLayerEdit, this);

      this._tooltip = new Tooltip(this._map);
      this._tooltip.updateContent({
        text: drawLocal.edit.handlers.edit.tooltip.text,
        subtext: drawLocal.edit.handlers.edit.tooltip.subtext,
      });

      // Quickly access the tooltip to update for intersection checking
      this._map._editTooltip = this._tooltip;

      this._updateTooltip();

      this._map
        .on('mousemove', this._onMouseMove, this)
        .on('touchmove', this._onMouseMove, this)
        .on('MSPointerMove', this._onMouseMove, this)
        .on(Event.EDITVERTEX, this._updateTooltip, this);
    }
  }

  /** Remove listener hooks for this handler */
  removeHooks(): void {
    if (this._map) {
      // Clean up selected layers.
      this._featureGroup.eachLayer(this._disableLayerEdit, this);

      // Clear the backups of the original layers
      this._uneditedLayerProps = {};

      this._tooltip.dispose();
      this._tooltip = null;

      this._map
        .off('mousemove', this._onMouseMove, this)
        .off('touchmove', this._onMouseMove, this)
        .off('MSPointerMove', this._onMouseMove, this)
        .off(Event.EDITVERTEX, this._updateTooltip, this);
    }
  }

  /** Revert each layer's geometry changes */
  revertLayers(): void {
    this._featureGroup.eachLayer(function revertLayer(layer) {
      this._revertLayer(layer);
    }, this);
  }

  save(): void {
    const editedLayers = new L.LayerGroup();
    this._featureGroup.eachLayer((layer) => {
      if (layer.edited) {
        editedLayers.addLayer(layer);
        // eslint-disable-next-line
        layer.edited = false; // TODO no reassignment
      }
    });
    this._map.fire(Event.EDITED, { layers: editedLayers });
  }

  _backupLayer(layer: L.Layer): void {
    const id = L.Util.stamp(layer);

    if (!this._uneditedLayerProps[id]) {
      // Polyline, Polygon or Rectangle
      if (layer instanceof L.Polyline
        || layer instanceof L.Polygon
        || layer instanceof L.Rectangle) {
        this._uneditedLayerProps[id] = {
          latlngs: LatLngUtil.cloneLatLngs(layer.getLatLngs()),
        };
      } else if (layer instanceof L.Circle) {
        this._uneditedLayerProps[id] = {
          latlng: LatLngUtil.cloneLatLng(layer.getLatLng()),
          radius: layer.getRadius(),
        };
      } else if (layer instanceof L.Marker) { // Marker
        this._uneditedLayerProps[id] = {
          latlng: LatLngUtil.cloneLatLng(layer.getLatLng()),
        };
      }
    }
  }

  _updateTooltip(): void {
    this._tooltip.updateContent(BaseEdit._getTooltipText());
  }

  _revertLayer(layer: L.Layer): void {
    const id = L.Util.stamp(layer);
    // eslint-disable-next-line
    layer.edited = false; // TODO no reassignment
    if (id in this._uneditedLayerProps) {
      // Polyline, Polygon or Rectangle
      if (layer instanceof L.Polyline
        || layer instanceof L.Polygon
        || layer instanceof L.Rectangle) {
        layer.setLatLngs(this._uneditedLayerProps[id].latlngs);
      } else if (layer instanceof L.Circle) {
        layer.setLatLng(this._uneditedLayerProps[id].latlng);
        layer.setRadius(this._uneditedLayerProps[id].radius);
      } else if (layer instanceof L.Marker) { // Marker
        layer.setLatLng(this._uneditedLayerProps[id].latlng);
      }

      layer.fire('revert-edited', {layer});
    }
  }

  _enableLayerEdit(event: {layer?: L.Layer, target?: L.Layer} | L.Layer): void {
    const layer = event.layer || event.target || event;

    // Back up this layer (if haven't before)
    this._backupLayer(layer);

    if (this.options.poly) {
      // $FlowFixMe
      layer.options.poly = L.Util.extend({}, this.options.poly);
    }

    // Set different style for editing mode
    if (this.options.selectedPathOptions) {
      const pathOptions = L.Util.extend({}, this.options.selectedPathOptions);

      // Use the existing color of the layer
      if (pathOptions.maintainColor) {
        // $FlowFixMe
        pathOptions.color = layer.options.color;
        // $FlowFixMe
        pathOptions.fillColor = layer.options.fillColor;
      }

      // $FlowFixMe
      layer.options.original = L.extend({}, layer.options);
      // $FlowFixMe
      layer.options.editing = pathOptions;
    }

    if (layer instanceof L.Marker) {
      if (layer.editing)
        layer.editing.enable();
      layer.dragging.enable();
      layer
        .on('dragend', this._onMarkerDragEnd)
        // #TODO: remove when leaflet finally fixes their draggable so it's touch friendly again.
        .on('touchmove', this._onTouchMove, this)
        .on('MSPointerMove', this._onTouchMove, this)
        .on('touchend', this._onMarkerDragEnd, this)
        .on('MSPointerUp', this._onMarkerDragEnd, this);
    } else // $FlowFixMe
      layer.editing.enable();
  }

  _disableLayerEdit(event: {layer?: L.Layer, target?: L.Layer} | L.Layer): void {
    const layer = event.layer || event.target || event;

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
      if (layer instanceof L.Marker) {
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

    if (layer instanceof L.Marker) {
      layer.dragging.disable();
      layer
        .off('dragend', this._onMarkerDragEnd, this)
        .off('touchmove', this._onTouchMove, this)
        .off('MSPointerMove', this._onTouchMove, this)
        .off('touchend', this._onMarkerDragEnd, this)
        .off('MSPointerUp', this._onMarkerDragEnd, this);
    } else // $FlowFixMe
      layer.editing.disable();
  }

  _onMouseMove(event: {latlng: L.LatLng}): void {
    this._tooltip.updatePosition(event.latlng);
  }

  _onMarkerDragEnd(event: {target: L.Layer}): void {
    const layer = event.target;
    layer.edited = true;
    this._map.fire(Event.EDITMOVE, {layer});
  }

  _onTouchMove(event: {originalEvent: T_ORIGINAL_EVENT, target: Object}) {
    const touchEvent = event.originalEvent.changedTouches[0];
    const layerPoint = this._map.mouseEventToLayerPoint(touchEvent);
    const latlng = this._map.layerPointToLatLng(layerPoint);
    event.target.setLatLng(latlng);
  }

  _hasAvailableLayers(): boolean {
    return this._featureGroup.getLayers().length !== 0;
  }
}

const Edit = BaseEdit.include(L.Evented.prototype);
export default Edit;
