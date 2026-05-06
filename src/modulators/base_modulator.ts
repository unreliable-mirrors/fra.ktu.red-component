import type { Ticker } from "pixi.js";
import type { IModulator, ModulatorState } from "./imodulator.js";
import { DataStore } from "../index.js";
import { getSignal } from "../helpers/signals.js";

export abstract class BaseModulator implements IModulator {
  protected sceneStateId: string;
  protected _state: ModulatorState;
  value: number = 0;
  valueLog: number[] = [];
  changed: boolean = false;
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
      signaledFields: {},
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

  abstract computeValue(): number;

  tick(time: Ticker): void {
    const elapsedTime =
      DataStore.getInstance().getStore(this.sceneStateId + ".elapsedTime") || 0;
    if (this._state.running) {
      const lastValue = this.value;
      const value =
        this.computeValue() * this.getFieldValue("factor") +
        this.getFieldValue("offset");
      this.value = value;
      this.changed = this.value !== lastValue;
      if (isNaN(this.value)) {
        this.value = 0;
      }
      this.valueLog.push(this.value);
      if (this.valueLog.length > 100) {
        this.valueLog.shift();
      }
      this.hook?.(this.value);
    } else {
      this.changed = false;
    }
  }

  getFieldValue(fieldName: string): number {
    const signaledField = this._state.signaledFields[fieldName];
    if (!signaledField) {
      return this._state[fieldName as keyof ModulatorState] as number;
    }

    return getSignal(this.sceneStateId, signaledField)?.getValue() || 0;
  }

  getFieldBoolean(fieldName: string): boolean {
    const signaledField = this._state.signaledFields[fieldName];
    if (!signaledField) {
      return this._state[fieldName as keyof ModulatorState] as boolean;
    }
    return !!getSignal(this.sceneStateId, signaledField)?.getValue();
  }
}
