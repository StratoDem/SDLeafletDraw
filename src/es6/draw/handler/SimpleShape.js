/** @flow
 * StratoDem Analytics : SimpleShape
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import drawLocal from '../../draw';
import Feature from './Feature';


export type T_SIMPLESHAPE_OPTIONS = {
  shapeOptions?: {
    stroke?: boolean,
    color?: string,
    weight?: number,
    opacity?: number,
    fill?: boolean,
    fillColor?: string | null, // same as color by default
    fillOpacity?: number,
    showArea?: boolean,
    clickable?: boolean,
  },
  showRadius?: boolean,
  metric?: boolean,
  feet?: boolean,
  nautic?: boolean,
}


export default class SimpleShape extends Feature {
  initialize(map: L.Map, options: T_SIMPLESHAPE_OPTIONS): void {
    this._endLabelText = drawLocal.draw.handlers.simpleshape.tooltip.end;

    super.initialize(map, {repeatMode: false, ...options});
  }

  /** Add listener hooks to this handler */
  addHooks(): void {
    super.addHooks();
    if (this._map) {
      this._mapDraggable = this._map.dragging.enabled();

      if (this._mapDraggable) {
        this._map.dragging.disable();
      }

      // TODO refactor: move cursor to styles
      this._container.style.cursor = 'crosshair';

      this._tooltip.updateContent({ text: this._initialLabelText });

      this._map
        .on('mousedown', this._onMouseDown, this)
        .on('mousemove', this._onMouseMove, this)
        .on('touchstart', this._onMouseDown, this)
        .on('touchmove', this._onMouseMove, this);
    }
  }

  /** Remove listener hooks from this handler */
  removeHooks(): void {
    super.removeHooks();
    if (this._map) {
      if (this._mapDraggable)
        this._map.dragging.enable();

      // TODO refactor: move cursor to styles
      this._container.style.cursor = '';

      this._map
        .off('mousedown', this._onMouseDown, this)
        .off('mousemove', this._onMouseMove, this)
        .off('touchstart', this._onMouseDown, this)
        .off('touchmove', this._onMouseMove, this);

      L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);
      L.DomEvent.off(document, 'touchend', this._onMouseUp, this);

      // If the box element doesn't exist mouse hasn't moved, so don't need to destroy/return
      if (this._shape) {
        this._map.removeLayer(this._shape);
        delete this._shape;
      }
    }
    this._isDrawing = false;
  }

  _getTooltipText(): {text: string} {
    return {text: this._endLabelText};
  }

  _onMouseDown(event: {latlng: L.LatLng, originalEvent: Object}): void {
    this._isDrawing = true;
    this._startLatLng = event.latlng;

    L.DomEvent
      .on(document, 'mouseup', this._onMouseUp, this)
      .on(document, 'touchend', this._onMouseUp, this)
      .preventDefault(event.originalEvent);
  }

  _onMouseMove(event: {latlng: L.LatLng}): void {
    const latlng = event.latlng;

    this._tooltip.updatePosition(latlng);
    if (this._isDrawing) {
      this._tooltip.updateContent(this._getTooltipText());
      this._drawShape(latlng);
    }
  }

  _onMouseUp(): void {
    if (this._shape)
      this._fireCreatedEvent();

    this.disable();
    if (this.options.repeatMode)
      this.enable();
  }
}
