/** @flow
 * StratoDem Analytics : Delete
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
import { TYPE_REMOVE } from './constants';


class BaseDelete extends L.Handler {
  _deleteableLayers: L.FeatureGroup;
  _map: L.Map;

  static TYPE = TYPE_REMOVE;

  initialize(map: L.Map, options: Object) {
    L.Handler.prototype.initialize.call(this, map);

    L.Util.setOptions(this, options);

    // Store the selectable layer group for ease of access
    this._deletableLayers = this.options.featureGroup;

    if (!(this._deletableLayers instanceof L.FeatureGroup)) {
      throw new Error('options.featureGroup must be a L.FeatureGroup');
    }

    // Save the type so super can fire, need to do this as cannot do this.TYPE :(
    this.type = BaseDelete.TYPE;
  }

  /** Enable the delete toolbar **/
  enable(): void {
    if (this._enabled || !this._hasAvailableLayers()) {
      return;
    }
    this.fire('enabled', { handler: this.type });

    this._map.fire(Event.DELETESTART, { handler: this.type });

    L.Handler.prototype.enable.call(this);

    this._deletableLayers
      .on('layeradd', this._enableLayerDelete, this)
      .on('layerremove', this._disableLayerDelete, this);
  }

  /** Disable the delete toolbar **/
  disable(): void {
    if (!this._enabled)
      return;

    this._deletableLayers
      .off('layeradd', this._enableLayerDelete, this)
      .off('layerremove', this._disableLayerDelete, this);

    L.Handler.prototype.disable.call(this);

    this._map.fire(Event.DELETESTOP, { handler: this.type });

    this.fire('disabled', { handler: this.type });
  }

  /** Add listener hooks to this handler **/
  addHooks(): void {
    if (this._map) {
      this._map.getContainer().focus();

      this._deletableLayers.eachLayer(this._enableLayerDelete, this);
      this._deletedLayers = new L.LayerGroup();

      // TODO replace this
      this._tooltip = new Tooltip(this._map);
      this._tooltip.updateContent({ text: drawLocal.edit.handlers.remove.tooltip.text });

      this._map.on('mousemove', this._onMouseMove, this);
    }
  }

  /** Remove listener hooks from this handler **/
  removeHooks(): void {
    if (this._map) {
      this._deletableLayers.eachLayer(this._disableLayerDelete, this);
      this._deletedLayers = null;

      this._tooltip.dispose();
      this._tooltip = null;

      this._map.off('mousemove', this._onMouseMove, this);
    }
  }

  /** Rever the deleted layers back to their prior state **/
  revertLayers(): void {
    // Iterate of the deleted layers and add them back into the featureGroup
    this._deletedLayers.eachLayer(function revertLayer(layer) {
      this._deletableLayers.addLayer(layer);
      layer.fire('revert-deleted', {layer});
    }, this);
  }

  /** Save deleted layers **/
  save(): void {
    this._map.fire(Event.DELETED, { layers: this._deletedLayers });
  }

  /** Remove all layers that can be deleted **/
  removeAllLayers(): void {
    // Iterate over layers and remove them
    this._deletableLayers.eachLayer(function removeLayer(layer) {
      this._removeLayer({layer});
    }, this);
    this.save();
  }

  _enableLayerDelete(event: {layer?: L.Layer, target?: L.Layer} | L.Layer): void {
    const layer = event.layer || event.target || event;

    // $FlowFixMe
    layer.on('click', this._removeLayer, this);
  }

  _disableLayerDelete(event: {layer?: L.Layer, target?: L.Layer} | L.Layer): void {
    const layer = event.layer || event.target || event;

    // $FlowFixMe
    layer.off('click', this._removeLayer, this);

    // Remove from the deleted layers so we can't accidentally revert if the user presses cancel
    this._deletedLayers.removeLayer(layer);
  }

  _removeLayer(event: {layer?: L.Layer, target?: L.Layer} | L.Layer): void {
    const layer = event.layer || event.target || event;

    this._deletableLayers.removeLayer(layer);

    this._deletedLayers.addLayer(layer);

    // $FlowFixMe
    layer.fire('deleted');
  }

  _onMouseMove(event: {latlng: L.LatLng}): void {
    this._tooltip.updatePosition(event.latlng);
  }

  _hasAvailableLayers(): boolean {
    return this._deletableLayers.getLayers().length !== 0;
  }
}

const Delete = BaseDelete.extend({includes: L.Evented.prototype});
export default Delete;
