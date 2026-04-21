import { getCount } from "../helpers/ids.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { BaseModulator } from "./base_modulator.js";
import type { ModulatorState } from "./imodulator.js";

export type LfoModulatorState = ModulatorState & {
  hz: number;
  phase: number;
};

export class LfoModulator extends BaseModulator {
  declare _state: LfoModulatorState;

  static getDefaultState(sceneStateId: string): LfoModulatorState {
    return {
      ...BaseModulator.getDefaultState(sceneStateId),
      type: "lfo",
      name: "lfo_" + getCount(sceneStateId),
      hz: 1,
      phase: 0,
    };
  }
  computeValue(): number {
    if (!this._state.running) {
      return 0;
    }
    const time = DataStore.getInstance().getStore("elapsedTime") || 0;
    return (
      Math.sin(
        ((time % (1000 / this._state.hz)) / (1000 / this._state.hz) +
          this._state.phase) *
          Math.PI *
          2,
      ) /
        2 +
      0.5
    );
  }
}
