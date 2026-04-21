import type { LayerType } from "../helpers/layers.js";
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

  onStateChange(): void {}
  abstract bind(): void;
  abstract unbind(): void;
  tick(time: any, loop: boolean): void {}
}
