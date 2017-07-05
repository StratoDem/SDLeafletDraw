'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LineUtilIntersect = _leaflet2.default.Util.extend({
  /**
   * Checks to see if two line segments intersect. Does not handle degenerate cases.
   * http://compgeom.cs.uiuc.edu/~jeffe/teaching/373/notes/x06-sweepline.pdf
   **/
  segmentsIntersect: function segmentsIntersect(p, p1, p2, p3) {
    return this._checkCounterclockwise(p, p2, p3) !== this._checkCounterclockwise(p1, p2, p3) && this._checkCounterclockwise(p, p1, p2) !== this._checkCounterclockwise(p, p1, p3);
  },


  /** check to see if points are in counterclockwise order **/
  _checkCounterclockwise: function _checkCounterclockwise(p, p1, p2) {
    return (p2.y - p.y) * (p1.x - p.x) > (p1.y - p.y) * (p2.x - p.x);
  }
}); /** 
     * StratoDem Analytics : LineUtil.Intersect
     * Principal Author(s) : Michael Clawar
     * Secondary Author(s) :
     * Description :
     *
     *  (c) 2016- StratoDem Analytics, LLC
     *  All Rights Reserved
     */

exports.default = LineUtilIntersect;

//# sourceMappingURL=LineUtil.Intersect.js.map