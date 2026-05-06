import type { Ticker } from "pixi.js";
import type { LayerState } from "../layers/ilayer.js";

export type ModulatorState = LayerState & {
  running: boolean;
  factor: number;
  offset: number;
  signaledFields: { [key: string]: string };
};

export interface IModulator {
  get name(): string;
  get id(): number;
  computeValue(): number;
  value: number;
  changed: boolean;
  valueLog: number[];
  hook?: (value: number) => void;
  tick(time: Ticker): void;

  unbind(): void;
}
