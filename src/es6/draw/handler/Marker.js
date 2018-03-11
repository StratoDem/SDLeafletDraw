/** @flow
 * StratoDem Analytics : Draw.Marker
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import drawLocal from '../../draw';
import { TouchMarker } from '../../ext/index';
import Feature from './Feature';
import { TYPE_MARKER } from './constants';

type T_MARKER_OPTIONS = {
  icon?: L.Icon,
  repeatMode?: boolean,
  zIndexOffset?: number,
};


const DEFAULT_MARKER_OPTIONS: T_MARKER_OPTIONS = {
  icon: new L.Icon.Default(),
  repeatMode: false,
  zIndexOffset: 2000, // This should be > than the highest z-index any markers
};

export default class Marker extends Feature {
  static options = DEFAULT_MARKER_OPTIONS;
  static TYPE = TYPE_MARKER;

  initialize(map: L.Map, options: T_MARKER_OPTIONS) {
    super.initialize(map, {...Marker.options, ...options});
    // Save the type so super can fire, need to do this as cannot do this.TYPE :(
    this.type = Marker.TYPE;
  }

  /** Add listener hooks to this handler */
  addHooks(): void {
    super.addHooks();

    if (this._map) {
      this._tooltip.updateContent({ text: drawLocal.draw.handlers.marker.tooltip.start });

      // Same mouseMarker as in Draw.Polyline
      if (!this._mouseMarker) {
        this._mouseMarker = L.marker(this._map.getCenter(), {
          icon: L.divIcon({
            className: 'leaflet-mouse-marker',
            iconAnchor: [20, 20],
            iconSize: [40, 40],
          }),
          opacity: 0,
          zIndexOffset: this.options.zIndexOffset,
        });
      }

      this._mouseMarker
        .on('click', this._onClick, this)
        .addTo(this._map);

      this._map.on('mousemove', this._onMouseMove, this);
      this._map.on('click', this._onTouch, this);
    }
  }

  /** Remove listener hooks from this handler */
  removeHooks(): void {
    super.removeHooks();

    if (this._map) {
      if (this._marker) {
        this._marker.off('click', this._onClick, this);
        this._map
          .off('click', this._onClick, this)
          .off('click', this._onTouch, this)
          .removeLayer(this._marker);
        delete this._marker;
      }

      this._mouseMarker.off('click', this._onClick, this);
      this._map.removeLayer(this._mouseMarker);
      delete this._mouseMarker;

      this._map.off('mousemove', this._onMouseMove, this);
    }
  }

  _onMouseMove(event: {latlng: L.LatLng}): void {
    const { latlng } = event;

    this._tooltip.updatePosition(latlng);
    this._mouseMarker.setLatLng(latlng);

    if (!this._marker) {
      this._marker = new L.Marker(latlng, {
        icon: this.options.icon,
        zIndexOffset: this.options.zIndexOffset,
      });
      // Bind to both marker and map to make sure we get the click event.
      this._marker.on('click', this._onClick, this);
      this._map
        .on('click', this._onClick, this)
        .addLayer(this._marker);
    } else {
      this._marker.setLatLng(this._mouseMarker.getLatLng());
    }
  }

  _onClick(): void {
    this._fireCreatedEvent();

    this.disable();
    if (this.options.repeatMode)
      this.enable();
  }

  /** Handle touch event */
  _onTouch(event: {latlng: L.LatLng}): void {
    this._onMouseMove(event); // Creates & places marker
    this._onClick(); // Permanently places marker and ends interaction
  }

  _fireCreatedEvent(): void {
    const marker = new TouchMarker(this._marker.getLatLng(), { icon: this.options.icon });
    super._fireCreatedEvent(marker);
  }
}
