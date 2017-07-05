'use strict';

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leaflet2.default.Polygon.include({
  intersects: function intersects() {
    if (this._tooFewPointsForIntersection()) return false;

    var points = this._getProjectedPoints();
    var polylineIntersects = _leaflet2.default.Polyline.prototype.intersects.call(this);

    if (polylineIntersects) return true;

    var len = points.length;
    var firstPoint = points[0];
    var lastPoint = points[len - 1];
    var maxIndex = len - 2;

    return this._lineSegmentsIntersectsRange(lastPoint, firstPoint, maxIndex, 1);
  }
});