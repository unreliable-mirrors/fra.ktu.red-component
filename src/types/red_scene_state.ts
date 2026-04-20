import type { LayerState } from "../layers/ilayer.js";

export type SceneState = {
  name: string;
  width: number;
  height: number;
  duration: number;
  layers: LayerState[];
  shaders: LayerState[];
  assets: Record<string, string>;
  counter: number;
};
