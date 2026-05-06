import { getCount } from "../helpers/ids.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { BaseModulator } from "./base_modulator.js";
import type { ModulatorState } from "./imodulator.js";

export type RingModulatorState = ModulatorState & {
  valueA: number;
  valueB: number;
  aFactor: number;
  bFactor: number;
  operation: "add" | "subtract" | "multiply" | "divide";
};

export class RingModulator extends BaseModulator {
  declare _state: RingModulatorState;

  static getDefaultState(sceneStateId: string): RingModulatorState {
    return {
      ...BaseModulator.getDefaultState(sceneStateId),
      type: "ring",
      name: "ring_" + getCount(sceneStateId),
      valueA: 0,
      valueB: 0,
      aFactor: 1,
      bFactor: 1,
      operation: "add",
    };
  }
  computeValue(): number {
    if (this._state.operation === "add") {
      return (
        this.getFieldValue("valueA") * this.getFieldValue("aFactor") +
        this.getFieldValue("valueB") * this.getFieldValue("bFactor")
      );
    } else if (this._state.operation === "subtract") {
      return (
        this.getFieldValue("valueA") * this.getFieldValue("aFactor") -
        this.getFieldValue("valueB") * this.getFieldValue("bFactor")
      );
    } else if (this._state.operation === "multiply") {
      return (
        this.getFieldValue("valueA") *
        this.getFieldValue("aFactor") *
        (this.getFieldValue("valueB") * this.getFieldValue("bFactor"))
      );
    } else {
      const b = this.getFieldValue("valueB") * this.getFieldValue("bFactor");
      return b !== 0
        ? (this.getFieldValue("valueA") * this.getFieldValue("aFactor")) / b
        : 0;
    }
  }
}
