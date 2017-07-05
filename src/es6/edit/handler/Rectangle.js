/** @flow
 * StratoDem Analytics : Rectangle
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


export default class Rectangle extends SimpleShape {
  _createMoveMarker(): void {
    const bounds = this._shape.getBounds();
    const center = bounds.getCenter();

    this._moveMarker = this._createMarker(center, this.options.moveIcon);
  }

  _createResizeMarker(): void {
    const corners = this._getCorners();

    this._resizeMarkers = corners.map((corner, idx) => {
      const marker = this._createMarker(corner, this.options.resizeIcon);
      marker._cornerIndex = idx;
      return marker;
    });
  }

  _onMarkerDragStart(event: {target: L.Marker}): void {
    SimpleShape.prototype._onMarkerDragStart.call(this, event);

    // Save a reference to the opposite point
    const corners = this._getCorners();
    const marker = event.target;
    const currentCornerIndex = marker._cornerIndex;

    this._oppositeCorner = corners[(currentCornerIndex + 2) % 4];

    this._toggleCornerMarkers(0);
  }

  _onMarkerDragEnd(event: {target: L.Marker}): void {
    const marker = event.target;

    // Reset move marker position to the center
    if (marker === this._moveMarker) {
      const bounds = this._shape.getBounds();
      const center = bounds.getCenter();

      marker.setLatLng(center);
    }

    this._toggleCornerMarkers(1);

    this._repositionCornerMarkers();

    SimpleShape.prototype._onMarkerDragEnd.call(this, event);
  }

  _move(newCenter: L.LatLng): void {
    const latlngs = this._shape._defaultShape
      ? this._shape._defaultShape()
      : this._shape.getLatLngs();
    const bounds = this._shape.getBounds();
    const center = bounds.getCenter();

    // Offset the latlngs to the new center
    const newLatLngs = latlngs.map(ll =>
      ([
        newCenter.lat + (ll.lat - center.lat),
        newCenter.lng + (ll.lng - center.lng)]));

    this._shape.setLatLngs(newLatLngs);

    // Reposition the resize markers
    this._repositionCornerMarkers();

    this._map.fire(Event.EDITMOVE, { layer: this._shape });
  }

  _resize(latlng: L.LatLng): void {
    // Update the shape based on the current position of this corner and the opposite point
    this._shape.setBounds(L.latLngBounds(latlng, this._oppositeCorner));

    // Reposition the move marker
    const bounds = this._shape.getBounds();
    this._moveMarker.setLatLng(bounds.getCenter());

    this._map.fire(Event.EDITRESIZE, { layer: this._shape });
  }

  _getCorners(): Array<L.LatLng> {
    const bounds = this._shape.getBounds();

    return [
      bounds.getNorthWest(),
      bounds.getNorthEast(),
      bounds.getSouthEast(),
      bounds.getSouthWest(),
    ];
  }

  _toggleCornerMarkers(opacity: number): void {
    this._resizeMarkers.forEach(m => m.setOpacity(opacity));
  }

  _repositionCornerMarkers(): void {
    const corners = this._getCorners();

    this._resizeMarkers.forEach((m, idx) => { m.setLatLng(corners[idx]); });
  }
}


L.Rectangle.addInitHook(function addHook() {
  if (Rectangle) {
    this.editing = new Rectangle(this);

    if (this.options.editable) {
      this.editing.enable();
    }
  }
});
