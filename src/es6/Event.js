/** @flow
 * StratoDem Analytics : Event
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

const eventTypes = {
  CREATED: 'draw:created',
  EDITED: 'draw:edited',
  DELETED: 'draw:deleted',
  DRAWSTART: 'draw:drawstart',
  DRAWSTOP: 'draw:drawstop',
  DRAWVERTEX: 'draw:drawvertex',
  EDITSTART: 'draw:editstart',
  EDITMOVE: 'draw:editmove',
  EDITRESIZE: 'draw:editresize',
  EDITVERTEX: 'draw:editvertex',
  EDITSTOP: 'draw:editstop',
  DELETESTART: 'draw:deletestart',
  DELETESTOP: 'draw:deletestop',
};

export default eventTypes;
