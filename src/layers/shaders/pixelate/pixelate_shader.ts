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

  static getDefaultState(sceneStateId: string): PixelateShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "pixelate",
      name: "pixelate_" + getCount(sceneStateId),
      pixelSize: 10,
    };
  }

  constructor(sceneStateId: string, state: PixelateShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.log("Constructed pixelate shader layer with state", state);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uPixelSize: { value: this._state.pixelSize, type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uPixelSize = this._state.pixelSize;
  }
}
