/** @flow
 * StratoDem Analytics : Circle
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import Event from '../../Event';
import SimpleShape from './SimpleShape';


export default class Circle extends SimpleShape {
  _createMoveMarker(): void {
    const center = this._shape.getLatLng();

    this._moveMarker = this._createMarker(center, this.options.moveIcon);
  }

  _createResizeMarker(): void {
    const center = this._shape.getLatLng();
    const resizemarkerPoint = this._getResizeMarkerPoint(center);

    this._resizeMarkers = [];
    this._resizeMarkers.push(this._createMarker(resizemarkerPoint, this.options.resizeIcon));
  }

  _getResizeMarkerPoint(latlng: L.LatLng): Array<number> {
    // From L.shape.getBounds()
    const delta = this._shape._radius * Math.cos(Math.PI / 4);
    const point = this._map.project(latlng);
    return this._map.unproject([point.x + delta, point.y - delta]);
  }

  _move(latlng: L.LatLng): void {
    const resizemarkerPoint = this._getResizeMarkerPoint(latlng);

    // Move the resize marker
    this._resizeMarkers[0].setLatLng(resizemarkerPoint);

    // Move the circle
    this._shape.setLatLng(latlng);

    this._map.fire(Event.EDITMOVE, {layer: this._shape});
  }

  _resize(latlng: L.LatLng): void {
    const moveLatLng = this._moveMarker.getLatLng();
    const radius = moveLatLng.distanceTo(latlng);

    this._shape.setRadius(radius);

    this._map.fire(Event.EDITRESIZE, {layer: this._shape});
  }
}

L.Circle.addInitHook(function initHook() {
  if (Circle) {
    this.editing = new Circle(this);

    if (this.options.editable) {
      this.editing.enable();
    }
  }

  this.on('add', function onAdd() {
    if (this.editing && this.editing.enabled()) {
      this.editing.addHooks();
    }
  });

  this.on('remove', function onRemove() {
    if (this.editing && this.editing.enabled()) {
      this.editing.removeHooks();
    }
  });
});
