/** @flow
 * StratoDem Analytics : DrawToolbar
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description : Adapted from Leaflet.Draw
 *
 * (c) 2012-2017, Jacob Toye, Jon West, Smartrak, Leaflet
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import Toolbar from '../Toolbar';
import drawLocal from '../draw';
import { Circle, Marker, Polyline, Polygon, Rectangle } from './handler/index';


/** TYPE DEFINITIONS */
type T_ENABLED = Object;

type T_OPTIONS = {
  polyline?: T_ENABLED,
  polygon?: T_ENABLED,
  rectangle?: T_ENABLED,
  circle?: T_ENABLED,
  marker?: T_ENABLED,
};

type T_MH = {
  enabled: T_ENABLED,
  handler: Object,
  title: string,
};
type T_ARR_MH = Array<T_MH>;
type T_ACT = {
  enabled?: T_ENABLED,
  title: string,
  text: string,
  callback: () => void,
  context: Object,
}
type T_ARR_ACT = Array<T_ACT>;

const INITIAL_OPTIONS: T_OPTIONS = {
  polyline: {},
  polygon: {},
  rectangle: {},
  circle: {},
  marker: {},
};


export default class DrawToolbar extends Toolbar {
  _toolbarClass: string;

  static options = INITIAL_OPTIONS;
  static TYPE = 'draw';

  initialize(options: T_OPTIONS): void {
    const updatedOptions = {};

    // Merge in options
    Object.keys(DrawToolbar.options).forEach((type) => {
      if (options[type])
        updatedOptions[type] = {...DrawToolbar.options[type], ...options[type]};
    });

    this._toolbarClass = 'leaflet-draw-draw';
    super.initialize(updatedOptions);
  }

  /** Get mode handlers information */
  getModeHandlers(map: L.Map): T_ARR_MH {
    return [
      {
        enabled: this.options.polyline,
        handler: new Polyline(map, this.options.polyline),
        title: drawLocal.draw.toolbar.buttons.polyline,
      },
      {
        enabled: this.options.polygon,
        handler: new Polygon(map, this.options.polygon),
        title: drawLocal.draw.toolbar.buttons.polygon,
      },
      {
        enabled: this.options.rectangle,
        handler: new Rectangle(map, this.options.rectangle),
        title: drawLocal.draw.toolbar.buttons.rectangle,
      },
      {
        enabled: this.options.circle,
        handler: new Circle(map, this.options.circle),
        title: drawLocal.draw.toolbar.buttons.circle,
      },
      {
        enabled: this.options.marker,
        handler: new Marker(map, this.options.marker),
        title: drawLocal.draw.toolbar.buttons.marker,
      },
    ];
  }

  /** Get action information */
  getActions(handler: Object): T_ARR_ACT {
    return [
      {
        enabled: handler.completeShape,
        title: drawLocal.draw.toolbar.finish.title,
        text: drawLocal.draw.toolbar.finish.text,
        callback: handler.completeShape,
        context: handler,
      },
      {
        enabled: handler.deleteLastVertex,
        title: drawLocal.draw.toolbar.undo.title,
        text: drawLocal.draw.toolbar.undo.text,
        callback: handler.deleteLastVertex,
        context: handler,
      },
      {
        title: drawLocal.draw.toolbar.actions.title,
        text: drawLocal.draw.toolbar.actions.text,
        callback: this.disable,
        context: this,
      },
    ];
  }

  /** Sets the options to the toolbar */
  setOptions(options: T_OPTIONS): void {
    L.setOptions(this, options);

    Object.keys(this._modes).forEach((type) => {
      if (options[type])
        this._modes[type].handler.setOptions(options[type]);
    });
  }
}
