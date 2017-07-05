/** @flow
 * StratoDem Analytics : GeometryUtil
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import drawLocal from '../draw';

const defaultPrecision = {
  km: 2,
  ha: 2,
  m: 0,
  mi: 2,
  ac: 2,
  yd: 0,
  ft: 0,
  nm: 2,
};

// TODO import me and add to Leaflet
const GeometryUtil = L.extend(L.GeometryUtil || {}, {
  /** Ported from the OpenLayers implementation.
   * See:
   * https://github.com/openlayers/openlayers/blob/master/lib/OpenLayers/Geometry/LinearRing.js#L270
   */
  geodesicArea(latLngs: Array<L.LatLng>): number {
    let area = 0.0;
    const d2r = Math.PI / 180;

    if (latLngs.length > 2) {
      latLngs.forEach((p1, idx) => {
        const p2 = latLngs[(idx + 1) % latLngs.length];

        area += ((p2.lng - p1.lng) * d2r)
          * (2 + Math.sin(p1.lat * d2r) + Math.sin(p2.lat * d2r));
      });
      area = (area * 6378137.0) * (6378137.0 / 2.0);
    }

    return Math.abs(area);
  },

  /** Returns n in specified number format (if defined) and precision **/
  formattedNumber(n: number, precision: number): string {
    let formatted = n.toFixed(precision);
    const format = drawLocal.format && drawLocal.format.numeric;
    const delimiters = format && format.delimiters;
    const thousands = delimiters && delimiters.thousands;
    let decimal = delimiters && delimiters.decimal;

    if (thousands || decimal) {
      const splitValue = formatted.split('.');
      formatted = thousands
        ? splitValue[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, `$1${thousands}`)
        : splitValue[0];
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
  readableArea(area: number, isMetric: boolean, precision: Object): string {
    const lPrecision = L.Util.extend({}, defaultPrecision, precision);

    let areaStr = '';

    if (isMetric) {
      let units = ['ha', 'm'];
      if (typeof isMetric === 'string')
        units = [isMetric];
      else if (typeof isMetric !== 'boolean')
        units = isMetric;

      if (area >= 1000000 && units.indexOf('km') !== -1) {
        areaStr = `${GeometryUtil.formattedNumber(area * 0.000001, lPrecision.km)} km²`;
      } else if (area >= 10000 && units.indexOf('ha') !== -1) {
        areaStr = `${GeometryUtil.formattedNumber(area * 0.0001, lPrecision.ha)} ha`;
      } else {
        areaStr = `${GeometryUtil.formattedNumber(area, lPrecision.m)} m²`;
      }
    } else {
      const nextArea = area / 0.836127; // Square yards in 1 meter

      if (nextArea >= 3097600) { // 3097600 square yards in 1 square mile
        areaStr = `${GeometryUtil.formattedNumber(nextArea / 3097600, lPrecision.mi)} mi²`;
      } else if (nextArea >= 4840) { // 4840 square yards in 1 acre
        areaStr = `${GeometryUtil.formattedNumber(nextArea / 4840, lPrecision.ac)} acres`;
      } else {
        areaStr = `${GeometryUtil.formattedNumber(nextArea, lPrecision.yd)} yd²`;
      }
    }

    return areaStr;
  },

  /**
   * Converts a metric distance to one of { feet, nauticalMile, metric, yards }
   */
  readableDistance(distance: number, isMetric: boolean, isFeet: boolean,
                   isNauticalMile: boolean, precision: Object): string {
    const lPrecision = L.Util.extend({}, defaultPrecision, precision);
    let distanceStr;
    let lDistance;
    let units;

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
          distanceStr = `${GeometryUtil.formattedNumber(distance / 1000, lPrecision.km)} km`;
        } else {
          distanceStr = `${GeometryUtil.formattedNumber(distance, lPrecision.m)} m`;
        }
        break;
      case 'feet':
        lDistance = distance * 1.09361 * 3;
        distanceStr = `${GeometryUtil.formattedNumber(lDistance, lPrecision.ft)} ft`;

        break;
      case 'nauticalMile':
        lDistance = distance * 0.53996;
        distanceStr = `${GeometryUtil.formattedNumber(lDistance / 1000, lPrecision.nm)} nm`;
        break;
      case 'yards':
      default:
        lDistance = distance * 1.09361;

        if (distance > 1760) {
          distanceStr = `${GeometryUtil.formattedNumber(lDistance / 1760, lPrecision.mi)} miles`;
        } else {
          distanceStr = `${GeometryUtil.formattedNumber(lDistance, lPrecision.yd)} yards`;
        }
        break;
    }
    return distanceStr;
  },
});

export default GeometryUtil;
