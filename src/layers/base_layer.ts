import { getCount } from "../helpers/ids.js";
import type { LayerType } from "../helpers/layers.js";
import type { ILayer, LayerFields, LayerState } from "./ilayer.js";

export abstract class BaseLayer implements ILayer {
  protected _state: LayerState;

  static getDefaultState(): LayerState {
    return {
      id: Math.floor(Math.random() * 1000000),
      type: "background",
      name: "Layer" + getCount(),
      visible: true,
    };
  }

  constructor(state: LayerState) {
    this._state = state;
  }

  set(field: LayerFields, value: any): void {
    if (field === "visible") {
      this._state.visible = value;
    }
    this.onStateChange();
  }

  get id(): number {
    return this._state.id;
  }

  get type(): LayerType {
    return this._state.type;
  }

  set name(name: string) {
    this._state.name = name;
    this.onStateChange();
  }

  get name(): string {
    return this._state.name;
  }

  set visible(visible: boolean) {
    this._state.visible = visible;
    this.onStateChange();
  }

  get visible(): boolean {
    return this._state.visible;
  }

  onStateChange(): void {}
  abstract bind(): void;
  abstract unbind(): void;
  tick(time: any, loop: boolean): void {}
}
