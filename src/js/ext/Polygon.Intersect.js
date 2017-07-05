'use strict';

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leaflet2.default.Polygon.include({
  /** Checks a polygon for any intersecting line segments. Ignores holes. **/
  intersects: function intersects() {
    if (this._tooFewPointsForIntersection()) return false;

    var points = this._getProjectedPoints();
    var polylineIntersects = _leaflet2.default.Polyline.prototype.intersects.call(this);

    // If already found an intersection don't need to check for any more.
    if (polylineIntersects) return true;

    var len = points.length;
    var firstPoint = points[0];
    var lastPoint = points[len - 1];
    var maxIndex = len - 2;

    // Check the line segment between last and first point.
    // Don't need to check the first line segment (minIndex = 1)
    return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1);
  }
}); /** 
     * StratoDem Analytics : Polygon.Intersect
     * Principal Author(s) : Michael Clawar
     * Secondary Author(s) :
     * Description :
     *
     *  (c) 2016- StratoDem Analytics, LLC
     *  All Rights Reserved
     */

//# sourceMappingURL=Polygon.Intersect.js.map