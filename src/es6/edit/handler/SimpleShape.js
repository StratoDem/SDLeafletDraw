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

import { TouchMarker } from '../../ext/index';


type T_ORIGINAL_EVENT = {
  clientX: number,
  clientY: number,
  latlng: L.LatLng,
  touches: Array<{clientX: number, clientY: number}>,
}
type T_SIMPLESHAPE_OPTIONS = {
  moveIcon?: L.DivIcon,
  resizeIcon?: L.DivIcon,
  touchMoveIcon?: L.DivIcon,
  touchResizeIcon?: L.DivIcon,
};
const DEFAULT_SIMPLESHAPE_OPTIONS: T_SIMPLESHAPE_OPTIONS = {
  moveIcon: new L.DivIcon({
    iconSize: new L.Point(8, 8),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move',
  }),
  resizeIcon: new L.DivIcon({
    iconSize: new L.Point(8, 8),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize',
  }),
  touchMoveIcon: new L.DivIcon({
    iconSize: new L.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-move leaflet-touch-icon',
  }),
  touchResizeIcon: new L.DivIcon({
    iconSize: new L.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-edit-resize leaflet-touch-icon',
  }),
};

export default class SimpleShape extends L.Handler {
  _shape: L.geoJSON;

  static options = DEFAULT_SIMPLESHAPE_OPTIONS;

  initialize(shape: L.geoJSON, options: T_SIMPLESHAPE_OPTIONS): void {
    // if touch, switch to touch icon
    const moveIcon = L.Browser.touch
      ? SimpleShape.options.touchMoveIcon
      : SimpleShape.options.moveIcon;
    const resizeIcon = L.Browser.touch
      ? SimpleShape.options.touchResizeIcon
      : SimpleShape.options.resizeIcon;

    this._shape = shape;
    L.Util.setOptions(this, {
      moveIcon,
      resizeIcon,
      touchMoveIcon: SimpleShape.options.touchMoveIcon,
      touchResizeIcon: SimpleShape.options.touchResizeIcon,
      ...options,
    });
  }

  /** Add listener hooks to this handler **/
  addHooks(): void {
    const shape = this._shape;
    if (this._shape._map) {
      this._map = this._shape._map;
      shape.setStyle(shape.options.editing);

      if (shape._map) {
        this._map = shape._map;
        if (!this._markerGroup) {
          this._initMarkers();
        }
        this._map.addLayer(this._markerGroup);
      }
    }
  }

  /** Remove listener hooks from this handler **/
  removeHooks(): void {
    const shape = this._shape;

    shape.setStyle(shape.options.original);

    if (shape._map) {
      this._unbindMarker(this._moveMarker);

      this._resizeMarkers.forEach(marker => this._unbindMarker(marker));
      this._resizeMarkers = null;

      this._map.removeLayer(this._markerGroup);
      delete this._markerGroup;
    }

    this._map = null;
  }

  /** Remove the edit markers from this layer **/
  updateMarkers(): void {
    this._markerGroup.clearLayers();
    this._initMarkers();
  }

  _initMarkers(): void {
    if (!this._markerGroup)
      this._markerGroup = new L.LayerGroup();

    // Create center marker
    this._createMoveMarker();

    // Create edge marker
    this._createResizeMarker();
  }

  // eslint-disable-next-line
  _createMoveMarker(): void { // Children override
  }

  // eslint-disable-next-line
  _createResizeMarker(): void { // Children override
  }

  _createMarker(latlng: L.LatLng, icon: L.DivIcon | L.Icon): TouchMarker {
    const marker = new TouchMarker(latlng, {
      draggable: true,
      icon,
      zIndexOffset: 10,
    });

    this._bindMarker(marker);

    this._markerGroup.addLayer(marker);

    return marker;
  }

  _bindMarker(marker: TouchMarker): void {
    marker
      .on('dragstart', this._onMarkerDragStart, this)
      .on('drag', this._onMarkerDrag, this)
      .on('dragend', this._onMarkerDragEnd, this)
      .on('touchstart', this._onTouchStart, this)
      .on('touchmove', this._onTouchMove, this)
      .on('MSPointerMove', this._onTouchMove, this)
      .on('touchend', this._onTouchEnd, this)
      .on('MSPointerUp', this._onTouchEnd, this);
  }

  _unbindMarker(marker: TouchMarker): void {
    marker
      .off('dragstart', this._onMarkerDragStart, this)
      .off('drag', this._onMarkerDrag, this)
      .off('dragend', this._onMarkerDragEnd, this)
      .off('touchstart', this._onTouchStart, this)
      .off('touchmove', this._onTouchMove, this)
      .off('MSPointerMove', this._onTouchMove, this)
      .off('touchend', this._onTouchEnd, this)
      .off('MSPointerUp', this._onTouchEnd, this);
  }

  _onMarkerDragStart(event: {target: TouchMarker}): void {
    const marker = event.target;
    marker.setOpacity(0);

    this._shape.fire('editstart');
  }

  _fireEdit(): void {
    this._shape.edited = true;
    this._shape.fire('edit');
  }

  _onMarkerDrag(event: {target: TouchMarker}): void {
    const marker = event.target;
    const latlng = marker.getLatLng();

    if (marker === this._moveMarker) // $FlowFixMe overridden in children
      this._move(latlng);
    else // $FlowFixMe overridden in children
      this._resize(latlng);

    this._shape.redraw();
    this._shape.fire('editdrag');
  }

  _onMarkerDragEnd(event: {target: TouchMarker}): void {
    const marker = event.target;
    marker.setOpacity(1);

    this._fireEdit();
  }

  _onTouchStart(event: {target: TouchMarker}): void {
    SimpleShape.prototype._onMarkerDragStart.call(this, event);

    if (typeof this._getCorners === 'function') {
      // Save a reference to the opposite point
      const corners = this._getCorners();
      const marker = event.target;
      const currentCornerIndex = marker._cornerIndex;

      marker.setOpacity(0);

      // Copyed from Edit.Rectangle.js line 23 _onMarkerDragStart()
      // Latlng is null otherwise.
      this._oppositeCorner = corners[(currentCornerIndex + 2) % 4];
      this._toggleCornerMarkers(0, currentCornerIndex);
    }

    this._shape.fire('editstart');
  }

  _onTouchMove(event: {target: TouchMarker, originalEvent: T_ORIGINAL_EVENT}): boolean {
    const layerPoint = this._map.mouseEventToLayerPoint(event.originalEvent.touches[0]);
    const latlng = this._map.layerPointToLatLng(layerPoint);
    const marker = event.target;

    if (marker === this._moveMarker) // $FlowFixMe overridden in children
      this._move(latlng);
    else // $FlowFixMe overridden in children
      this._resize(latlng);

    this._shape.redraw();

    // prevent touchcancel in IOS
    // e.preventDefault();
    return false;
  }

  _onTouchEnd(event: {target: TouchMarker}): void {
    const marker = event.target;
    marker.setOpacity(1);
    this.updateMarkers();
    this._fireEdit();
  }

  // eslint-disable-next-line
  _move(): void { // Children override
  }

  // eslint-disable-next-line
  _resize(): void { // Children override
  }
}
