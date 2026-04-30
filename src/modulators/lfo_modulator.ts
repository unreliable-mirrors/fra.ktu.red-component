import { getCount } from "../helpers/ids.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { BaseModulator } from "./base_modulator.js";
import type { ModulatorState } from "./imodulator.js";

export type LfoModulatorState = ModulatorState & {
  hz: number;
  phase: number;
  waveform: "sine" | "square" | "triangle" | "sawtooth";
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
      waveform: "sine",
    };
  }
  computeValue(): number {
    if (!this._state.running) {
      return 0;
    }
    const time =
      DataStore.getInstance().getStore(
        "instances." + this.sceneStateId + ".elapsedTime",
      ) || 0;

    if (this._state.waveform === "triangle") {
      const beatDuration = 1000 / this._state.hz;
      const position =
        ((time % beatDuration) / beatDuration + this._state.phase) % 1;
      if (position < 0.5) {
        return position * 2;
      } else {
        return (1 - position) * 2;
      }
    } else if (this._state.waveform === "sawtooth") {
      return (
        ((time % (1000 / this._state.hz)) / (1000 / this._state.hz) +
          this._state.phase) %
        1
      );
    }

    let v =
      Math.sin(
        ((time % (1000 / this.getFieldValue("hz"))) /
          (1000 / this.getFieldValue("hz")) +
          this.getFieldValue("phase")) *
          Math.PI *
          2,
      ) /
        2 +
      0.5;
    if (this.getFieldValue("waveform").toString() === "square") {
      v = Math.round(v);
    } else if (this.getFieldValue("waveform").toString() === "triangle") {
      v = 1 - Math.abs(2 * v - 1);
    }
    return v;
  }
}
