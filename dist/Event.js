'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});


var eventTypes = {
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
  DELETESTOP: 'draw:deletestop'
};

exports.default = eventTypes;