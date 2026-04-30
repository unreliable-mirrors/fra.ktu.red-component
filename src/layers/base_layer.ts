import { getSignal } from "../helpers/signals.js";
import { EventDispatcher } from "../index.js";
import type { ILayer, LayerFields, LayerState } from "./ilayer.js";

export abstract class BaseLayer implements ILayer {
  protected sceneStateId: string;
  protected _state: LayerState;
  protected owner: string;

  handleStateChangeWrapper: Function = this.onStateChange.bind(this);

  static getDefaultState(sceneStateId: string): LayerState {
    return {
      id: Math.floor(Math.random() * 1000000),
      type: "background",
      name: "Layer",
      visible: true,
      signaledFields: {},
    };
  }

  constructor(sceneStateId: string, state: LayerState, owner: string) {
    this.sceneStateId = sceneStateId;
    this._state = state;
    this.owner = owner;

    EventDispatcher.getInstance().addEventListener(
      owner + ".!" + this._state.id,
      "update",
      this.handleStateChangeWrapper,
    );
    EventDispatcher.getInstance().addEventListener(
      owner + ".!" + this._state.id,
      "change",
      this.handleStateChangeWrapper,
    );

    EventDispatcher.getInstance().addEventListener(
      owner + ".shaders.!" + this._state.id,
      "update",
      this.handleStateChangeWrapper,
    );
    EventDispatcher.getInstance().addEventListener(
      owner + ".shaders.!" + this._state.id,
      "change",
      this.handleStateChangeWrapper,
    );
  }

  get id(): number {
    return this._state.id;
  }

  getFieldValue(fieldName: string): any {
    const signaledField = this._state.signaledFields[fieldName];
    if (!signaledField) {
      return this._state[fieldName as keyof LayerState] as any;
    }

    return getSignal(this.sceneStateId, signaledField)?.getValue() || 0;
  }

  onStateChange(): void {}
  abstract onSignalChange(): void;

  abstract bind(): void;
  unbind(): void {
    EventDispatcher.getInstance().removeEventListener(
      this.owner + ".!" + this._state.id,
      "update",
      this.handleStateChangeWrapper,
    );
    EventDispatcher.getInstance().removeEventListener(
      this.owner + ".!" + this._state.id,
      "change",
      this.handleStateChangeWrapper,
    );
    EventDispatcher.getInstance().removeEventListener(
      this.owner + ".shaders.!" + this._state.id,
      "update",
      this.handleStateChangeWrapper,
    );
    EventDispatcher.getInstance().removeEventListener(
      this.owner + ".shaders.!" + this._state.id,
      "change",
      this.handleStateChangeWrapper,
    );
  }
  tick(time: any, loop: boolean): void {
    let changed = false;
    for (const signal of Object.values(this._state.signaledFields)) {
      changed = changed || getSignal(this.sceneStateId, signal)!.changed;
      console.log(
        "Signal",
        signal,
        "changed:",
        getSignal(this.sceneStateId, signal),
        getSignal(this.sceneStateId, signal)?.getValue(),
      );
    }
    if (changed) {
      this.onSignalChange();
    }
  }
}
