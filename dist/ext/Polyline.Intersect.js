'use strict';

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _LineUtil = require('./LineUtil.Intersect');

var _LineUtil2 = _interopRequireDefault(_LineUtil);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leaflet2.default.Polyline.include({
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
  newLatLngIntersects: function newLatLngIntersects(latlng, skipFirst) {
    if (!this._map) return false;

    return this.newPointIntersects(this._map.latLngToLayerPoint(latlng), skipFirst);
  },
  newPointIntersects: function newPointIntersects(newPoint, skipFirst) {
    if (this._tooFewPointsForIntersection(1)) return false;

    var points = this._getProjectedPoints();
    var len = points ? points.length : 0;
    var lastPoint = points ? points[len - 1] : null;

    var maxIndex = len - 2;

    return this._lineSegmentsIntersectsRange(lastPoint, newPoint, maxIndex, skipFirst ? 1 : 0);
  },
  _tooFewPointsForIntersection: function _tooFewPointsForIntersection(extraPoints) {
    var points = this._getProjectedPoints();
    var len = points ? points.length : 0;

    len += extraPoints || 0;

    return !points || len <= 3;
  },
  _lineSegmentsIntersectsRange: function _lineSegmentsIntersectsRange(p, p1, maxIndex, minIndex) {
    var points = this._getProjectedPoints();

    var nextMinIndex = minIndex || 0;

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