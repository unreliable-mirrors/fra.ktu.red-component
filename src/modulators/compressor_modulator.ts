import { getCount } from "../helpers/ids.js";
import { getSignal } from "../helpers/signals.js";
import { BaseModulator } from "./base_modulator.js";
import type { ModulatorState } from "./imodulator.js";

export type CompressorModulatorState = ModulatorState & {
  signal: number;
  cutoff: number;
  highCompress: boolean;
  highValue: number;
  lowCompress: boolean;
  lowValue: number;
  dryWet: number;
};

export class CompressorModulator extends BaseModulator {
  declare _state: CompressorModulatorState;

  static getDefaultState(sceneStateId: string): CompressorModulatorState {
    return {
      ...BaseModulator.getDefaultState(sceneStateId),
      type: "compressor",
      name: "compressor_" + getCount(sceneStateId),
      signal: 1,
      cutoff: 0.5,
      highCompress: true,
      highValue: 1,
      lowCompress: true,
      lowValue: 0,
      dryWet: 1,
    };
  }
  computeValue(): number {
    let value = this.getFieldValue("signal");
    const oldValue = value;
    if (
      value > this.getFieldValue("cutoff") &&
      this.getFieldBoolean("highCompress")
    ) {
      value = this.getFieldValue("highValue");
    } else if (
      value < this.getFieldValue("cutoff") &&
      this.getFieldBoolean("lowCompress")
    ) {
      value = this.getFieldValue("lowValue");
    }
    return (
      this.getFieldValue("dryWet") * value +
      (1 - this.getFieldValue("dryWet")) * oldValue
    );
  }
}
