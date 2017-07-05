'use strict';

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _LineUtil = require('./LineUtil.Intersect');

var _LineUtil2 = _interopRequireDefault(_LineUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** 
 * StratoDem Analytics : Polyline.Intersect
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

_leaflet2.default.Polyline.include({

  /**
   * Check to see if this polyline has any linesegments that intersect.
   * NOTE: does not support detecting intersection for degenerate cases.
   **/
  intersects: function intersects() {
    if (this._tooFewPointsForIntersection()) {
      return false;
    }

    var points = this._getProjectedPoints();
    var len = points ? points.length : 0;

    for (var i = len - 1; i >= 3; i -= 1) {
      var p = points[i - 1];
      var p1 = points[i];

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
  newLatLngIntersects: function newLatLngIntersects(latlng, skipFirst) {
    // Cannot check a polyline for intersecting lats/lngs when not added to the map
    if (!this._map) return false;

    return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst);
  },


  /**
   * Check for intersection if new point was added to this polyline
   * newPoint must be a layer point
   * NOTE: Does not support detecting intersection for degenerate cases.
   */
  newPointIntersects: function newPointIntersects(newPoint, skipFirst) {
    if (this._tooFewPointsForIntersection(1)) return false;

    var points = this._getProjectedPoints();
    var len = points ? points.length : 0;
    var lastPoint = points ? points[len - 1] : null;
    // The previous previous line segment. Previous line segment doesn't need testing.
    var maxIndex = len - 2;

    return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, skipFirst ? 1 : 0);
  },


  /**
   * Polylines with 2 sides can only intersect in cases where points are collinear
   * (we don't support detecting these).
   * Cannot have intersection when < 3 line segments (< 4 points)
   */
  _tooFewPointsForIntersection: function _tooFewPointsForIntersection(extraPoints) {
    var points = this._getProjectedPoints();
    var len = points ? points.length : 0;
    // Increment length by extraPoints if present
    len += extraPoints || 0;

    return !points || len <= 3;
  },


  /**
   * Checks a line segment intersection with any line segment before its predecessor.
   * Don't need to check the predecessor as it will never intersect.
   */
  _lineSegmentsIntersectsRange: function _lineSegmentsIntersectsRange(p, p1, maxIndex, minIndex) {
    var points = this._getProjectedPoints();

    var nextMinIndex = minIndex || 0;

    // Check all previous line segments (beside the immediately previous) for intersections
    for (var j = maxIndex; j > nextMinIndex; j -= 1) {
      var p2 = points[j - 1];
      var p3 = points[j];

      if (_LineUtil2.default.segmentsIntersect(p, p1, p2, p3)) {
        return true;
      }
    }

    return false;
  },
  _getProjectedPoints: function _getProjectedPoints() {
    var _this = this;

    if (!this._defaultShape) return this._originalPoints;

    return this._defaultShape().map(function (s) {
      return _this._map.latLngToLayerPoint(s);
    });
  }
});

//# sourceMappingURL=Polyline.Intersect.js.map