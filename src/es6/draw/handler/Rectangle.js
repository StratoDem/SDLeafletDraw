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

import drawLocal from '../../draw';
import { GeometryUtil } from '../../ext/index';
import SimpleShape from './SimpleShape';
import type { T_SIMPLESHAPE_OPTIONS } from './SimpleShape';
import { TYPE_RECTANGLE } from './constants';


const DEFAULT_RECTANGLE_OPTIONS = {
  shapeOptions: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: true,
    fillColor: null,    // same as color by default
    fillOpacity: 0.2,
    showArea: true,
    clickable: true,
  },
  metric: true,         // Whether to use the metric measurement system or imperial
};

export default class Rectangle extends SimpleShape {
  static TYPE = TYPE_RECTANGLE;
  static options = DEFAULT_RECTANGLE_OPTIONS;

  initialize(map: L.Map, options: T_SIMPLESHAPE_OPTIONS): void {
    // Save the type so super can fire, need to do this as cannot do this.TYPE :(
    this.type = Rectangle.TYPE;

    this._initialLabelText = drawLocal.draw.handlers.rectangle.tooltip.start;
    super.initialize(map, {
      ...Rectangle.options,
      ...options,
      shapeOptions: {
        ...Rectangle.options.shapeOptions,
        ...typeof options !== 'undefined' && options.shapeOptions !== 'undefined'
          ? options.shapeOptions
          : {},
      },
    });
  }

  _drawShape(latlng: L.LatLng): void {
    if (!this._shape) {
      this._shape = new L.Rectangle(
        new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
      this._map.addLayer(this._shape);
    } else {
      this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
    }
  }

  _fireCreatedEvent(): void {
    const rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
    super._fireCreatedEvent(rectangle);
  }

  _getTooltipText(): {text: string, subtext?: string} {
    const tooltipText = super._getTooltipText();
    const shape = this._shape;
    const showArea = this.options.showArea;
    let latLngs;
    let area;
    let subtext;

    if (shape) {
      latLngs = this._shape._defaultShape ? this._shape._defaultShape() : this._shape.getLatLngs();
      area = GeometryUtil.geodesicArea(latLngs);
      subtext = showArea ? GeometryUtil.readableArea(area, this.options.metric) : '';
    }

    return {
      text: tooltipText.text,
      subtext,
    };
  }
}
