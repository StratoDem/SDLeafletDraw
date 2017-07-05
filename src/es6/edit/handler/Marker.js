/** @flow
 * StratoDem Analytics : Marker
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import { TouchMarker } from '../../ext/index';
import Event from '../../Event';


export default class Marker extends L.Handler {
  _marker: TouchMarker;
  _map: L.Map;

  initialize(marker: TouchMarker, options: Object): void {
    this._marker = marker;
    L.setOptions(this, options);
  }

  /** Add listener hooks to this handler **/
  addHooks(): void {
    const marker = this._marker;

    marker.dragging.enable();
    marker.on('dragend', this._onDragEnd, marker);
    this._toggleMarkerHighlight();
  }

  /** Remove listener hooks from this handler **/
  removeHooks(): void {
    const marker = this._marker;

    marker.dragging.disable();
    marker.off('dragend', this._onDragEnd, marker);
    this._toggleMarkerHighlight();
  }

  _onDragEnd(event: {target: L.Layer}): void {
    const layer = event.target;
    layer.edited = true;
    this._map.fire(Event.EDITMOVE, {layer});
  }

  _toggleMarkerHighlight(): void {
    const icon = this._marker._icon;

    // Don't do anything if this layer is a marker but doesn't have an icon. Markers
    // should usually have icons. If using Leaflet.draw with Leaflet.markercluster there
    // is a chance that a marker doesn't.
    if (!icon)
      return;

    // This is quite naughty, but I don't see another way of doing it. (short of setting a new icon)
    icon.style.display = 'none';

    if (L.DomUtil.hasClass(icon, 'leaflet-edit-marker-selected')) {
      L.DomUtil.removeClass(icon, 'leaflet-edit-marker-selected');
      // Offset as the border will make the icon move.
      Marker._offsetMarker(icon, -4);
    } else {
      L.DomUtil.addClass(icon, 'leaflet-edit-marker-selected');
      // Offset as the border will make the icon move.
      Marker._offsetMarker(icon, 4);
    }

    icon.style.display = '';
  }

  static _offsetMarker(icon: L.Icon, offset: number): void {
    const iconMarginTop = parseInt(icon.style.marginTop, 10) - offset;
    const iconMarginLeft = parseInt(icon.style.marginLeft, 10) - offset;

    // TODO don't overwrite
    // eslint-disable-next-line
    icon.style.marginTop = `${iconMarginTop}px`;
    // eslint-disable-next-line
    icon.style.marginLeft = `${iconMarginLeft}px`;
  }
}


L.Marker.addInitHook(function addInit() {
  if (Marker) {
    this.editing = new Marker(this);

    if (this.options.editable) {
      this.editing.enable();
    }
  }
});
