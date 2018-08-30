/** @flow
 * StratoDem Analytics : Draw.Circle
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
import { TYPE_CIRCLE } from './constants';


const DEFAULT_CIRCLE_OPTIONS: T_SIMPLESHAPE_OPTIONS = {
  shapeOptions: {
    stroke: true,
    color: '#3388ff',
    weight: 4,
    opacity: 0.5,
    fill: true,
    fillColor: null,  // same as color by default
    fillOpacity: 0.2,
    clickable: true,
  },
  showRadius: true,
  metric: true,       // Whether to use the metric measurement system or imperial
  feet: true,         // When not metric, use feet instead of yards for display
  nautic: false,      // When not metric, not feet use nautic mile for display
};

export default class Circle extends SimpleShape {
  _initialLabelText: string;

  static options = DEFAULT_CIRCLE_OPTIONS;
  static TYPE = TYPE_CIRCLE;

  initialize(map: L.Map, options: T_SIMPLESHAPE_OPTIONS): void {
    // Save the type so super can fire, need to do this as cannot do this.TYPE :(
    this.type = Circle.TYPE;

    this._initialLabelText = drawLocal.draw.handlers.circle.tooltip.start;
    // TODO options
    super.initialize(map, options);
  }

  _drawShape(latlng: L.LatLng): void {
    if (!this._shape) {
      this._shape = new L.Circle(
        this._startLatLng,
        this._startLatLng.distanceTo(latlng),
        this.options.shapeOptions);
      this._map.addLayer(this._shape);
    } else {
      this._shape.setRadius(this._startLatLng.distanceTo(latlng));
    }
  }

  _fireCreatedEvent(): void {
    const circle = new L.Circle(
      this._startLatLng,
      this._shape.getRadius(),
      this.options.shapeOptions);
    super._fireCreatedEvent(circle);
  }

  _onMouseMove(event: {latlng: L.LatLng}): void {
    const latlng = event.latlng;
    const showRadius = this.options.showRadius;
    const useMetric = this.options.metric;
    let radius;

    this._tooltip.updatePosition(latlng);
    if (this._isDrawing) {
      this._drawShape(latlng);

      // Get the new radius (rounded to 1 dp)
      radius = this._shape.getRadius().toFixed(1);

      const subtext = showRadius
        ? `${drawLocal.draw.handlers.circle.radius}: ${GeometryUtil.readableDistance(
          radius,
          useMetric,
          this.options.feet,
          this.options.nautic)}`
        : '';
      this._tooltip.updateContent({
        text: this._endLabelText,
        subtext,
      });
    }
  }
}
