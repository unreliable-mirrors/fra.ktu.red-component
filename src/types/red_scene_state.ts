import type { DisplayLayerState } from "../layers/display/display_layer.js";
import type { ShaderLayerState } from "../layers/shaders/shader_layer.js";
import type { ModulatorState } from "../modulators/imodulator.js";

export type SceneState = {
  name: string;
  width: number;
  height: number;
  duration: number;
  layers: DisplayLayerState[];
  shaders: ShaderLayerState[];
  modulators: ModulatorState[];
  assets: Record<string, string>;
  counter: number;
};
