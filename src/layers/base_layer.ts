import { getSignal } from "../helpers/signals.js";
import { EventDispatcher } from "../index.js";
import type { ILayer, LayerFields, LayerState } from "./ilayer.js";

export abstract class BaseLayer implements ILayer {
  protected sceneStateId: string;
  protected _state: LayerState;

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

    EventDispatcher.getInstance().addEventListener(
      owner + ".!" + this._state.id,
      "update",
      this.onStateChange.bind(this),
    );
    EventDispatcher.getInstance().addEventListener(
      owner + ".!" + this._state.id,
      "change",
      this.onStateChange.bind(this),
    );

    EventDispatcher.getInstance().addEventListener(
      owner + ".shaders.!" + this._state.id,
      "update",
      this.onStateChange.bind(this),
    );
    EventDispatcher.getInstance().addEventListener(
      owner + ".shaders.!" + this._state.id,
      "change",
      this.onStateChange.bind(this),
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
  abstract unbind(): void;
  tick(time: any, loop: boolean): void {
    let changed = false;
    for (const signal of Object.values(this._state.signaledFields)) {
      console.log(
        "Checking signal",
        signal,
        getSignal(this.sceneStateId, signal)!.changed,
      );
      changed = changed || getSignal(this.sceneStateId, signal)!.changed;
    }
    if (changed) {
      this.onSignalChange();
    }
  }
}
