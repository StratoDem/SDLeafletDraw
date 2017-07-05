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

var _DrawToolbar = require('./draw/DrawToolbar');

var _DrawToolbar2 = _interopRequireDefault(_DrawToolbar);

var _EditToolbar = require('./edit/EditToolbar');

var _EditToolbar2 = _interopRequireDefault(_EditToolbar);

var _Toolbar = require('./Toolbar');

var _Toolbar2 = _interopRequireDefault(_Toolbar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_CD_OPTIONS = {
  position: 'topleft',
  draw: {},
  edit: false
};

var DrawControl = function (_L$Control) {
  (0, _inherits3.default)(DrawControl, _L$Control);

  function DrawControl() {
    (0, _classCallCheck3.default)(this, DrawControl);
    return (0, _possibleConstructorReturn3.default)(this, (DrawControl.__proto__ || Object.getPrototypeOf(DrawControl)).apply(this, arguments));
  }

  (0, _createClass3.default)(DrawControl, [{
    key: 'initialize',
    value: function initialize(options) {
      if (_leaflet2.default.version < '0.7') {
        throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. ' + 'Download latest from https://github.com/Leaflet/Leaflet/');
      }

      (0, _get3.default)(DrawControl.prototype.__proto__ || Object.getPrototypeOf(DrawControl.prototype), 'initialize', this).call(this, (0, _extends3.default)({}, DrawControl.options, options));
      this._toolbars = {};

      if (_DrawToolbar2.default && this.options.draw) {
        this._toolbars[_DrawToolbar2.default.TYPE] = new _DrawToolbar2.default(this.options.draw);

        this._toolbars[_DrawToolbar2.default.TYPE].on('enable', this._toolbarEnabled, this);
      }

      if (_EditToolbar2.default && this.options.edit) {
        this._toolbars[_EditToolbar2.default.TYPE] = new _EditToolbar2.default(this.options.edit);

        this._toolbars[_EditToolbar2.default.TYPE].on('enable', this._toolbarEnabled, this);
      }
      _leaflet2.default.toolbar = this;
    }
  }, {
    key: 'onAdd',
    value: function onAdd(map) {
      var _this2 = this;

      var container = _leaflet2.default.DomUtil.create('div', 'leaflet-draw');
      var addedTopClass = false;
      var topClassName = 'leaflet-draw-toolbar-top';

      Object.keys(this._toolbars).forEach(function (k) {
        var toolbarContainer = _this2._toolbars[k].addToolbar(map);

        if (toolbarContainer) {
          if (!addedTopClass) {
            if (!_leaflet2.default.DomUtil.hasClass(toolbarContainer, topClassName)) {
              _leaflet2.default.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
            }
            addedTopClass = true;
          }

          container.appendChild(toolbarContainer);
        }
      });

      return container;
    }
  }, {
    key: 'onRemove',
    value: function onRemove() {
      var _this3 = this;

      Object.keys(this._toolbars).forEach(function (k) {
        _this3._toolbars[k].removeToolbar();
      });
    }
  }, {
    key: 'setDrawingOptions',
    value: function setDrawingOptions(options) {
      var _this4 = this;

      Object.keys(this._toolbars).forEach(function (k) {
        if (_this4._toolbars[k] instanceof _DrawToolbar2.default) _this4._toolbars[k].setOptions(options);
      });
    }
  }, {
    key: '_toolbarEnabled',
    value: function _toolbarEnabled(event) {
      var _this5 = this;

      var enabledToolbar = event.target;

      Object.keys(this._toolbars).forEach(function (k) {
        if (_this5._toolbars[k] !== enabledToolbar) _this5._toolbars[k].disable();
      });
    }
  }]);
  return DrawControl;
}(_leaflet2.default.Control);

DrawControl.options = DEFAULT_CD_OPTIONS;
exports.default = DrawControl;


_leaflet2.default.Map.mergeOptions({
  drawControlTooltips: true,
  drawControl: false
});

_leaflet2.default.Map.addInitHook(function addHook() {
  if (this.options.drawControl) {
    this.drawControl = new DrawControl();
    this.addControl(this.drawControl);
  }
});