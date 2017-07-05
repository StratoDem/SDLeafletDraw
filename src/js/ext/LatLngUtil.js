'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO import me and add to Leaflet
var LatLngUtil = {
  /** Clone the latLng point or points or nested points and return an array with those points **/
  cloneLatLngs: function cloneLatLngs(latlngs) {
    var _this = this;

    return latlngs.map(function (ll) {
      return (// TODO should this be this?
        Array.isArray(ll) ? _this.cloneLatLngs(ll) : _this.cloneLatLng(ll)
      );
    });
  },


  /** Clone the latLng and return a new LatLng object. **/
  cloneLatLng: function cloneLatLng(latlng) {
    return _leaflet2.default.latLng(latlng.lat, latlng.lng);
  }
}; /** 
    * StratoDem Analytics : LatLngUtil
    * Principal Author(s) : Michael Clawar
    * Secondary Author(s) :
    * Description :
    *
    *  (c) 2016- StratoDem Analytics, LLC
    *  All Rights Reserved
    */

exports.default = LatLngUtil;

//# sourceMappingURL=LatLngUtil.js.map