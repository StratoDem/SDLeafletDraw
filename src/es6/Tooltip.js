/** @flow
 * StratoDem Analytics : Tooltip
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';


export default class Tooltip extends L.Class {
  _map: L.Map;
  _visible: boolean;
  _singleLineLabel: boolean;

  constructor(map: L.Map) {
    // This uses constructor vs initialize because new Tooltip goes to constructor
    super();
    this._map = map;
    this._popupPane = this._map._panes.popupPane;
    this._visible = false;

    this._container = this._map.options.drawControlTooltips
      ? L.DomUtil.create('div', 'leaflet-draw-tooltip', this._popupPane)
      : null;
    this._singleLineLabel = false;

    this._map.on('mouseout', this._onMouseOut, this);
  }

  /** Remove Tooltip DOM and unbind events **/
  dispose(): void {
    this._map.off('mouseout', this._onMouseOut, this);

    if (this._container) {
      this._popupPane.removeChild(this._container);
      this._container = null;
    }
  }

  /** **/
  updateContent(labelText: {text: string, subtext?: string}): Object {
    if (!this._container)
      return this;

    const localText = {
      text: labelText.text,
      subtext: typeof labelText.subtext === 'string' ? labelText.subtext : '',
    };

    // update the vertical position (only if changed)
    if (localText.subtext.length === 0 && !this._singleLineLabel) {
      L.DomUtil.addClass(this._container, 'leaflet-draw-tooltip-single');
      this._singleLineLabel = true;
    } else if (localText.subtext.length > 0 && this._singleLineLabel) {
      L.DomUtil.removeClass(this._container, 'leaflet-draw-tooltip-single');
      this._singleLineLabel = false;
    }

    const subtext = localText.subtext.length > 0
      ? `<span class="leaflet-draw-tooltip-subtext">${localText.subtext}</span><br />`
      : '';
    this._container.innerHTML = `${subtext}<span>${localText.text}</span>`;

    if (!localText.text && !localText.subtext) {
      this._visible = false;
      this._container.style.visibility = 'hidden';
    } else {
      this._visible = true;
      this._container.style.visibility = 'inherit';
    }

    return this;
  }

  /** Changes the location of the tooltip **/
  updatePosition(latlng: L.LatLng): Object {
    const pos = this._map.latLngToLayerPoint(latlng);
    const tooltipContainer = this._container;

    if (this._container) {
      if (this._visible)
        tooltipContainer.style.visibility = 'inherit';
      L.DomUtil.setPosition(tooltipContainer, pos);
    }

    return this;
  }

  /** Apply error class to Tooltip **/
  showAsError(): Object {
    if (this._container)
      L.DomUtil.addClass(this._container, 'leaflet-error-draw-tooltip');
    return this;
  }

  /** Removes the error class from the tooltip **/
  removeError(): Object {
    if (this._container)
      L.DomUtil.removeClass(this._container, 'leaflet-error-draw-tooltip');
    return this;
  }

  _onMouseOut(): void {
    if (this._container)
      this._container.style.visibility = 'hidden';
  }
}
