/** @flow
 * StratoDem Analytics : index
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import DrawControl from './Control.Draw';
import Event from './Event';

L.Control.Draw = DrawControl;
L.Draw = {Event};
