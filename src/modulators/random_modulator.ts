import Rand from "rand-seed";
import { getCount } from "../helpers/ids.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { BaseModulator } from "./base_modulator.js";
import type { ModulatorState } from "./imodulator.js";

export type RandomModulatorState = ModulatorState & {
  hz: number;
  salt: number;
};

export class RandomModulator extends BaseModulator {
  declare _state: RandomModulatorState;

  static getDefaultState(sceneStateId: string): RandomModulatorState {
    return {
      ...BaseModulator.getDefaultState(sceneStateId),
      type: "random",
      name: "random_" + getCount(sceneStateId),
      hz: 1,
      salt: Math.floor(Math.random() * 9999999999),
    };
  }
  computeValue(): number {
    const elapsedTime =
      DataStore.getInstance().getStore(
        "instances." + this.sceneStateId + ".elapsedTime",
      ) || 0;

    const seed = Math.floor((elapsedTime / 1000) * this._state.hz);
    const rand = new Rand(seed.toString() + this._state.salt);
    return rand.next();
  }
}
