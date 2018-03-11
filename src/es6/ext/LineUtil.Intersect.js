/** @flow
 * StratoDem Analytics : LineUtil.Intersect
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

const LineUtilIntersect = L.Util.extend({
  /**
   * Checks to see if two line segments intersect. Does not handle degenerate cases.
   * http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
   */
  segmentsIntersect(p: L.Point, p1: L.Point, p2: L.Point, p3: L.Point): boolean {
    return this._checkCounterclockwise(p, p2, p3) !== this._checkCounterclockwise(p1, p2, p3)
      && this._checkCounterclockwise(p, p1, p2) !== this._checkCounterclockwise(p, p1, p3);
  },

  /** check to see if points are in counterclockwise order */
  _checkCounterclockwise(p: L.Point, p1: L.Point, p2: L.Point): boolean {
    return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
  },
});

export default LineUtilIntersect;
