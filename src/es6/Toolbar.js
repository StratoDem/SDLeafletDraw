/** @flow
 * StratoDem Analytics : Toolbar
 * Principal Author(s) : Michael Clawar
 * Secondary Author(s) :
 * Description :
 *
 *  (c) 2016- StratoDem Analytics, LLC
 *  All Rights Reserved
 */

import L from 'leaflet';


class BaseToolbar extends L.Class {
  _actionButtons: Array<Object>;
  _activeMode: Object | null;
  _modes: Object;

  initialize(options: Object): void {
    L.setOptions(this, options);

    this._modes = {};
    this._actionButtons = [];
    this._activeMode = null;
  }

  enabled(): boolean {
    return this._activeMode !== null;
  }

  /** Disables the toolbar **/
  disable(): void {
    if (!this.enabled())
      return;

    if (this._activeMode === null) return;
    this._activeMode.handler.disable();
  }

  /** Adds the toolbar to the map and returns the DOM element **/
  addToolbar(map: L.Map): L.DomUtil | null {
    const container = L.DomUtil.create('div', 'leaflet-draw-section');
    let buttonIndex = 0;
    const buttonClassPrefix = this._toolbarClass || '';

    this._toolbarContainer = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-bar');
    this._map = map;

    this.getModeHandlers(map).forEach((mh) => {
      if (mh.enabled)
        this._initModeHandler(
          mh.handler,
          this._toolbarContainer,
          buttonIndex += 1,
          buttonClassPrefix,
          mh.title);
    });

    // if no buttons were added, do not add the toolbar
    if (buttonIndex === 0)
      return null;

    // Save button index of the last button, -1 as we would have ++ after the last button
    this._lastButtonIndex = buttonIndex - 1;

    // Create empty actions part of the toolbar
    this._actionsContainer = L.DomUtil.create('ul', 'leaflet-draw-actions');

    // Add draw and cancel containers to the control container
    container.appendChild(this._toolbarContainer);
    container.appendChild(this._actionsContainer);

    return container;
  }

  /** Removes the toolbar and drops the handler event listeners **/
  removeToolbar(): void {
    // Dispose each handler
    Object.keys(this._modes).forEach((k: string) => {
      const mode = this._modes[k];
      BaseToolbar._disposeButton(mode.button, mode.handler.enable);

      // Make sure this is disabled
      mode.handler.disable();
      // Unbind handler
      mode.handler
        .off('enabled', this._handlerActivated, this)
        .off('disabled', this._handlerDeactivated, this);
    });
    this._modes = {};

    // Dispose the actions toolbar
    this._actionButtons
      .forEach(button => BaseToolbar._disposeButton(button.button, button.callback));
    this._actionButtons = [];
    this._actionsContainer = null;
  }

  _initModeHandler(handler: Object, container: L.DomUtil,
                   buttonIndex: number, classNamePrefix: string, buttonTitle: string): void {
    const type = handler.type;

    const modeHandler = {
      handler,
      button: BaseToolbar._createButton({
        type,
        title: buttonTitle,
        className: `${classNamePrefix}-${type}`,
        container,
        callback: handler.enable,
        context: handler,
      }),
      buttonIndex,
    };
    modeHandler.handler
      .on('enabled', this._handlerActivated, this)
      .on('disabled', this._handlerDeactivated, this);

    this._modes[type] = modeHandler;
  }

  static _createButton(options: Object): L.DomUtil {
    const link = L.DomUtil.create('a', options.className || '', options.container);
    // Screen reader tag
    const sr = L.DomUtil.create('span', 'sr-only', options.container);

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

    L.DomEvent
      .on(link, 'click', L.DomEvent.stopPropagation)
      .on(link, 'mousedown', L.DomEvent.stopPropagation)
      .on(link, 'dblclick', L.DomEvent.stopPropagation)
      .on(link, 'touchstart', L.DomEvent.stopPropagation)
      .on(link, 'click', L.DomEvent.preventDefault)
      .on(link, 'click', options.callback, options.context);

    return link;
  }

  static _disposeButton(button: L.DomUtil, callback: (any) => void) {
    L.DomEvent.off(button, 'click', L.DomEvent.stopPropagation);
    L.DomEvent.off(button, 'mousedown', L.DomEvent.stopPropagation);
    L.DomEvent.off(button, 'dblclick', L.DomEvent.stopPropagation);
    L.DomEvent.off(button, 'touchstart', L.DomEvent.stopPropagation);
    L.DomEvent.off(button, 'click', L.DomEvent.preventDefault);
    L.DomEvent.off(button, 'click', callback);
  }

  _handlerActivated(event: {handler: Object}): void {
    // Disable active mode (if present)
    this.disable();

    // Cache new active feature
    this._activeMode = this._modes[event.handler];

    L.DomUtil.addClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

    this._showActionsToolbar();

    this.fire('enable');
  }

  _handlerDeactivated(): void {
    this._hideActionsToolbar();

    // $FlowFixMe
    L.DomUtil.removeClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

    this._activeMode = null;

    this.fire('disable');
  }

  _createActions(handler: Object): void {
    const container = this._actionsContainer;
    const buttons = this.getActions(handler);

    // Dispose the actions toolbar (todo: dispose only not used buttons)
    this._actionButtons
      .forEach(button => BaseToolbar._disposeButton(button.button, button.callback));
    this._actionButtons = [];

    // Remove all old buttons
    while (container.firstChild)
      container.removeChild(container.firstChild);

    this._actionButtons = buttons
      .filter(button => !('enabled' in button && !button.enabled))
      .map(button => ({
        button: BaseToolbar._createButton({
          title: button.title,
          text: button.text,
          container: L.DomUtil.create('li', '', container),
          callback: button.callback,
          context: button.context,
        }),
        callback: button.callback,
      }));
  }

  _showActionsToolbar(): void {
    if (this._activeMode === null) return;
    const buttonIndex = this._activeMode.buttonIndex;
    const lastButtonIndex = this._lastButtonIndex;
    const toolbarPosition = this._activeMode.button.offsetTop - 1;

    // Recreate action buttons on every click
    this._createActions(this._activeMode.handler);

    // Correctly position the cancel button
    this._actionsContainer.style.top = `${toolbarPosition}px`;

    if (buttonIndex === 0) {
      L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
      L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-top');
    }

    if (buttonIndex === lastButtonIndex) {
      L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
      L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
    }

    this._actionsContainer.style.display = 'block';
  }

  _hideActionsToolbar(): void {
    this._actionsContainer.style.display = 'none';

    L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
    L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
    L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-top');
    L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
  }
}

const Toolbar = BaseToolbar.extend({includes: L.Evented.prototype});
export default Toolbar;
