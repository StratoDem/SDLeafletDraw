'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseToolbar = function (_L$Class) {
  (0, _inherits3.default)(BaseToolbar, _L$Class);

  function BaseToolbar() {
    (0, _classCallCheck3.default)(this, BaseToolbar);
    return (0, _possibleConstructorReturn3.default)(this, (BaseToolbar.__proto__ || Object.getPrototypeOf(BaseToolbar)).apply(this, arguments));
  }

  (0, _createClass3.default)(BaseToolbar, [{
    key: 'initialize',
    value: function initialize(options) {
      _leaflet2.default.setOptions(this, options);

      this._modes = {};
      this._actionButtons = [];
      this._activeMode = null;
    }
  }, {
    key: 'enabled',
    value: function enabled() {
      return this._activeMode !== null;
    }
  }, {
    key: 'disable',
    value: function disable() {
      if (!this.enabled()) return;

      if (this._activeMode === null) return;
      this._activeMode.handler.disable();
    }
  }, {
    key: 'addToolbar',
    value: function addToolbar(map) {
      var _this2 = this;

      var container = _leaflet2.default.DomUtil.create('div', 'leaflet-draw-section');
      var buttonIndex = 0;
      var buttonClassPrefix = this._toolbarClass || '';

      this._toolbarContainer = _leaflet2.default.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar');
      this._map = map;

      this.getModeHandlers(map).forEach(function (mh) {
        if (mh.enabled) _this2._initModeHandler(mh.handler, _this2._toolbarContainer, buttonIndex += 1, buttonClassPrefix, mh.title);
      });

      if (buttonIndex === 0) return null;

      this._lastButtonIndex = buttonIndex - 1;

      this._actionsContainer = _leaflet2.default.DomUtil.create('ul', 'leaflet-draw-actions');

      container.appendChild(this._toolbarContainer);
      container.appendChild(this._actionsContainer);

      return container;
    }
  }, {
    key: 'removeToolbar',
    value: function removeToolbar() {
      var _this3 = this;

      Object.keys(this._modes).forEach(function (k) {
        var mode = _this3._modes[k];
        BaseToolbar._disposeButton(mode.button, mode.handler.enable);

        mode.handler.disable();

        mode.handler.off('enabled', _this3._handlerActivated, _this3).off('disabled', _this3._handlerDeactivated, _this3);
      });
      this._modes = {};

      this._actionButtons.forEach(function (button) {
        return BaseToolbar._disposeButton(button.button, button.callback);
      });
      this._actionButtons = [];
      this._actionsContainer = null;
    }
  }, {
    key: '_initModeHandler',
    value: function _initModeHandler(handler, container, buttonIndex, classNamePrefix, buttonTitle) {
      var type = handler.type;

      var modeHandler = {
        handler: handler,
        button: BaseToolbar._createButton({
          type: type,
          title: buttonTitle,
          className: classNamePrefix + '-' + type,
          container: container,
          callback: handler.enable,
          context: handler
        }),
        buttonIndex: buttonIndex
      };
      modeHandler.handler.on('enabled', this._handlerActivated, this).on('disabled', this._handlerDeactivated, this);

      this._modes[type] = modeHandler;
    }
  }, {
    key: '_handlerActivated',
    value: function _handlerActivated(event) {
      this.disable();

      this._activeMode = this._modes[event.handler];

      _leaflet2.default.DomUtil.addClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

      this._showActionsToolbar();

      this.fire('enable');
    }
  }, {
    key: '_handlerDeactivated',
    value: function _handlerDeactivated() {
      this._hideActionsToolbar();

      _leaflet2.default.DomUtil.removeClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

      this._activeMode = null;

      this.fire('disable');
    }
  }, {
    key: '_createActions',
    value: function _createActions(handler) {
      var container = this._actionsContainer;
      var buttons = this.getActions(handler);

      this._actionButtons.forEach(function (button) {
        return BaseToolbar._disposeButton(button.button, button.callback);
      });
      this._actionButtons = [];

      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }this._actionButtons = buttons.filter(function (button) {
        return !('enabled' in button && !button.enabled);
      }).map(function (button) {
        return {
          button: BaseToolbar._createButton({
            title: button.title,
            text: button.text,
            container: _leaflet2.default.DomUtil.create('li', '', container),
            callback: button.callback,
            context: button.context
          }),
          callback: button.callback
        };
      });
    }
  }, {
    key: '_showActionsToolbar',
    value: function _showActionsToolbar() {
      if (this._activeMode === null) return;
      var buttonIndex = this._activeMode.buttonIndex;
      var lastButtonIndex = this._lastButtonIndex;
      var toolbarPosition = this._activeMode.button.offsetTop - 1;

      this._createActions(this._activeMode.handler);

      this._actionsContainer.style.top = toolbarPosition + 'px';

      if (buttonIndex === 0) {
        _leaflet2.default.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
        _leaflet2.default.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-top');
      }

      if (buttonIndex === lastButtonIndex) {
        _leaflet2.default.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
        _leaflet2.default.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
      }

      this._actionsContainer.style.display = 'block';
    }
  }, {
    key: '_hideActionsToolbar',
    value: function _hideActionsToolbar() {
      this._actionsContainer.style.display = 'none';

      _leaflet2.default.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
      _leaflet2.default.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
      _leaflet2.default.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-top');
      _leaflet2.default.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
    }
  }], [{
    key: '_createButton',
    value: function _createButton(options) {
      var link = _leaflet2.default.DomUtil.create('a', options.className || '', options.container);

      var sr = _leaflet2.default.DomUtil.create('span', 'sr-only', options.container);

      link.href = '#';
      link.appendChild(sr);

      if (options.title) {
        link.title = options.title;
        sr.innerHTML = options.title;
      }

      if (options.text) {
        link.innerHTML = options.text;
        sr.innerHTML = options.text;
      }

      _leaflet2.default.DomEvent.on(link, 'click', _leaflet2.default.DomEvent.stopPropagation).on(link, 'mousedown', _leaflet2.default.DomEvent.stopPropagation).on(link, 'dblclick', _leaflet2.default.DomEvent.stopPropagation).on(link, 'touchstart', _leaflet2.default.DomEvent.stopPropagation).on(link, 'click', _leaflet2.default.DomEvent.preventDefault).on(link, 'click', options.callback, options.context);

      return link;
    }
  }, {
    key: '_disposeButton',
    value: function _disposeButton(button, callback) {
      _leaflet2.default.DomEvent.off(button, 'click', _leaflet2.default.DomEvent.stopPropagation);
      _leaflet2.default.DomEvent.off(button, 'mousedown', _leaflet2.default.DomEvent.stopPropagation);
      _leaflet2.default.DomEvent.off(button, 'dblclick', _leaflet2.default.DomEvent.stopPropagation);
      _leaflet2.default.DomEvent.off(button, 'touchstart', _leaflet2.default.DomEvent.stopPropagation);
      _leaflet2.default.DomEvent.off(button, 'click', _leaflet2.default.DomEvent.preventDefault);
      _leaflet2.default.DomEvent.off(button, 'click', callback);
    }
  }]);
  return BaseToolbar;
}(_leaflet2.default.Class);

var Toolbar = BaseToolbar.include(_leaflet2.default.Evented.prototype);
exports.default = Toolbar;