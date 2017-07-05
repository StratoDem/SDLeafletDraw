/** @flow
 * StratoDem Analytics : Control.Draw
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import DrawToolbar from './draw/DrawToolbar';
import EditToolbar from './edit/EditToolbar';
import Toolbar from './Toolbar';


type T_CD_OPTIONS = {
  position: 'topleft' | 'topright' | 'bottomleft' | 'bottomright',
  draw: Object,
  edit: boolean,
};

const DEFAULT_CD_OPTIONS: T_CD_OPTIONS = {
  position: 'topleft',
  draw: {},
  edit: false,
};

const ControlDraw = L.Control.extend({
  options: DEFAULT_CD_OPTIONS,

  initialize(options: T_CD_OPTIONS): void {
    if (L.version < '0.7') {
      throw new Error('Leaflet.draw 0.2.3+ requires Leaflet 0.7.0+. '
        + 'Download latest from https://github.com/Leaflet/Leaflet/');
    }

    L.Control.prototype.initialize.call(this, options);

    let toolbar;
    this._toolbars = {};

    // Initialize toolbars
    if (DrawToolbar && this.options.draw) {
      toolbar = new DrawToolbar(this.options.draw);

      this._toolbars[DrawToolbar.TYPE] = toolbar;

      // Listen for when toolbar is enabled
      this._toolbars[DrawToolbar.TYPE].on('enable', this._toolbarEnabled, this);
    }

    if (EditToolbar && this.options.edit) {
      toolbar = new EditToolbar(this.options.edit);

      this._toolbars[EditToolbar.TYPE] = toolbar;

      // Listen for when toolbar is enabled
      this._toolbars[EditToolbar.TYPE].on('enable', this._toolbarEnabled, this);
    }
    L.toolbar = this;   // set global var for editing the toolbar
  },

  /** Adds the toolbar container to the map **/
  onAdd(map: L.Map): Toolbar {
    const container = L.DomUtil.create('div', 'leaflet-draw');
    let addedTopClass = false;
    const topClassName = 'leaflet-draw-toolbar-top';

    Object.keys(this._toolbars).forEach((k: string) => {
      const toolbarContainer = this._toolbars[k].addToolbar(map);

      if (toolbarContainer) {
        // Add class to the first toolbar to remove the margin
        if (!addedTopClass) {
          if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
            L.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
          }
          addedTopClass = true;
        }

        container.appendChild(toolbarContainer);
      }
    });

    return container;
  },

  /** Removes the toolbars from the map toolbar container **/
  onRemove(): void {
    Object.keys(this._toolbars).forEach((k: string) => {
      this._toolbars[k].removeToolbar();
    });
  },

  /** Sets options to all toolbar instances **/
  setDrawingOptions(options: T_CD_OPTIONS): void {
    Object.keys(this._toolbars).forEach((k: string) => {
      if (this._toolbars[k] instanceof DrawToolbar)
        this._toolbars[k].setOptions(options);
    });
  },

  _toolbarEnabled(event: {target: Toolbar}): void {
    const enabledToolbar = event.target;

    Object.keys(this._toolbars).forEach((k: string) => {
      if (this._toolbars[k] !== enabledToolbar)
        this._toolbars[k].disable();
    });
  },
});

L.Map.mergeOptions({
  drawControlTooltips: true,
  drawControl: false,
});

L.Map.addInitHook(function addHook() {
  if (this.options.drawControl) {
    this.drawControl = new ControlDraw();
    this.addControl(this.drawControl);
  }
});

export default ControlDraw;
