import { Ticker } from "pixi.js";
import type { LayerType } from "../helpers/layers.js";

export type LayerFields = "visible";

export type LayerState = {
  id: number;
  type: LayerType;
  name: string;
  visible: boolean;
};

export interface ILayer {
  set(field: LayerFields, value: any): void;

  get id(): number;

  get type(): LayerType;

  set name(name: string);
  get name(): string;

  set visible(visible: boolean);
  get visible(): boolean;

  onStateChange(): void;

  bind(): void;
  unbind(): void;
  tick(time: Ticker, loop: boolean): void;
}
