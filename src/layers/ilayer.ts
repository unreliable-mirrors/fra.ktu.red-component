import { Ticker } from "pixi.js";

export type LayerFields = "visible";

export type LayerState = {
  id: number;
  type: string;
  name: string;
  visible: boolean;
};

export interface ILayer {
  set(field: LayerFields, value: any): void;

  get id(): number;

  get type(): string;

  set name(name: string);
  get name(): string;

  set visible(visible: boolean);
  get visible(): boolean;

  onStateChange(): void;

  bind(): void;
  unbind(): void;
  tick(time: Ticker, loop: boolean): void;
}
