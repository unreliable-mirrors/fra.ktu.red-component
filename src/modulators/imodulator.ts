import type { Ticker } from "pixi.js";
import type { LayerState } from "../layers/ilayer.js";

export type ModulatorState = LayerState & {
  running: boolean;
  factor: number;
  offset: number;
};

export interface IModulator {
  get name(): string;
  get id(): number;
  getValue(): number;
  computeValue(): number;
  value: number;
  valueLog: number[];
  hook?: (value: number) => void;
  tick(time: Ticker): void;
}
