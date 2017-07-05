'use strict';

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _Control = require('./Control.Draw');

var _Control2 = _interopRequireDefault(_Control);

var _Event = require('./Event');

var _Event2 = _interopRequireDefault(_Event);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leaflet2.default.Control.Draw = _Control2.default;
_leaflet2.default.Draw = { Event: _Event2.default };