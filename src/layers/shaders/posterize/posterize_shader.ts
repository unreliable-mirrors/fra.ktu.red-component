import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./posterize_shader.frag?raw";

export type PosterizeShaderState = ShaderLayerState & {
  levels: number;
};

export class PosterizeShader extends ShaderLayer {
  declare _state: PosterizeShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): PosterizeShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "posterize",
      name: "posterize_" + getCount(sceneStateId),
      levels: 3,
    };
  }

  constructor(
    sceneStateId: string,
    state: PosterizeShaderState,
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
