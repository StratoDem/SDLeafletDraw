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

var _draw = require('../../draw');

var _draw2 = _interopRequireDefault(_draw);

var _Feature2 = require('./Feature');

var _Feature3 = _interopRequireDefault(_Feature2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SimpleShape = function (_Feature) {
  (0, _inherits3.default)(SimpleShape, _Feature);

  function SimpleShape() {
    (0, _classCallCheck3.default)(this, SimpleShape);
    return (0, _possibleConstructorReturn3.default)(this, (SimpleShape.__proto__ || Object.getPrototypeOf(SimpleShape)).apply(this, arguments));
  }

  (0, _createClass3.default)(SimpleShape, [{
    key: 'initialize',
    value: function initialize(map, options) {
      this._endLabelText = _draw2.default.draw.handlers.simpleshape.tooltip.end;

      (0, _get3.default)(SimpleShape.prototype.__proto__ || Object.getPrototypeOf(SimpleShape.prototype), 'initialize', this).call(this, map, (0, _extends3.default)({ repeatMode: false }, options));
    }

    /** Add listener hooks to this handler **/

  }, {
    key: 'addHooks',
    value: function addHooks() {
      (0, _get3.default)(SimpleShape.prototype.__proto__ || Object.getPrototypeOf(SimpleShape.prototype), 'addHooks', this).call(this);
      if (this._map) {
        this._mapDraggable = this._map.dragging.enabled();

        if (this._mapDraggable) {
          this._map.dragging.disable();
        }

        // TODO refactor: move cursor to styles
        this._container.style.cursor = 'crosshair';

        this._tooltip.updateContent({ text: this._initialLabelText });

        this._map.on('mousedown', this._onMouseDown, this).on('mousemove', this._onMouseMove, this).on('touchstart', this._onMouseDown, this).on('touchmove', this._onMouseMove, this);
      }
    }

    /** Remove listener hooks from this handler **/

  }, {
    key: 'removeHooks',
    value: function removeHooks() {
      (0, _get3.default)(SimpleShape.prototype.__proto__ || Object.getPrototypeOf(SimpleShape.prototype), 'removeHooks', this).call(this);
      if (this._map) {
        if (this._mapDraggable) this._map.dragging.enable();

        // TODO refactor: move cursor to styles
        this._container.style.cursor = '';

        this._map.off('mousedown', this._onMouseDown, this).off('mousemove', this._onMouseMove, this).off('touchstart', this._onMouseDown, this).off('touchmove', this._onMouseMove, this);

        _leaflet2.default.DomEvent.off(document, 'mouseup', this._onMouseUp, this);
        _leaflet2.default.DomEvent.off(document, 'touchend', this._onMouseUp, this);

        // If the box element doesn't exist mouse hasn't moved, so don't need to destroy/return
        if (this._shape) {
          this._map.removeLayer(this._shape);
          delete this._shape;
        }
      }
      this._isDrawing = false;
    }
  }, {
    key: '_getTooltipText',
    value: function _getTooltipText() {
      return { text: this._endLabelText };
    }
  }, {
    key: '_onMouseDown',
    value: function _onMouseDown(event) {
      this._isDrawing = true;
      this._startLatLng = event.latlng;

      _leaflet2.default.DomEvent.on(document, 'mouseup', this._onMouseUp, this).on(document, 'touchend', this._onMouseUp, this).preventDefault(event.originalEvent);
    }
  }, {
    key: '_onMouseMove',
    value: function _onMouseMove(event) {
      var latlng = event.latlng;

      this._tooltip.updatePosition(latlng);
      if (this._isDrawing) {
        this._tooltip.updateContent(this._getTooltipText());
        this._drawShape(latlng);
      }
    }
  }, {
    key: '_onMouseUp',
    value: function _onMouseUp() {
      if (this._shape) this._fireCreatedEvent();

      this.disable();
      if (this.options.repeatMode) this.enable();
    }
  }]);
  return SimpleShape;
}(_Feature3.default); /** 
                       * StratoDem Analytics : SimpleShape
                       * Principal Author(s) : Michael Clawar
                       * Secondary Author(s) :
                       * Description :
                       *
                       *  (c) 2016- StratoDem Analytics, LLC
                       *  All Rights Reserved
                       */

exports.default = SimpleShape;

//# sourceMappingURL=SimpleShape.js.map