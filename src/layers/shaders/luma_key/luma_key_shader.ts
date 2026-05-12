import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./luma_key_shader.frag?raw";

export type LumaKeyShaderState = ShaderLayerState & {
  threshold: number;
  not: boolean;
};

export class LumaKeyShader extends ShaderLayer {
  declare _state: LumaKeyShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): LumaKeyShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "luma_key",
      name: "luma_key_" + getCount(sceneStateId),
      threshold: 0.5,
      not: false,
    };
  }

  constructor(sceneStateId: string, state: LumaKeyShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uThreshold: { value: this.getFieldValue("threshold"), type: "f32" },
      uNot: { value: this.getFieldBoolean("not") ? 1 : 0, type: "i32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uThreshold = this.getFieldValue("threshold");
    this.uniforms.uniforms.uNot = this.getFieldBoolean("not") ? 1 : 0;
  }
}
