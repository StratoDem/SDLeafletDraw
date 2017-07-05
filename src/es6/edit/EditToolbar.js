/** @flow
 * StratoDem Analytics : EditToolbar
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';

import drawLocal from '../draw';
import Toolbar from '../Toolbar';

import { TYPE_EDIT } from './handler/constants';
import { Delete, Edit, Circle, Marker, Rectangle, Poly, PolyVerticesEdit } from './handler/index';


type T_ACTION = {title: string, text: string, callback: () => void, context: Object};
type T_EDITTOOLBAR_OPTIONS = {
  edit: {
    selectedPathOptions: {
      dashArray?: string,
      fill?: boolean,
      fillColor?: string,
      fillOpacity?: number,
      maintainColor?: boolean,
    },
  },
  remove?: Object,
  poly?: Object | null,
  featureGroup: Object | null,
};
const DEFAULT_EDITTOOLBAR_OPTIONS: T_EDITTOOLBAR_OPTIONS = {
  edit: {
    selectedPathOptions: {
      dashArray: '10, 10',

      fill: true,
      fillColor: '#fe57a1',
      fillOpacity: 0.1,

      // Whether to user the existing layers color
      maintainColor: false,
    },
  },
  remove: {},
  poly: null,
  featureGroup: null,  /* REQUIRED!
  TODO: perhaps if not set then all layers on the map are selectable? */
};


class EditToolbar extends Toolbar {
  _selectedFeatureCount: number;
  _toolbarClass: string;

  static TYPE = TYPE_EDIT;
  static options = DEFAULT_EDITTOOLBAR_OPTIONS;

  initialize(options: T_EDITTOOLBAR_OPTIONS): void {
    this._toolbarClass = 'leaflet-draw-edit';

    super.initialize({
      edit: {
        selectedPathOptions: {
          ...EditToolbar.options.edit.selectedPathOptions,
          ...(
            typeof options.edit !== 'undefined' && options.edit.selectedPathOptions !== 'undefined'
              ? options.edit.selectedPathOptions
              : {}),
        },
      },
      remove: {...EditToolbar.options.remove, ...options.remove},
      poly: {...EditToolbar.options.poly, ...options.poly},
      featureGroup: options.featureGroup,
    });

    this._selectedFeatureCount = 0;
  }

  /** Get mode handlers information **/
  getModeHandlers(map: L.Map): [
    {enabled: any, handler: Edit, title: string},
    {enabled: any, handler: Delete, title: string}] {
    const featureGroup = this.options.featureGroup;
    return [
      {
        enabled: this.options.edit,
        handler: new Edit(map, {
          featureGroup,
          selectedPathOptions: this.options.edit.selectedPathOptions,
          poly: this.options.poly,
        }),
        title: drawLocal.edit.toolbar.buttons.edit,
      },
      {
        enabled: this.options.remove,
        handler: new Delete(map, {featureGroup}),
        title: drawLocal.edit.toolbar.buttons.remove,
      },
    ];
  }

  /** Get actions information **/
  getActions(): [T_ACTION, T_ACTION] {
    return [
      {
        title: drawLocal.edit.toolbar.actions.save.title,
        text: drawLocal.edit.toolbar.actions.save.text,
        callback: this._save,
        context: this,
      },
      {
        title: drawLocal.edit.toolbar.actions.cancel.title,
        text: drawLocal.edit.toolbar.actions.cancel.text,
        callback: this.disable,
        context: this,
      },
    ];
  }

  /** Adds the toolbar to the map **/
  addToolbar(map: L.Map): L.DomUtil {
    const container = super.addToolbar(map);
    this._checkDisabled();

    this.options.featureGroup.on('layeradd layerremove', this._checkDisabled, this);

    return container;
  }

  removeToolbar(): void {
    this.options.featureGroup.off('layeradd layerremove', this._checkDisabled, this);

    super.removeToolbar();
  }

  /** Disables the toolbar **/
  disable(): void {
    if (!this.enabled())
      return;

    this._activeMode.handler.revertLayers();
    super.disable();
  }

  _save(): void {
    this._activeMode.handler.save();
    if (this._activeMode)
      this._activeMode.handler.disable();
  }

  _clearAllLayers(): void {
    this._activeMode.handler.removeAllLayers();
    if (this._activeMode)
      this._activeMode.handler.disable();
  }

  _checkDisabled(): void {
    const featureGroup = this.options.featureGroup;
    const hasLayers = featureGroup.getLayers().length !== 0;
    let button;

    if (this.options.edit) {
      button = this._modes[Edit.TYPE].button;

      if (hasLayers)
        L.DomUtil.removeClass(button, 'leaflet-disabled');
      else
        L.DomUtil.addClass(button, 'leaflet-disabled');

      button.setAttribute(
        'title',
        hasLayers
          ? drawLocal.edit.toolbar.buttons.edit
          : drawLocal.edit.toolbar.buttons.editDisabled
      );
    }

    if (this.options.remove) {
      button = this._modes[Delete.TYPE].button;

      if (hasLayers)
        L.DomUtil.removeClass(button, 'leaflet-disabled');
      else
        L.DomUtil.addClass(button, 'leaflet-disabled');

      button.setAttribute(
        'title',
        hasLayers
          ? drawLocal.edit.toolbar.buttons.remove
          : drawLocal.edit.toolbar.buttons.removeDisabled
      );
    }
  }
}

export default EditToolbar;
