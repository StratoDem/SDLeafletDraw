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

var _draw = require('../draw');

var _draw2 = _interopRequireDefault(_draw);

var _Toolbar2 = require('../Toolbar');

var _Toolbar3 = _interopRequireDefault(_Toolbar2);

var _constants = require('./handler/constants');

var _index = require('./handler/index');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_EDITTOOLBAR_OPTIONS = {
  edit: {
    selectedPathOptions: {
      dashArray: '10, 10',

      fill: true,
      fillColor: '#fe57a1',
      fillOpacity: 0.1,

      // Whether to user the existing layers color
      maintainColor: false
    }
  },
  remove: {},
  poly: null,
  featureGroup: null /* REQUIRED!
                     TODO: perhaps if not set then all layers on the map are selectable? */
}; /** 
    * StratoDem Analytics : EditToolbar
    * Principal Author(s) : Michael Clawar
    * Secondary Author(s) :
    * Description :
    *
    *  (c) 2016- StratoDem Analytics, LLC
    *  All Rights Reserved
    */

var EditToolbar = function (_Toolbar) {
  (0, _inherits3.default)(EditToolbar, _Toolbar);

  function EditToolbar() {
    (0, _classCallCheck3.default)(this, EditToolbar);
    return (0, _possibleConstructorReturn3.default)(this, (EditToolbar.__proto__ || Object.getPrototypeOf(EditToolbar)).apply(this, arguments));
  }

  (0, _createClass3.default)(EditToolbar, [{
    key: 'initialize',
    value: function initialize(options) {
      this._toolbarClass = 'leaflet-draw-edit';

      (0, _get3.default)(EditToolbar.prototype.__proto__ || Object.getPrototypeOf(EditToolbar.prototype), 'initialize', this).call(this, {
        edit: {
          selectedPathOptions: (0, _extends3.default)({}, EditToolbar.options.edit.selectedPathOptions, typeof options.edit !== 'undefined' && options.edit.selectedPathOptions !== 'undefined' ? options.edit.selectedPathOptions : {})
        },
        remove: (0, _extends3.default)({}, EditToolbar.options.remove, options.remove),
        poly: (0, _extends3.default)({}, EditToolbar.options.poly, options.poly),
        featureGroup: options.featureGroup
      });

      this._selectedFeatureCount = 0;
    }

    /** Get mode handlers information **/

  }, {
    key: 'getModeHandlers',
    value: function getModeHandlers(map) {
      var featureGroup = this.options.featureGroup;
      return [{
        enabled: this.options.edit,
        handler: new _index.Edit(map, {
          featureGroup: featureGroup,
          selectedPathOptions: this.options.edit.selectedPathOptions,
          poly: this.options.poly
        }),
        title: _draw2.default.edit.toolbar.buttons.edit
      }, {
        enabled: this.options.remove,
        handler: new _index.Delete(map, { featureGroup: featureGroup }),
        title: _draw2.default.edit.toolbar.buttons.remove
      }];
    }

    /** Get actions information **/

  }, {
    key: 'getActions',
    value: function getActions() {
      return [{
        title: _draw2.default.edit.toolbar.actions.save.title,
        text: _draw2.default.edit.toolbar.actions.save.text,
        callback: this._save,
        context: this
      }, {
        title: _draw2.default.edit.toolbar.actions.cancel.title,
        text: _draw2.default.edit.toolbar.actions.cancel.text,
        callback: this.disable,
        context: this
      }];
    }

    /** Adds the toolbar to the map **/

  }, {
    key: 'addToolbar',
    value: function addToolbar(map) {
      var container = (0, _get3.default)(EditToolbar.prototype.__proto__ || Object.getPrototypeOf(EditToolbar.prototype), 'addToolbar', this).call(this, map);
      this._checkDisabled();

      this.options.featureGroup.on('layeradd layerremove', this._checkDisabled, this);

      return container;
    }
  }, {
    key: 'removeToolbar',
    value: function removeToolbar() {
      this.options.featureGroup.off('layeradd layerremove', this._checkDisabled, this);

      (0, _get3.default)(EditToolbar.prototype.__proto__ || Object.getPrototypeOf(EditToolbar.prototype), 'removeToolbar', this).call(this);
    }

    /** Disables the toolbar **/

  }, {
    key: 'disable',
    value: function disable() {
      if (!this.enabled()) return;

      this._activeMode.handler.revertLayers();
      (0, _get3.default)(EditToolbar.prototype.__proto__ || Object.getPrototypeOf(EditToolbar.prototype), 'disable', this).call(this);
    }
  }, {
    key: '_save',
    value: function _save() {
      this._activeMode.handler.save();
      if (this._activeMode) this._activeMode.handler.disable();
    }
  }, {
    key: '_clearAllLayers',
    value: function _clearAllLayers() {
      this._activeMode.handler.removeAllLayers();
      if (this._activeMode) this._activeMode.handler.disable();
    }
  }, {
    key: '_checkDisabled',
    value: function _checkDisabled() {
      var featureGroup = this.options.featureGroup;
      var hasLayers = featureGroup.getLayers().length !== 0;
      var button = void 0;

      if (this.options.edit) {
        button = this._modes[_index.Edit.TYPE].button;

        if (hasLayers) _leaflet2.default.DomUtil.removeClass(button, 'leaflet-disabled');else _leaflet2.default.DomUtil.addClass(button, 'leaflet-disabled');

        button.setAttribute('title', hasLayers ? _draw2.default.edit.toolbar.buttons.edit : _draw2.default.edit.toolbar.buttons.editDisabled);
      }

      if (this.options.remove) {
        button = this._modes[_index.Delete.TYPE].button;

        if (hasLayers) _leaflet2.default.DomUtil.removeClass(button, 'leaflet-disabled');else _leaflet2.default.DomUtil.addClass(button, 'leaflet-disabled');

        button.setAttribute('title', hasLayers ? _draw2.default.edit.toolbar.buttons.remove : _draw2.default.edit.toolbar.buttons.removeDisabled);
      }
    }
  }]);
  return EditToolbar;
}(_Toolbar3.default);

EditToolbar.TYPE = _constants.TYPE_EDIT;
EditToolbar.options = DEFAULT_EDITTOOLBAR_OPTIONS;
exports.default = EditToolbar;

//# sourceMappingURL=EditToolbar.js.map