import type { Ticker } from "pixi.js";
import type { IModulator, ModulatorState } from "./imodulator.js";
import { DataStore } from "../index.js";

export abstract class BaseModulator implements IModulator {
  protected sceneStateId: string;
  protected _state: ModulatorState;
  value: number = 0;
  valueLog: number[] = [];
  hook?: (value: number) => void;

  static getDefaultState(sceneStateId: string): ModulatorState {
    return {
      id: Math.floor(Math.random() * 1000000),
      type: "lfo",
      name: "modulator",
      visible: true,
      running: true,
      factor: 1,
      offset: 0,
    };
  }

  constructor(sceneStateId: string, state: ModulatorState) {
    this.sceneStateId = sceneStateId;
    this._state = state;
  }

  get id(): number {
    return this._state.id;
  }

  get name(): string {
    return this._state.name;
  }

  getValue(): number {
    const value = this.computeValue();
    this.valueLog.push(value);
    return value;
  }

  abstract computeValue(): number;

  tick(time: Ticker): void {
    const elapsedTime =
      DataStore.getInstance().getStore(this.sceneStateId + ".elapsedTime") || 0;
    if (this._state.running) {
      const value =
        this.computeValue() * this._state.factor + this._state.offset;
      this.value = value;
      if (isNaN(this.value)) {
        this.value = 0;
      }
      this.valueLog.push(this.value);
      if (this.valueLog.length > 100) {
        this.valueLog.shift();
      }
      this.hook?.(this.value);
    }
  }
}
