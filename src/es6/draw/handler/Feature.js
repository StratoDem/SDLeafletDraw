/** @flow
 * StratoDem Analytics : Draw.Feature
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import Event from '../../Event';
import Tooltip from '../../Tooltip';


class BaseFeature extends L.Handler {
  initialize(map: L.Map, options: Object): void {
    this._map = map;
    this._container = map._container;
    this._overlayPane = map._panes.overlayPane;
    this._popupPane = map._panes.popupPane;

    L.setOptions(this, options);
  }

  enable(): void {
    if (this._enabled)
      return;

    super.enable();
    this.fire('enabled', { handler: this.type });

    this._map.fire(Event.DRAWSTART, { layerType: this.type });
  }

  disable(): void {
    if (!this._enabled)
      return;

    super.disable();

    this._map.fire(Event.DRAWSTOP, { layerType: this.type });

    this.fire('disabled', { handler: this.type });
  }

  /** Adds event listeners to this handler */
  addHooks(): void {
    if (this._map) {
      L.DomUtil.disableTextSelection();

      this._map.getContainer().focus();
      console.log('creating tooltip');
      this._tooltip = new Tooltip(this._map);

      L.DomEvent.on(this._container, 'keyup', this._cancelDrawing, this);
    }
  }

  /** Removes event listeners from this handler */
  removeHooks(): void {
    if (this._map) {
      L.DomUtil.enableTextSelection();

      this._tooltip.dispose();
      this._tooltip = null;

      L.DomEvent.off(this._container, 'keyup', this._cancelDrawing, this);
    }
  }

  /** Sets new options to this handler */
  setOptions(options: Object): void {
    L.setOptions(this, options);
  }

  _fireCreatedEvent(layer: L.Layer) {
    this._map.fire(Event.CREATED, { layer, layerType: this.type });
  }

  /** Cancel the drawing when the escape key is pressed */
  _cancelDrawing(event: {keyCode: number}): void {
    this._map.fire('draw:canceled', { layerType: this.type });
    if (event.keyCode === 27) {
      this.disable();
    }
  }
}

const Feature = BaseFeature.extend({includes: L.Evented.prototype});
export default Feature;
