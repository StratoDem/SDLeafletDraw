/** @flow
 * StratoDem Analytics : Poly
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import { TouchMarker } from '../../ext/index';
import drawLocal from '../../draw';
import Event from '../../Event';

/** Poly */
export class Poly extends L.Handler {
  static options = {};

  initialize(poly: L.Layer, options: {}): void {
    this.latlngs = [poly._latlngs];
    if (poly._holes) {
      this.latlngs = this.latlngs.concat(poly._holes);
    }

    this._poly = poly;
    L.setOptions(this, options);

    this._poly.on('revert-edited', this._updateLatLngs, this);
  }

  /** Compatibility method to normalize Poly* objects between 0.7.x and 1.0+ */
  _defaultShape(): L.Polyline {
    if (!L.Polyline._flat)
      return this._poly._latlngs;

    return L.Polyline._flat(this._poly._latlngs)
      ? this._poly._latlngs
      : this._poly._latlngs[0];
  }

  _eachVertexHandler(callback: (any) => void): void {
    this._verticesHandlers.forEach(vh => callback(vh));
  }

  /** Add listener hooks to this handler */
  addHooks(): void {
    this._initHandlers();
    this._eachVertexHandler((handler) => {
      handler.addHooks();
    });
  }

  /** Remove listener hooks from this handler */
  removeHooks(): void {
    this._eachVertexHandler((handler) => {
      handler.removeHooks();
    });
  }

  /** Fire and update for each vertex handler */
  updateMarkers(): void {
    this._eachVertexHandler((handler) => {
      handler.updateMarkers();
    });
  }

  _initHandlers(): void {
    this._verticesHandlers = this.latlngs  // eslint-disable-next-line
      .map(ll => new PolyVerticesEdit(this._poly, ll, this.options));
  }

  _updateLatLngs(event: { layer: { _latlngs: Array<L.LatLng> }, _holes: Array<Object> }): void {
    this.latlngs = [event.layer._latlngs];
    if (event.layer._holes) {
      this.latlngs = this.latlngs.concat(event.layer._holes);
    }
  }
}


/** PolyVerticesEdit */
type T_ORIGINAL_EVENT = {
  clientX: number,
  clientY: number,
  latlng: L.LatLng,
  touches: Array<{clientX: number, clientY: number}>,
};
type T_POLYVERTICES_OPTIONS = {
  icon?: L.DivIcon,
  touchIcon?: L.DivIcon,
  drawError?: {
    color?: string,
    timeout?: number,
  },
};
const DEFAULT_POLYVERTICES_OPTIONS: T_POLYVERTICES_OPTIONS = {
  icon: new L.DivIcon({
    iconSize: new L.Point(8, 8),
    className: 'leaflet-div-icon leaflet-editing-icon',
  }),
  touchIcon: new L.DivIcon({
    iconSize: new L.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon',
  }),
  drawError: {
    color: '#b00b00',
    timeout: 1000,
  },
};

export class PolyVerticesEdit extends L.Handler {
  _poly: L.Layer;
  _latlngs: Array<L.LatLng>;

  static options = DEFAULT_POLYVERTICES_OPTIONS;

  initialize(poly: L.Layer, latlngs: Array<L.LatLng>, options: T_POLYVERTICES_OPTIONS): void {
    this._poly = poly;
    this._latlngs = latlngs;

    // if touch, switch to touch icon
    const defaultIcon = L.Browser.touch
      ? PolyVerticesEdit.options.touchIcon
      : PolyVerticesEdit.options.icon;
    L.setOptions(this, {
      icon: typeof options.icon !== 'undefined'
        ? options.icon
        : defaultIcon,
      touchIcon: typeof options.touchIcon !== 'undefined'
        ? options.touchIcon
        : PolyVerticesEdit.options.touchIcon,
      drawError: {
        ...PolyVerticesEdit.options.drawError,
        ...typeof options.drawError !== 'undefined'
          ? options.drawError
          : {},
      },
    });
  }

  /** Compatibility method to normalize Poly* objects between 0.7.x and 1.0+ */
  _defaultShape(): Array<L.LatLng> {
    if (typeof L.LineUtil._flat === 'undefined')
      return this._latlngs;

    return L.LineUtil._flat(this._latlngs)
      ? this._latlngs
      : this._latlngs[0];
  }

  /** Add listener hooks to this handler */
  addHooks(): void {
    const poly = this._poly;

    if (!(poly instanceof L.Polygon)) {
      poly.options.fill = false;
      if (poly.options.editing) {
        poly.options.editing.fill = false;
      }
    }

    poly.setStyle(poly.options.editing);

    if (this._poly._map) {
      this._map = this._poly._map; // Set map

      if (!this._markerGroup)
        this._initMarkers();

      this._poly._map.addLayer(this._markerGroup);
    }
  }

  /** Remove listener hooks from this handler */
  removeHooks(): void {
    const poly = this._poly;

    poly.setStyle(poly.options.original);

    if (poly._map) {
      poly._map.removeLayer(this._markerGroup);
      delete this._markerGroup;
      delete this._markers;
    }
  }

  /** Clear markers and update their location */
  updateMarkers(): void {
    this._markerGroup.clearLayers();
    this._initMarkers();
  }

  _initMarkers(): void {
    if (!this._markerGroup)
      this._markerGroup = new L.LayerGroup();

    this._markers = this._defaultShape().map((ll, idx) => {
      const marker = this._createMarker(ll, idx);
      marker.on('click', this._onMarkerClick, this);
      return marker;
    });

    this._markers.forEach((markerRight, idxRight) => {
      if (!(idxRight === 0 && !(L.Polygon && (this._poly instanceof L.Polygon)))) {
        const idxLeft = idxRight === 0 ? this._markers.length - 1 : idxRight - 1;
        const markerLeft = this._markers[idxLeft];

        this._createMiddleMarker(markerLeft, markerRight);
        PolyVerticesEdit._updatePrevNext(markerLeft, markerRight);
      }
    });
  }

  _createMarker(latlng: L.LatLng, index?: number): TouchMarker {
    // Extending L.Marker in TouchEvents.js to include touch.
    const marker = new TouchMarker(latlng, {
      draggable: true,
      icon: this.options.icon,
    });

    marker._origLatLng = latlng;
    marker._index = index;

    marker
      .on('dragstart', this._onMarkerDragStart, this)
      .on('drag', this._onMarkerDrag, this)
      .on('dragend', this._fireEdit, this)
      .on('touchmove', this._onTouchMove, this)
      .on('touchend', this._fireEdit, this)
      .on('MSPointerMove', this._onTouchMove, this)
      .on('MSPointerUp', this._fireEdit, this);

    this._markerGroup.addLayer(marker);

    return marker;
  }

  _onMarkerDragStart(): void {
    this._poly.fire('editstart');
  }

  _spliceLatLngs(idx1: number, idx2: number, latlng: ?L.LatLng): Array<L.LatLng> {
    const latlngs = this._defaultShape();
    const removed = latlngs.splice(idx1, idx2, latlng);
    this._poly._convertLatLngs(latlngs, true);
    this._poly.redraw();
    return removed;
  }

  _removeMarker(marker: L.Marker): void {
    const i = marker._index;

    this._markerGroup.removeLayer(marker);
    this._markers.splice(i, 1);
    this._spliceLatLngs(i, 1);
    this._updateIndexes(i, -1);

    marker
      .off('dragstart', this._onMarkerDragStart, this)
      .off('drag', this._onMarkerDrag, this)
      .off('dragend', this._fireEdit, this)
      .off('touchmove', this._onMarkerDrag, this)
      .off('touchend', this._fireEdit, this)
      .off('click', this._onMarkerClick, this)
      .off('MSPointerMove', this._onTouchMove, this)
      .off('MSPointerUp', this._fireEdit, this);
  }

  _fireEdit(): void {
    this._poly.edited = true;
    this._poly.fire('edit');
    this._poly._map.fire(Event.EDITVERTEX, { layers: this._markerGroup, poly: this._poly });
  }

  _onMarkerDrag(event: {target: L.Marker}): void {
    const marker = event.target;
    const poly = this._poly;

    L.extend(marker._origLatLng, marker._latlng);

    if (marker._middleLeft)
      marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
    if (marker._middleRight)
      marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));

    if (poly.options.poly) {
      const tooltip = poly._map._editTooltip; // Access the tooltip

      // If we don't allow intersections and the polygon intersects
      if (!poly.options.poly.allowIntersection && poly.intersects()) {
        const originalColor = poly.options.color;
        poly.setStyle({ color: this.options.drawError.color });

        // Manually trigger 'dragend' behavior on marker we are about to remove
        // WORKAROUND: introduced in 1.0.0-rc2, may be related to #4484
        if (L.version.indexOf('0.7') !== 0)
          marker.dragging._draggable._onUp(event);

        this._onMarkerClick(event); // Remove violating marker
        // FIXME: Reset the marker to it's original position (instead of remove)

        if (tooltip) {
          tooltip.updateContent({
            text: drawLocal.draw.handlers.polyline.error,
          });
        }

        // Reset everything back to normal after a second
        setTimeout(() => {
          poly.setStyle({ color: originalColor });
          if (tooltip) {
            tooltip.updateContent({
              text: drawLocal.edit.handlers.edit.tooltip.text,
              subtext: drawLocal.edit.handlers.edit.tooltip.subtext,
            });
          }
        }, 1000);
      }
    }

    this._poly.redraw();
    this._poly.fire('editdrag');
  }

  _onMarkerClick(event: {target: L.Marker}): void {
    const minPoints = L.Polygon && (this._poly instanceof L.Polygon) ? 4 : 3;
    const marker = event.target;

    // If removing this point would create an invalid polyline/polygon don't remove
    if (this._defaultShape().length < minPoints)
      return;

    // remove the marker
    this._removeMarker(marker);

    // update prev/next links of adjacent markers
    PolyVerticesEdit._updatePrevNext(marker._prev, marker._next);

    // remove ghost markers near the removed marker
    if (marker._middleLeft) {
      this._markerGroup.removeLayer(marker._middleLeft);
    }
    if (marker._middleRight) {
      this._markerGroup.removeLayer(marker._middleRight);
    }

    // create a ghost marker in place of the removed one
    if (marker._prev && marker._next)
      this._createMiddleMarker(marker._prev, marker._next);
    else if (!marker._prev)
      marker._next._middleLeft = null;
    else if (!marker._next)
      marker._prev._middleRight = null;

    this._fireEdit();
  }

  _onTouchMove(event: {target: L.Marker, originalEvent: T_ORIGINAL_EVENT}): void {
    const layerPoint = this._map.mouseEventToLayerPoint(event.originalEvent.touches[0]);
    const latlng = this._map.layerPointToLatLng(layerPoint);
    const marker = event.target;

    L.extend(marker._origLatLng, latlng);

    if (marker._middleLeft)
      marker._middleLeft.setLatLng(this._getMiddleLatLng(marker._prev, marker));
    if (marker._middleRight)
      marker._middleRight.setLatLng(this._getMiddleLatLng(marker, marker._next));

    this._poly.redraw();
    this.updateMarkers();
  }

  _updateIndexes(index: number, delta: number) {
    this._markerGroup.eachLayer((marker) => {
      if (marker._index > index) // eslint-disable-next-line
        marker._index += delta; // TODO no reassignment
    });
  }

  _createMiddleMarker(marker1: L.Marker, marker2: L.Marker): void {
    const latlng = this._getMiddleLatLng(marker1, marker2);
    const marker = this._createMarker(latlng);
    let onClick;

    marker.setOpacity(0.6);

    // eslint-disable-next-line
    marker1._middleRight = marker2._middleLeft = marker;  // TODO no reassignment

    function onDragStart() {
      marker.off('touchmove', onDragStart, this);
      const i = marker2._index;

      marker._index = i;

      marker
        .off('click', onClick, this)
        .on('click', this._onMarkerClick, this);

      // $FlowFixMe
      latlng.lat = marker.getLatLng().lat;
      // $FlowFixMe
      latlng.lng = marker.getLatLng().lng;
      this._spliceLatLngs(i, 0, latlng);
      this._markers.splice(i, 0, marker);

      marker.setOpacity(1);

      this._updateIndexes(i, 1);
      // eslint-disable-next-line
      marker2._index += 1;    // TODO no reassignment
      PolyVerticesEdit._updatePrevNext(marker1, marker);
      PolyVerticesEdit._updatePrevNext(marker, marker2);

      this._poly.fire('editstart');
    }

    function onDragEnd() {
      marker.off('dragstart', onDragStart, this);
      marker.off('dragend', onDragEnd, this);
      marker.off('touchmove', onDragStart, this);

      this._createMiddleMarker(marker1, marker);
      this._createMiddleMarker(marker, marker2);
    }

    onClick = () => {
      onDragStart.call(this);
      onDragEnd.call(this);
      this._fireEdit();
    };

    marker
      .on('click', onClick, this)
      .on('dragstart', onDragStart, this)
      .on('dragend', onDragEnd, this)
      .on('touchmove', onDragStart, this);

    this._markerGroup.addLayer(marker);
  }

  static _updatePrevNext(marker1: L.Marker, marker2: L.Marker): void {
    if (marker1) // eslint-disable-next-line
      marker1._next = marker2;      // TODO no reassignment
    if (marker2) // eslint-disable-next-line
      marker2._prev = marker1;      // TODO no reassignment
  }

  _getMiddleLatLng(marker1: L.Point, marker2: L.Point): void {
    const map = this._poly._map;
    const p1 = map.project(marker1.getLatLng());
    const p2 = map.project(marker2.getLatLng());

    return map.unproject(p1._add(p2)._divideBy(2));
  }
}


L.Polyline.addInitHook(function addInit() {
  // Check to see if handler has already been initialized. This is to support versions of Leaflet
  // that still have L.Handler.PolyEdit
  if (this.editing)
    return;

  if (Poly) {
    this.editing = new Poly(this, this.options.poly);

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
