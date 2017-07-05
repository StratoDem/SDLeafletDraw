/** @flow
 * StratoDem Analytics : Polyline.Intersect
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import LineUtilIntersect from './LineUtil.Intersect';


L.Polyline.include({

  /**
   * Check to see if this polyline has any linesegments that intersect.
   * NOTE: does not support detecting intersection for degenerate cases.
   **/
  intersects(): boolean {
    if (this._tooFewPointsForIntersection()) {
      return false;
    }

    const points = this._getProjectedPoints();
    const len = points ? points.length : 0;

    for (let i = len - 1; i >= 3; i -= 1) {
      const p = points[i - 1];
      const p1 = points[i];

      if (this._lineSegmentsIntersectsRange(p, p1, i - 2)) {
        return true;
      }
    }

    return false;
  },

  /**
   * Check for intersection if new latlng was added to this polyline
   * NOTE: Does not support detecting intersection for degenerate cases.
   */
  newLatLngIntersects(latlng: L.LatLng, skipFirst: boolean): boolean {
    // Cannot check a polyline for intersecting lats/lngs when not added to the map
    if (!this._map)
      return false;

    return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst);
  },

  /**
   * Check for intersection if new point was added to this polyline
   * newPoint must be a layer point
   * NOTE: Does not support detecting intersection for degenerate cases.
   */
  newPointIntersects(newPoint: L.Point, skipFirst: boolean): boolean {
    if (this._tooFewPointsForIntersection(1))
      return false;

    const points = this._getProjectedPoints();
    const len = points ? points.length : 0;
    const lastPoint = points ? points[len - 1] : null;
    // The previous previous line segment. Previous line segment doesn't need testing.
    const maxIndex = len - 2;

    return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, skipFirst ? 1 : 0);
  },

  /**
   * Polylines with 2 sides can only intersect in cases where points are collinear
   * (we don't support detecting these).
   * Cannot have intersection when < 3 line segments (< 4 points)
   */
  _tooFewPointsForIntersection(extraPoints: number): boolean {
    const points = this._getProjectedPoints();
    let len = points ? points.length : 0;
    // Increment length by extraPoints if present
    len += extraPoints || 0;

    return !points || len <= 3;
  },

  /**
   * Checks a line segment intersection with any line segment before its predecessor.
   * Don't need to check the predecessor as it will never intersect.
   */
  _lineSegmentsIntersectsRange(p: L.Point, p1: L.Point,
                               maxIndex: number, minIndex: number): boolean {
    const points = this._getProjectedPoints();

    const nextMinIndex = minIndex || 0;

    // Check all previous line segments (beside the immediately previous) for intersections
    for (let j = maxIndex; j > nextMinIndex; j -= 1) {
      const p2 = points[j - 1];
      const p3 = points[j];

      if (LineUtilIntersect.segmentsIntersect(p, p1, p2, p3)) {
        return true;
      }
    }

    return false;
  },

  _getProjectedPoints(): Array<L.Point> {
    if (!this._defaultShape)
      return this._originalPoints;

    return this._defaultShape().map(s => this._map.latLngToLayerPoint(s));
  },
});
