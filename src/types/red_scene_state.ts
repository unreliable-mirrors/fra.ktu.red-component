import type { LayerState } from "../layers/ilayer.js";

export type SceneState = {
  width: number;
  height: number;
  layers: LayerState[];
};
