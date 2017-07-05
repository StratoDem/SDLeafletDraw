'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _draw = require('../draw');

var _draw2 = _interopRequireDefault(_draw);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/** 
 * StratoDem Analytics : GeometryUtil
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

var defaultPrecision = {
  km: 2,
  ha: 2,
  m: 0,
  mi: 2,
  ac: 2,
  yd: 0,
  ft: 0,
  nm: 2
};

// TODO import me and add to Leaflet
var GeometryUtil = _leaflet2.default.extend(_leaflet2.default.GeometryUtil || {}, {
  /** Ported from the OpenLayers implementation.
   * See:
   * https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270
   */
  geodesicArea: function geodesicArea(latLngs) {
    var area = 0.0;
    var d2r = Math.PI / 180;

    if (latLngs.length > 2) {
      latLngs.forEach(function (p1, idx) {
        var p2 = latLngs[(idx + 1) % latLngs.length];

        area += (p2.lng - p1.lng) * d2r * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
      });
      area = area * 6378137.0 * (6378137.0 / 2.0);
    }

    return Math.abs(area);
  },


  /** Returns n in specified number format (if defined) and precision **/
  formattedNumber: function formattedNumber(n, precision) {
    var formatted = n.toFixed(precision);
    var format = _draw2.default.format && _draw2.default.format.numeric;
    var delimiters = format && format.delimiters;
    var thousands = delimiters && delimiters.thousands;
    var decimal = delimiters && delimiters.decimal;

    if (thousands || decimal) {
      var splitValue = formatted.split('.');
      formatted = thousands ? splitValue[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands) : splitValue[0];
      decimal = decimal || '.';
      if (splitValue.length > 1) {
        formatted = formatted + decimal + splitValue[1];
      }
    }

    return formatted;
  },


  /**
   * Returns a readable area string in yards or metric
   * The value will be rounded as defined by the precision option object
   */
  readableArea: function readableArea(area, isMetric, precision) {
    var lPrecision = _leaflet2.default.Util.extend({}, defaultPrecision, precision);

    var areaStr = '';

    if (isMetric) {
      var units = ['ha', 'm'];
      if (typeof isMetric === 'string') units = [isMetric];else if (typeof isMetric !== 'boolean') units = isMetric;

      if (area >= 1000000 && units.indexOf('km') !== -1) {
        areaStr = GeometryUtil.formattedNumber(area * 0.000001, lPrecision.km) + ' km\xB2';
      } else if (area >= 10000 && units.indexOf('ha') !== -1) {
        areaStr = GeometryUtil.formattedNumber(area * 0.0001, lPrecision.ha) + ' ha';
      } else {
        areaStr = GeometryUtil.formattedNumber(area, lPrecision.m) + ' m\xB2';
      }
    } else {
      var nextArea = area / 0.836127; // Square yards in 1 meter

      if (nextArea >= 3097600) {
        // 3097600 square yards in 1 square mile
        areaStr = GeometryUtil.formattedNumber(nextArea / 3097600, lPrecision.mi) + ' mi\xB2';
      } else if (nextArea >= 4840) {
        // 4840 square yards in 1 acre
        areaStr = GeometryUtil.formattedNumber(nextArea / 4840, lPrecision.ac) + ' acres';
      } else {
        areaStr = GeometryUtil.formattedNumber(nextArea, lPrecision.yd) + ' yd\xB2';
      }
    }

    return areaStr;
  },


  /**
   * Converts a metric distance to one of { feet, nauticalMile, metric, yards }
   */
  readableDistance: function readableDistance(distance, isMetric, isFeet, isNauticalMile, precision) {
    var lPrecision = _leaflet2.default.Util.extend({}, defaultPrecision, precision);
    var distanceStr = void 0;
    var lDistance = void 0;
    var units = void 0;

    if (isMetric) {
      units = typeof isMetric === 'string' ? isMetric : 'metric';
    } else if (isFeet) {
      units = 'feet';
    } else if (isNauticalMile) {
      units = 'nauticalMile';
    } else {
      units = 'yards';
    }

    switch (units) {
      case 'metric':
        // show metres when distance is < 1km, then show km
        if (distance > 1000) {
          distanceStr = GeometryUtil.formattedNumber(distance / 1000, lPrecision.km) + ' km';
        } else {
          distanceStr = GeometryUtil.formattedNumber(distance, lPrecision.m) + ' m';
        }
        break;
      case 'feet':
        lDistance = distance * 1.09361 * 3;
        distanceStr = GeometryUtil.formattedNumber(lDistance, lPrecision.ft) + ' ft';

        break;
      case 'nauticalMile':
        lDistance = distance * 0.53996;
        distanceStr = GeometryUtil.formattedNumber(lDistance / 1000, lPrecision.nm) + ' nm';
        break;
      case 'yards':
      default:
        lDistance = distance * 1.09361;

        if (distance > 1760) {
          distanceStr = GeometryUtil.formattedNumber(lDistance / 1760, lPrecision.mi) + ' miles';
        } else {
          distanceStr = GeometryUtil.formattedNumber(lDistance, lPrecision.yd) + ' yards';
        }
        break;
    }
    return distanceStr;
  }
});

exports.default = GeometryUtil;

//# sourceMappingURL=GeometryUtil.js.map