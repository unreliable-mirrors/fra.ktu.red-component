import { Ticker } from "pixi.js";
import type { LayerType, ShaderType } from "../helpers/layers.js";

export type LayerFields = "visible";

export type LayerState = {
  id: number;
  type: LayerType | ShaderType;
  name: string;
  visible: boolean;
};

export interface ILayer {
  get id(): number;

  onStateChange(): void;

  bind(): void;
  unbind(): void;
  tick(time: Ticker, loop: boolean): void;
}
