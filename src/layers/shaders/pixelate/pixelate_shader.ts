import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./pixelate_shader.frag?raw";

export type PixelateShaderState = ShaderLayerState & {
  pixelSize: number;
};

export class PixelateShader extends ShaderLayer {
  declare _state: PixelateShaderState;
  fragment: string = fragment;

  static getDefaultState(): PixelateShaderState {
    return {
      ...ShaderLayer.getDefaultState(),
      type: "pixelate",
      name: "pixelate_" + getCount(),
      pixelSize: 10,
    };
  }

  constructor(sceneStateId: string, state: PixelateShaderState) {
    super(sceneStateId, state);
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uPixelSize: { value: this._state.pixelSize, type: "f32" },
    };
  }
}
