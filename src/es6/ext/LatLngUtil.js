/** @flow
 * StratoDem Analytics : LatLngUtil
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';


// TODO import me and add to Leaflet
const LatLngUtil = {
  /** Clone the latLng point or points or nested points and return an array with those points **/
  cloneLatLngs(latlngs: Array<L.LatLng>): Array<L.LatLng> {
    return latlngs.map(ll => // TODO should this be this?
      (Array.isArray(ll) ? this.cloneLatLngs(ll) : this.cloneLatLng(ll)));
  },

  /** Clone the latLng and return a new LatLng object. **/
  cloneLatLng(latlng: L.LatLng): L.LatLng {
    return L.latLng(latlng.lat, latlng.lng);
  },
};

export default LatLngUtil;
