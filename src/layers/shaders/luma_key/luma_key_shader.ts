import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./luma_key_shader.frag?raw";

export type LumaKeyShaderState = ShaderLayerState & {
  lowThreshold: number;
  topThreshold: number;
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
      lowThreshold: 0.35,
      topThreshold: 0.65,
      not: false,
    };
  }

  constructor(sceneStateId: string, state: LumaKeyShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    const lowThreshold = this.getFieldValue("lowThreshold");
    const topThreshold = this.getFieldValue("topThreshold");

    return {
      uLowThreshold: { value: lowThreshold, type: "f32" },
      uTopThreshold: { value: topThreshold, type: "f32" },
      uNot: { value: this.getFieldBoolean("not") ? 1 : 0, type: "i32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    const legacyThreshold = this.getFieldValue("threshold") ?? 0.5;
    this.uniforms.uniforms.uLowThreshold =
      this.getFieldValue("lowThreshold") ?? legacyThreshold;
    this.uniforms.uniforms.uTopThreshold =
      this.getFieldValue("topThreshold") ?? legacyThreshold;
    this.uniforms.uniforms.uNot = this.getFieldBoolean("not") ? 1 : 0;
  }
}
