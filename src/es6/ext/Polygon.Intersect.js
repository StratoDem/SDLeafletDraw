/** @flow
 * StratoDem Analytics : Polygon.Intersect
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';


L.Polygon.include({
  /** Checks a polygon for any intersecting line segments. Ignores holes. */
  intersects(): boolean {
    if (this._tooFewPointsForIntersection())
      return false;

    const points = this._getProjectedPoints();
    const polylineIntersects = L.Polyline.prototype.intersects.call(this);

    // If already found an intersection don't need to check for any more.
    if (polylineIntersects)
      return true;

    const len = points.length;
    const firstPoint = points[0];
    const lastPoint = points[len - 1];
    const maxIndex = len - 2;

    // Check the line segment between last and first point.
    // Don't need to check the first line segment (minIndex = 1)
    return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1);
  },
});
