/** @flow
 * StratoDem Analytics : Polygon
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import drawLocal from '../../draw';
import Polyline from './Polyline';
import { TYPE_POLYGON } from './constants';
import { GeometryUtil } from '../../ext/index';


type T_POLYGON_OPTIONS = {
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

const DEFAULT_POLYGON_OPTIONS: T_POLYGON_OPTIONS = {
  showArea: false,
  showLength: false,
  shapeOptions: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: true,
    fillColor: null,          // same as color by default
    fillOpacity: 0.2,
    clickable: true,
  },
  // Whether to use the metric measurement system (truthy) or not (falsy).
  // Also defines the units to use for the metric system as an array of
  // strings (e.g. `['ha', 'm']`).
  metric: true,
  feet: true, // When not metric, to use feet instead of yards for display.
  nautic: false, // When not metric, not feet use nautic mile for display
  // Defines the precision for each type of unit (e.g. {km: 2, ft: 0}
  precision: {},
};


export default class Polygon extends Polyline {
  static TYPE = TYPE_POLYGON;
  static Poly = L.Polygon;
  static options = DEFAULT_POLYGON_OPTIONS;

  initialize(map: L.Map, options: T_POLYGON_OPTIONS): void {
    super.initialize(map, {
      ...Polygon.options,
      ...options,
      drawError: {
        ...Polygon.drawError,
        ...typeof options.drawError !== 'undefined' ? options.drawError : {},
      },
    });

    this.Poly = Polygon.Poly;
    // Save the type so super can fire, need to do this as cannot do this.TYPE :(
    this.type = Polygon.TYPE;
  }

  _updateFinishHandler(): void {
    const markerCount = this._markers.length;

    // The first marker should have a click handler to close the polygon
    if (markerCount === 1)
      this._markers[0].on('click', this._finishShape, this);

    // Add and update the double click handler
    if (markerCount > 2) {
      this._markers[markerCount - 1].on('dblclick', this._finishShape, this);
      // Only need to remove handler if has been added before
      if (markerCount > 3)
        this._markers[markerCount - 2].off('dblclick', this._finishShape, this);
    }
  }

  _getTooltipText(): {text: string, subtext?: string} {
    let text;
    let subtext;

    if (this._markers.length === 0) {
      text = drawLocal.draw.handlers.polygon.tooltip.start;
    } else if (this._markers.length < 3) {
      text = drawLocal.draw.handlers.polygon.tooltip.cont;
      subtext = this._getMeasurementString();
    } else {
      text = drawLocal.draw.handlers.polygon.tooltip.end;
      subtext = this._getMeasurementString();
    }

    return {text, subtext};
  }

  _getMeasurementString(): string {
    const area = this._area;
    let measurementString = '';


    if (!area && !this.options.showLength)
      return measurementString;

    if (this.options.showLength)
      measurementString = super._getMeasurementString();

    if (area)
      measurementString
        += `<br>${GeometryUtil.readableArea(area, this.options.metric, this.options.precision)}`;

    return measurementString;
  }

  _shapeIsValid(): boolean {
    return this._markers.length >= 3;
  }

  _vertexChanged(latlng: L.LatLng, added: boolean): void {
    // Check to see if we should show the area
    if (!this.options.allowIntersection && this.options.showArea) {
      const latLngs = this._poly.getLatLngs();

      this._area = GeometryUtil.geodesicArea(latLngs);
    }

    super._vertexChanged(latlng, added);
  }

  _cleanUpShape(): void {
    const markerCount = this._markers.length;

    if (markerCount > 0) {
      this._markers[0].off('click', this._finishShape, this);

      if (markerCount > 2)
        this._markers[markerCount - 1].off('dblclick', this._finishShape, this);
    }
  }
}
