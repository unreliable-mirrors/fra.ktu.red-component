import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./hue_posterize_shader.frag?raw";

export type HuePosterizeShaderState = ShaderLayerState & {
  levels: number;
  offset: number;
};

export class HuePosterizeShader extends ShaderLayer {
  declare _state: HuePosterizeShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): HuePosterizeShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "hue_posterize",
      name: "hue_posterize_" + getCount(sceneStateId),
      levels: 6,
      offset: 0,
    };
  }

  constructor(
    sceneStateId: string,
    state: HuePosterizeShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uLevels: { value: this.getFieldValue("levels"), type: "f32" },
      uOffset: { value: this.getFieldValue("offset"), type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uLevels = this.getFieldValue("levels");
    this.uniforms.uniforms.uOffset = this.getFieldValue("offset");
  }
}
