/** @flow
 * StratoDem Analytics : TouchEvents
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

type T_EVENT = {
  pointerType: string,
  touches?: Array<{pageX: number, pageY: number}>,
  pageX: number,
  pageY: number,
  timeStamp: number,
  originalEvent: {timeStamp: number},
  target: {_simulatedClick: Object},
};

L.Map.mergeOptions({touchExtend: true});


class TouchExtend extends L.Handler {
  _map: L.Map;

  initialize(map: L.Map): void {
    this._map = map;
    this._container = map._container;
    this._pane = map._panes.overlayPane;
  }

  /** Adds dom listener events to the map container **/
  addHooks(): void {
    L.DomEvent.on(this._container, 'touchstart', this._onTouchStart, this);
    L.DomEvent.on(this._container, 'touchend', this._onTouchEnd, this);
    L.DomEvent.on(this._container, 'touchmove', this._onTouchMove, this);

    if (TouchExtend._detectIE()) {
      L.DomEvent.on(this._container, 'MSPointerDown', this._onTouchStart, this);
      L.DomEvent.on(this._container, 'MSPointerUp', this._onTouchEnd, this);
      L.DomEvent.on(this._container, 'MSPointerMove', this._onTouchMove, this);
      L.DomEvent.on(this._container, 'MSPointerCancel', this._onTouchCancel, this);
    } else {
      L.DomEvent.on(this._container, 'touchcancel', this._onTouchCancel, this);
      L.DomEvent.on(this._container, 'touchleave', this._onTouchLeave, this);
    }
  }

  /** Removes dom listener events from the map container **/
  removeHooks(): void {
    L.DomEvent.off(this._container, 'touchstart', this._onTouchStart);
    L.DomEvent.off(this._container, 'touchend', this._onTouchEnd);
    L.DomEvent.off(this._container, 'touchmove', this._onTouchMove);
    if (TouchExtend._detectIE()) {
      L.DomEvent.off(this._container, 'MSPointerDowm', this._onTouchStart);
      L.DomEvent.off(this._container, 'MSPointerUp', this._onTouchEnd);
      L.DomEvent.off(this._container, 'MSPointerMove', this._onTouchMove);
      L.DomEvent.off(this._container, 'MSPointerCancel', this._onTouchCancel);
    } else {
      L.DomEvent.off(this._container, 'touchcancel', this._onTouchCancel);
      L.DomEvent.off(this._container, 'touchleave', this._onTouchLeave);
    }
  }

  _touchEvent(event: T_EVENT, type): void {
    // TODO: fix the pageX error that is do a bug in Android
    // where a single touch triggers two click events
    // _filterClick is what leaflet uses as a workaround.
    // This is a problem with more things than just android.
    // Another problem is touchEnd has no touches in its touch list.
    let touchEvent = {};
    if (typeof event.touches !== 'undefined') {
      if (!event.touches.length)
        return;
      touchEvent = event.touches[0];
    } else if (event.pointerType === 'touch') {
      touchEvent = event;
      if (!TouchExtend._filterClick(event))
        return;
    } else
      return;

    const containerPoint = this._map.mouseEventToContainerPoint(touchEvent);
    const layerPoint = this._map.mouseEventToLayerPoint(touchEvent);
    const latlng = this._map.layerPointToLatLng(layerPoint);

    this._map.fire(type, {
      latlng,
      layerPoint,
      containerPoint,
      pageX: touchEvent.pageX,
      pageY: touchEvent.pageY,
      originalEvent: event,
    });
  }

  /** Borrowed from Leaflet and modified for bool ops **/
  static _filterClick(event: T_EVENT): boolean {
    const timeStamp = (event.timeStamp || event.originalEvent.timeStamp);
    const elapsed = L.DomEvent._lastClick && (timeStamp - L.DomEvent._lastClick);

    // are they closer together than 500ms yet more than 100ms?
    // Android typically triggers them ~300ms apart while multiple listeners
    // on the same event should be triggered far faster;
    // or check if click is simulated on the element, and if it is, reject any non-simulated events
    if ((elapsed && elapsed > 100 && elapsed < 500)
      || (event.target._simulatedClick && !event._simulated)) {
      L.DomEvent.stop(event);
      return false;
    }

    L.DomEvent._lastClick = timeStamp;
    return true;
  }

  _onTouchStart(event: T_EVENT): void {
    if (!this._map._loaded)
      return;

    const type = 'touchstart';
    this._touchEvent(event, type);
  }

  _onTouchEnd(event: T_EVENT): void {
    if (!this._map._loaded)
      return;

    const type = 'touchend';
    this._touchEvent(event, type);
  }

  _onTouchCancel(event: T_EVENT): void {
    if (!this._map._loaded)
      return;

    const type = TouchExtend._detectIE() ? 'pointercancel' : 'touchcancel';
    this._touchEvent(event, type);
  }

  _onTouchLeave(event: T_EVENT): void {
    if (!this._map._loaded)
      return;

    const type = 'touchleave';
    this._touchEvent(event, type);
  }

  _onTouchMove(event: T_EVENT): void {
    if (!this._map._loaded)
      return;

    const type = 'touchmove';
    this._touchEvent(event, type);
  }

  static _detectIE(): number | false {
    const ua = window.navigator.userAgent;

    const msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    const trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      const rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    const edge = ua.indexOf('Edge/');
    if (edge > 0) {
      // IE 12 => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
  }
}

L.Map.addInitHook('addHandler', 'touchExtend', TouchExtend);


/**
 * This isn't full Touch support.
 * This is just to get markers to also support dom touch events after creation
 * #TODO: find a better way of getting markers to support touch.
 */
export class TouchMarker extends L.Marker {
  _initInteraction(): Object {
    if (!this.addInteractiveTarget) // 0.7.x support $FlowFixMe
      return this._initInteractionLegacy();

    // TODO this may need be updated to re-add touch events for 1.0+
    return super._initInteraction();
  }

  /** This is an exact copy of https://github.com/Leaflet/Leaflet/blob/v0.7/src/layer/marker/Marker.js
   * with the addition of the touch events
   **/
  _initInteractionLegacy(): void {
    if (!this.options.clickable)
      return;

    // TODO refactor into something shared with Map/Path/etc. to DRY it up
    const icon = this._icon;
    const events = [
      'dblclick',
      'mousedown',
      'mouseover',
      'mouseout',
      'contextmenu',
      'touchstart',
      'touchend',
      'touchmove',
    ];
    if (TouchMarker._detectIE)
      events.concat(['MSPointerDown', 'MSPointerUp', 'MSPointerMove', 'MSPointerCancel']);
    else
      events.concat(['touchcancel']);

    L.DomUtil.addClass(icon, 'leaflet-clickable');
    L.DomEvent.on(icon, 'click', this._onMouseClick, this);
    L.DomEvent.on(icon, 'keypress', this._onKeyPress, this);

    events.forEach(event => L.DomEvent.on(icon, event, this._fireMouseEvent, this));

    if (L.Handler.MarkerDrag) {
      this.dragging = new L.Handler.MarkerDrag(this);

      if (this.options.draggable)
        this.dragging.enable();
    }
  }

  static _detectIE(): number | false {
    const ua = window.navigator.userAgent;

    const msie = ua.indexOf('MSIE ');
    if (msie > 0) {
      // IE 10 or older => return version number
      return parseInt(ua.substring(msie + 5, ua.indexOf('.', msie)), 10);
    }

    const trident = ua.indexOf('Trident/');
    if (trident > 0) {
      // IE 11 => return version number
      const rv = ua.indexOf('rv:');
      return parseInt(ua.substring(rv + 3, ua.indexOf('.', rv)), 10);
    }

    const edge = ua.indexOf('Edge/');
    if (edge > 0) {
      // IE 12 => return version number
      return parseInt(ua.substring(edge + 5, ua.indexOf('.', edge)), 10);
    }

    // other browser
    return false;
  }
}
