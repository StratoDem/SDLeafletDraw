'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var ControlDraw = _leaflet2.default.Control.extend({
  options: DEFAULT_CD_OPTIONS,

  initialize: function initialize(options) {
    if (_leaflet2.default.version < '0.7') {
      throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. ' + 'Download latest from https://github.com/Leaflet/Leaflet/');
    }

    _leaflet2.default.Control.prototype.initialize.call(this, options);

    var toolbar = void 0;
    this._toolbars = {};

    if (_DrawToolbar2.default && this.options.draw) {
      toolbar = new _DrawToolbar2.default(this.options.draw);

      this._toolbars[_DrawToolbar2.default.TYPE] = toolbar;

      this._toolbars[_DrawToolbar2.default.TYPE].on('enable', this._toolbarEnabled, this);
    }

    if (_EditToolbar2.default && this.options.edit) {
      toolbar = new _EditToolbar2.default(this.options.edit);

      this._toolbars[_EditToolbar2.default.TYPE] = toolbar;

      this._toolbars[_EditToolbar2.default.TYPE].on('enable', this._toolbarEnabled, this);
    }
    _leaflet2.default.toolbar = this;
  },
  onAdd: function onAdd(map) {
    var _this = this;

    var container = _leaflet2.default.DomUtil.create('div', 'leaflet-draw');
    var addedTopClass = false;
    var topClassName = 'leaflet-draw-toolbar-top';

    Object.keys(this._toolbars).forEach(function (k) {
      var toolbarContainer = _this._toolbars[k].addToolbar(map);

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
  },
  onRemove: function onRemove() {
    var _this2 = this;

    Object.keys(this._toolbars).forEach(function (k) {
      _this2._toolbars[k].removeToolbar();
    });
  },
  setDrawingOptions: function setDrawingOptions(options) {
    var _this3 = this;

    Object.keys(this._toolbars).forEach(function (k) {
      if (_this3._toolbars[k] instanceof _DrawToolbar2.default) _this3._toolbars[k].setOptions(options);
    });
  },
  _toolbarEnabled: function _toolbarEnabled(event) {
    var _this4 = this;

    var enabledToolbar = event.target;

    Object.keys(this._toolbars).forEach(function (k) {
      if (_this4._toolbars[k] !== enabledToolbar) _this4._toolbars[k].disable();
    });
  }
});

_leaflet2.default.Map.mergeOptions({
  drawControlTooltips: true,
  drawControl: false
});

_leaflet2.default.Map.addInitHook(function addHook() {
  if (this.options.drawControl) {
    this.drawControl = new ControlDraw();
    this.addControl(this.drawControl);
  }
});

exports.default = ControlDraw;