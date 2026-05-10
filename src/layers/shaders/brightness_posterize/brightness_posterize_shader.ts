import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./brightness_posterize_shader.frag?raw";

export type BrightnessPosterizeShaderState = ShaderLayerState & {
  levels: number;
};

export class BrightnessPosterizeShader extends ShaderLayer {
  declare _state: BrightnessPosterizeShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): BrightnessPosterizeShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "brightness_posterize",
      name: "brightness_posterize_" + getCount(sceneStateId),
      levels: 6,
    };
  }

  constructor(
    sceneStateId: string,
    state: BrightnessPosterizeShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uLevels: { value: this.getFieldValue("levels"), type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uLevels = this.getFieldValue("levels");
  }
}
