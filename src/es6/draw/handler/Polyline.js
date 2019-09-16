/** @flow
 * StratoDem Analytics : Polyline
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import drawLocal from '../../draw';
import Tooltip from '../../Tooltip';
import Event from '../../Event';
import { GeometryUtil, TouchMarker } from '../../ext/index';
import Feature from './Feature';
import { TYPE_POLYGON, TYPE_POLYLINE } from './constants';


type T_POLYLINE_OPTIONS = {
  allowIntersection?: boolean,
  repeatMode?: boolean,
  drawError?: {
    color?: string,
    timeout?: number,
  },
  icon?: L.Icon | L.DivIcon,
  touchIcon?: L.Icon | L.DivIcon,
  guidelineDistance?: number,
  maxGuideLineLength?: number,
  shapeOptions?: {
    stroke?: boolean,
    color?: string,
    weight?: number,
    opacity?: number,
    fill?: boolean,
    clickable?: boolean,
  },
  metric?: boolean,
  feet?: boolean,
  nautic?: boolean,
  showLength?: boolean,
  zIndexOffset?: number,
};

type T_ORIGINAL_EVENT = {
  clientX: number,
  clientY: number,
  latlng: L.LatLng,
  touches: Array<{clientX: number, clientY: number}>,
}


const DEFAULT_POLYLINE_OPTIONS: T_POLYLINE_OPTIONS = {
  allowIntersection: true,
  repeatMode: false,
  drawError: {
    color: '#b00b00',
    timeout: 2500,
    message: drawLocal.draw.handlers.polyline.error,
  },
  icon: new L.DivIcon({
    iconSize: new L.Point(8, 8),
    className: 'leaflet-div-icon leaflet-editing-icon',
  }),
  touchIcon: new L.DivIcon({
    iconSize: new L.Point(20, 20),
    className: 'leaflet-div-icon leaflet-editing-icon leaflet-touch-icon',
  }),
  guidelineDistance: 20,
  maxGuideLineLength: 4000,
  shapeOptions: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: false,
    clickable: true,
  },
  metric: true,           // Whether to use the metric measurement system or imperial
  feet: true,             // When not metric, to use feet instead of yards for display.
  nautic: false,          // When not metric, not feet use nautic mile for display
  showLength: true,       // Whether to display distance in the tooltip
  zIndexOffset: 2000,     // This should be > than the highest z-index any map layers
};

export default class Polyline extends Feature {
  Poly: L.Feature;
  type: string;
  _poly: L.Polyline;
  _tooltip: Tooltip;
  _markers: Array<TouchMarker>;

  static TYPE = TYPE_POLYLINE;
  static options = DEFAULT_POLYLINE_OPTIONS;

  initialize(map: L.Map, options: T_POLYLINE_OPTIONS): void {
    this.type = Polyline.TYPE;
    this.Poly = Polyline.Poly;

    // If touch, switch to touch icon
    const defaultIcon = L.Browser.touch ? Polyline.options.touchIcon : Polyline.options.icon;
    super.initialize(map, {
      ...Polyline.options,
      icon: defaultIcon,
      ...options,
      drawError: {
        ...Polyline.drawError,
        ...typeof options !== 'undefined' && options.drawError !== 'undefined'
          ? options.drawError
          : {},
      },
    });
  }

  /** Add listener hooks to this handler */
  addHooks(): void {
    super.addHooks();
    if (this._map) {
      this._markers = [];

      this._markerGroup = new L.LayerGroup();
      this._map.addLayer(this._markerGroup);

      this._poly = new L.Polyline([], this.options.shapeOptions);

      this._tooltip.updateContent(this._getTooltipText());

      // Make a transparent marker that will used to catch click events. These click
      // events will create the vertices. We need to do this so we can ensure that
      // we can create vertices over other map layers (markers, vector layers). We
      // also do not want to trigger any click handlers of objects we are clicking on
      // while drawing.
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
        .on('mouseout', this._onMouseOut, this)
        .on('mousemove', this._onMouseMove, this) // Necessary to prevent 0.8 stutter
        .on('mousedown', this._onMouseDown, this)
        .on('mouseup', this._onMouseUp, this)     // Necessary for 0.8 compatibility
        .addTo(this._map);

      this._map
        .on('mouseup', this._onMouseUp, this)     // Necessary for 0.7 compatibility
        .on('mousemove', this._onMouseMove, this)
        .on('zoomlevelschange', this._onZoomEnd, this)
        .on('touchstart', this._onTouch, this)
        .on('zoomend', this._onZoomEnd, this);
    }
  }

  /** Remove listener hooks from this handler */
  removeHooks(): void {
    super.removeHooks();

    this._clearHideErrorTimeout();

    this._cleanUpShape();

    // remove markers from map
    this._map.removeLayer(this._markerGroup);
    delete this._markerGroup;
    delete this._markers;

    this._map.removeLayer(this._poly);
    delete this._poly;

    this._mouseMarker
      .off('mousedown', this._onMouseDown, this)
      .off('mouseout', this._onMouseOut, this)
      .off('mouseup', this._onMouseUp, this)
      .off('mousemove', this._onMouseMove, this);
    this._map.removeLayer(this._mouseMarker);
    delete this._mouseMarker;

    // clean up DOM
    this._clearGuides();

    this._map
      .off('click', this._onClick, this)
      .off('mouseup', this._onMouseUp, this)
      .off('mousemove', this._onMouseMove, this)
      .off('zoomlevelschange', this._onZoomEnd, this)
      .off('zoomend', this._onZoomEnd, this)
      .off('touchstart', this._onTouch, this)
      .off('click', this._onTouch, this);
  }

  /** Remove the last vertex from the polyline, removes from map if only one point exists. */
  deleteLastVertex(): void {
    if (this._markers.length <= 1)
      return;

    const lastMarker = this._markers.pop();
    const poly = this._poly;
    const latlngs = poly.getLatLngs();
    const latlng = latlngs.splice(-1, 1)[0];
    this._poly.setLatLngs(latlngs);

    this._markerGroup.removeLayer(lastMarker);

    if (poly.getLatLngs().length < 2)
      this._map.removeLayer(poly);

    this._vertexChanged(latlng, false);
  }

  /** Add a vertex to the end of the polyline */
  addVertex(latlng: L.LatLng): void {
    const markersLength = this._markers.length;
    // markersLength must be greater than or equal to 2 before intersections can occur
    if (markersLength >= 2
      && !this.options.allowIntersection
      && this._poly.newLatLngIntersects(latlng)) {
      this._showErrorTooltip();
      return;
    } else if (this._errorShown) {
      this._hideErrorTooltip();
    }

    this._markers.push(this._createMarker(latlng));

    this._poly.addLatLng(latlng);

    if (this._poly.getLatLngs().length === 2)
      this._map.addLayer(this._poly);

    this._vertexChanged(latlng, true);
  }

  /** Closes the polyline between the first and last points */
  completeShape(): void {
    if (this._markers.length <= 1)
      return;

    this._fireCreatedEvent();
    this.disable();

    if (this.options.repeatMode)
      this.enable();
  }

  _finishShape(): void {
    const latlngs = this._poly._defaultShape ? this._poly._defaultShape() : this._poly.getLatLngs();
    const intersects = this._poly.newLatLngIntersects(latlngs[latlngs.length - 1]);

    if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
      this._showErrorTooltip();
      return;
    }

    this._fireCreatedEvent();
    this.disable();
    if (this.options.repeatMode)
      this.enable();
  }

  /** Verify that the shape is valid when the user tries to finish it */
  // eslint-disable-next-line
  _shapeIsValid(): boolean {
    return true;
  }

  _onZoomEnd(): void {
    if (this._markers !== null)
      this._updateGuide();
  }

  _onMouseMove(event: {originalEvent: Object}): void {
    const newPos = this._map.mouseEventToLayerPoint(event.originalEvent);
    const latlng = this._map.layerPointToLatLng(newPos);

    // Save latlng
    // should this be moved to _updateGuide() ?
    this._currentLatLng = latlng;

    this._updateTooltip(latlng);

    // Update the guide line
    this._updateGuide(newPos);

    // Update the mouse marker position
    this._mouseMarker.setLatLng(latlng);

    L.DomEvent.preventDefault(event.originalEvent);
  }

  _vertexChanged(latlng: L.LatLng, added: boolean): void {
    this._map.fire(Event.DRAWVERTEX, { layers: this._markerGroup });
    this._updateFinishHandler();

    this._updateRunningMeasure(latlng, added);

    this._clearGuides();

    this._updateTooltip();
  }

  _onMouseDown(event: {originalEvent: T_ORIGINAL_EVENT}): void {
    if (!this._clickHandled && !this._touchHandled && !this._disableMarkers) {
      this._onMouseMove(event);
      this._clickHandled = true;
      this._disableNewMarkers();
      const originalEvent = event.originalEvent;
      const clientX = originalEvent.clientX;
      const clientY = originalEvent.clientY;
      this._startPoint.call(this, clientX, clientY);
    }
  }

  _startPoint(clientX: number, clientY: number): void {
    this._mouseDownOrigin = L.point(clientX, clientY);
  }

  _onMouseUp(event: {originalEvent: T_ORIGINAL_EVENT}): void {
    const originalEvent = event.originalEvent;
    const { clientX, clientY } = originalEvent;
    this._endPoint(clientX, clientY, originalEvent);
    this._clickHandled = null;
  }

  // $FlowFixMe
  _endPoint(clientX: number, clientY: number, event: T_ORIGINAL_EVENT): void {
    if (this._mouseDownOrigin) {
      const dragCheckDistance = L.point(clientX, clientY)
        .distanceTo(this._mouseDownOrigin);
      const lastPtDistance = this._calculateFinishDistance(event.latlng);
      if (lastPtDistance < 10 && L.Browser.touch) {
        this._finishShape();
      } else if (Math.abs(dragCheckDistance) < 9 * (window.devicePixelRatio || 1)) {
        this.addVertex(event.latlng);
      }
      this._enableNewMarkers(); // after a short pause, enable new markers
    }
    this._mouseDownOrigin = null;
  }

  /** onTouch prevented by clickHandled flag because some browsers fire both click/touch events */
  _onTouch(event: {originalEvent: T_ORIGINAL_EVENT}): void {
    const originalEvent = event.originalEvent;
    if (originalEvent.touches
      && originalEvent.touches[0]
      && !this._clickHandled
      && !this._touchHandled
      && !this._disableMarkers) {
      const clientX = originalEvent.touches[0].clientX;
      const clientY = originalEvent.touches[0].clientY;
      this._disableNewMarkers();
      this._touchHandled = true;
      this._startPoint(clientX, clientY);
      this._endPoint(clientX, clientY, event);
      this._touchHandled = null;
    }
    this._clickHandled = null;
  }

  _onMouseOut(): void {
    if (this._tooltip)
      this._tooltip._onMouseOut.call(this._tooltip);
  }

  /**
   * Calculate if we are currently within close enough distance
   * of the closing point (first point for shapes, last poitn for lines)
   * Note: This is pretty ugly code
   * Note: Calculating point.distanceTo between mouseDownOrigin and last marker did NOT work
   */
  _calculateFinishDistance(potentialLatLng: L.LatLng): number {
    let lastPtDistance;

    if (this._markers.length > 0) {
      let finishMarker;

      if (this.type === TYPE_POLYLINE)
        finishMarker = this._markers[this._markers.length - 1];
      else if (this.type === TYPE_POLYGON)
        finishMarker = this._markers[0];
      else
        return Infinity;

      const lastMarkerPoint = this._map.latLngToContainerPoint(finishMarker.getLatLng());
      const potentialMarker = new L.Marker(potentialLatLng, {
        icon: this.options.icon,
        zIndexOffset: this.options.zIndexOffset * 2,
      });
      const potentialMarkerPint = this._map.latLngToContainerPoint(potentialMarker.getLatLng());
      lastPtDistance = lastMarkerPoint.distanceTo(potentialMarkerPint);
    } else {
      lastPtDistance = Infinity;
    }

    return lastPtDistance;
  }

  _updateFinishHandler(): void {
    const markerCount = this._markers.length;
    // The last marker should have a click handler to close the polyline
    if (markerCount > 1)
      this._markers[markerCount - 1].on('click', this._finishShape, this);

    // Remove the old marker click handler (as only the last point should close the polyline)
    if (markerCount > 2)
      this._markers[markerCount - 2].off('click', this._finishShape, this);
  }

  _createMarker(latlng: L.LatLng): L.Marker {
    const marker = new L.Marker(latlng, {
      icon: this.options.icon,
      zIndexOffset: this.options.zIndexOffset * 2,
    });

    this._markerGroup.addLayer(marker);

    return marker;
  }

  _updateGuide(newPos?: Object): void {
    const markerCount = this._markers ? this._markers.length : 0;

    if (markerCount > 0) {
      // draw the guide line
      this._clearGuides();
      this._drawGuide(
        this._map.latLngToLayerPoint(this._markers[markerCount - 1].getLatLng()),
        newPos || this._map.latLngToLayerPoint(this._currentLatLng));
    }
  }

  _updateTooltip(latLng: L.LatLng): void {
    const text = this._getTooltipText();

    if (latLng)
      this._tooltip.updatePosition(latLng);

    if (!this._errorShown)
      this._tooltip.updateContent(text);
  }

  _drawGuide(pointA: {x: number, y: number}, pointB: {x: number, y: number}): void {
    const length = Math.floor(
      Math.sqrt(((pointB.x - pointA.x) ** 2) + ((pointB.y - pointA.y) ** 2)));
    const guidelineDistance = this.options.guidelineDistance;
    const maxGuideLineLength = this.options.maxGuideLineLength;
    //
    let fraction;
    let dashPoint;
    let dash;

    // create the guides container if we haven't yet
    if (!this._guidesContainer) {
      this._guidesContainer = L.DomUtil.create('div', 'leaflet-draw-guides', this._overlayPane);
    }

    // draw a dash every GuildeLineDistance, Only draw a guideline with a max length
    for (let i = length > maxGuideLineLength ? length - maxGuideLineLength : guidelineDistance;
         i < length;
         i += this.options.guidelineDistance) {
      // work out fraction along line we are
      fraction = i / length;

      // calculate new x,y point
      dashPoint = {
        x: Math.floor((pointA.x * (1 - fraction)) + (fraction * pointB.x)),
        y: Math.floor((pointA.y * (1 - fraction)) + (fraction * pointB.y)),
      };

      // add guide dash to guide container
      dash = L.DomUtil.create('div', 'leaflet-draw-guide-dash', this._guidesContainer);
      dash.style.backgroundColor
        = !this._errorShown ? this.options.shapeOptions.color : this.options.drawError.color;

      L.DomUtil.setPosition(dash, dashPoint);
    }
  }

  _updateGuideColor(color: string): void {
    if (this._guidesContainer) {
      for (let i = 0, l = this._guidesContainer.childNodes.length; i < l; i += 1) {
        this._guidesContainer.childNodes[i].style.backgroundColor = color;
      }
    }
  }

  /** Remove all child elements (guide dashes) from the guides container */
  _clearGuides(): void {
    if (this._guidesContainer) {
      while (this._guidesContainer.firstChild) {
        this._guidesContainer.removeChild(this._guidesContainer.firstChild);
      }
    }
  }

  _getTooltipText(): {text: string, subtext?: string} {
    let showLength = this.options.showLength;
    let labelText;
    let distanceStr;
    if (L.Browser.touch)
      showLength = false; // if there's a better place to put this, feel free to move it

    if (this._markers.length === 0) {
      labelText = {text: drawLocal.draw.handlers.polyline.tooltip.start};
    } else {
      distanceStr = showLength ? this._getMeasurementString() : '';

      if (this._markers.length === 1)
        labelText = {
          text: drawLocal.draw.handlers.polyline.tooltip.cont,
          subtext: distanceStr,
        };
      else
        labelText = {
          text: drawLocal.draw.handlers.polyline.tooltip.end,
          subtext: distanceStr,
        };
    }
    return labelText;
  }

  _updateRunningMeasure(latlng: L.LatLng, added: boolean): void {
    const markersLength = this._markers.length;
    let previousMarkerIndex;
    let distance;

    if (this._markers.length === 1) {
      this._measurementRunningTotal = 0;
    } else {
      previousMarkerIndex = markersLength - (added ? 2 : 1);
      distance = latlng.distanceTo(this._markers[previousMarkerIndex].getLatLng());

      this._measurementRunningTotal += distance * (added ? 1 : -1);
    }
  }

  _getMeasurementString(): string {
    const currentLatLng = this._currentLatLng;
    const previousLatLng = this._markers[this._markers.length - 1].getLatLng();

    // calculate the distance from the last fixed point to the mouse position
    const distance = previousLatLng
    && currentLatLng
    && currentLatLng.distanceTo
      ? this._measurementRunningTotal + currentLatLng.distanceTo(previousLatLng)
      : this._measurementRunningTotal || 0;

    return GeometryUtil.readableDistance(
      distance,
      this.options.metric,
      this.options.feet,
      this.options.nautic,
      this.options.precision);
  }

  _showErrorTooltip(): void {
    this._errorShown = true;

    // Update tooltip
    this._tooltip
      .showAsError()
      .updateContent({ text: this.options.drawError.message });

    // Update shape
    this._updateGuideColor(this.options.drawError.color);
    this._poly.setStyle({ color: this.options.drawError.color });

    // Hide the error after 2 seconds
    this._clearHideErrorTimeout();
    this._hideErrorTimeout = setTimeout(
      L.Util.bind(this._hideErrorTooltip, this),
      this.options.drawError.timeout);
  }

  _hideErrorTooltip(): void {
    this._errorShown = false;

    this._clearHideErrorTimeout();

    // Revert tooltip
    this._tooltip
      .removeError()
      .updateContent(this._getTooltipText());

    // Revert shape
    this._updateGuideColor(this.options.shapeOptions.color);
    this._poly.setStyle({ color: this.options.shapeOptions.color });
  }

  _clearHideErrorTimeout(): void {
    if (this._hideErrorTimeout) {
      clearTimeout(this._hideErrorTimeout);
      this._hideErrorTimeout = null;
    }
  }

  /** Disable new markers temporarily to prevent duplicated touch/click events in some browsers*/
  _disableNewMarkers(): void {
    this._disableMarkers = true;
  }

  /** Re-enable new markers */
  _enableNewMarkers(): void {
    setTimeout(() => { this._disableMarkers = false; }, 50);
  }

  _cleanUpShape(): void {
    if (this._markers.length > 1)
      this._markers[this._markers.length - 1].off('click', this._finishShape, this);
  }

  _fireCreatedEvent(): void {
    const poly = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
    super._fireCreatedEvent(poly);
  }
}
