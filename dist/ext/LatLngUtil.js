'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LatLngUtil = {
  cloneLatLngs: function cloneLatLngs(latlngs) {
    var _this = this;

    return latlngs.map(function (ll) {
      return Array.isArray(ll) ? _this.cloneLatLngs(ll) : _this.cloneLatLng(ll);
    });
  },
  cloneLatLng: function cloneLatLng(latlng) {
    return _leaflet2.default.latLng(latlng.lat, latlng.lng);
  }
};

exports.default = LatLngUtil;