import type { DisplayLayerState } from "../layers/display/display_layer.js";
import type { ShaderLayerState } from "../layers/shaders/shader_layer.js";

export type SceneState = {
  name: string;
  width: number;
  height: number;
  duration: number;
  layers: DisplayLayerState[];
  shaders: ShaderLayerState[];
  assets: Record<string, string>;
  counter: number;
};
