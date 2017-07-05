'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _get2 = require('babel-runtime/helpers/get');

var _get3 = _interopRequireDefault(_get2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _Toolbar2 = require('../Toolbar');

var _Toolbar3 = _interopRequireDefault(_Toolbar2);

var _draw = require('../draw');

var _draw2 = _interopRequireDefault(_draw);

var _index = require('./handler/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var INITIAL_OPTIONS = {
  polyline: {},
  polygon: {},
  rectangle: {},
  circle: {},
  marker: {}
};

var DrawToolbar = function (_Toolbar) {
  (0, _inherits3.default)(DrawToolbar, _Toolbar);

  function DrawToolbar() {
    (0, _classCallCheck3.default)(this, DrawToolbar);
    return (0, _possibleConstructorReturn3.default)(this, (DrawToolbar.__proto__ || Object.getPrototypeOf(DrawToolbar)).apply(this, arguments));
  }

  (0, _createClass3.default)(DrawToolbar, [{
    key: 'initialize',
    value: function initialize(options) {
      var updatedOptions = {};

      Object.keys(DrawToolbar.options).forEach(function (type) {
        if (options[type]) updatedOptions[type] = (0, _extends3.default)({}, DrawToolbar.options[type], options[type]);
      });

      this._toolbarClass = 'leaflet-draw-draw';
      (0, _get3.default)(DrawToolbar.prototype.__proto__ || Object.getPrototypeOf(DrawToolbar.prototype), 'initialize', this).call(this, updatedOptions);
    }
  }, {
    key: 'getModeHandlers',
    value: function getModeHandlers(map) {
      return [{
        enabled: this.options.polyline,
        handler: new _index.Polyline(map, this.options.polyline),
        title: _draw2.default.draw.toolbar.buttons.polyline
      }, {
        enabled: this.options.polygon,
        handler: new _index.Polygon(map, this.options.polygon),
        title: _draw2.default.draw.toolbar.buttons.polygon
      }, {
        enabled: this.options.rectangle,
        handler: new _index.Rectangle(map, this.options.rectangle),
        title: _draw2.default.draw.toolbar.buttons.rectangle
      }, {
        enabled: this.options.circle,
        handler: new _index.Circle(map, this.options.circle),
        title: _draw2.default.draw.toolbar.buttons.circle
      }, {
        enabled: this.options.marker,
        handler: new _index.Marker(map, this.options.marker),
        title: _draw2.default.draw.toolbar.buttons.marker
      }];
    }
  }, {
    key: 'getActions',
    value: function getActions(handler) {
      return [{
        enabled: handler.completeShape,
        title: _draw2.default.draw.toolbar.finish.title,
        text: _draw2.default.draw.toolbar.finish.text,
        callback: handler.completeShape,
        context: handler
      }, {
        enabled: handler.deleteLastVertex,
        title: _draw2.default.draw.toolbar.undo.title,
        text: _draw2.default.draw.toolbar.undo.text,
        callback: handler.deleteLastVertex,
        context: handler
      }, {
        title: _draw2.default.draw.toolbar.actions.title,
        text: _draw2.default.draw.toolbar.actions.text,
        callback: this.disable,
        context: this
      }];
    }
  }, {
    key: 'setOptions',
    value: function setOptions(options) {
      var _this2 = this;

      _leaflet2.default.setOptions(this, options);

      Object.keys(this._modes).forEach(function (type) {
        if (options[type]) _this2._modes[type].handler.setOptions(options[type]);
      });
    }
  }]);
  return DrawToolbar;
}(_Toolbar3.default);

DrawToolbar.options = INITIAL_OPTIONS;
DrawToolbar.TYPE = 'draw';
exports.default = DrawToolbar;