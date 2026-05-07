import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./hnoise_shader.frag?raw";

export type HNoiseShaderState = ShaderLayerState & {
  noiseSize: number;
  lineThickness: number;
  strength: number;
  negative: boolean;
};

export class HNoiseShader extends ShaderLayer {
  declare _state: HNoiseShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): HNoiseShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "hnoise",
      name: "hnoise_" + getCount(sceneStateId),
      noiseSize: 1,
      lineThickness: 1,
      strength: 0.1,
      negative: false,
    };
  }

  constructor(sceneStateId: string, state: HNoiseShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uNoiseSize: { value: this.getFieldValue("noiseSize"), type: "f32" },
      uLineThickness: {
        value: this.getFieldValue("lineThickness"),
        type: "f32",
      },
      uStrength: { value: this.getFieldValue("strength"), type: "f32" },
      uNegative: { value: this.getFieldValue("negative") ? 1 : 0, type: "i32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uNoiseSize = this.getFieldValue("noiseSize");
    this.uniforms.uniforms.uLineThickness = this.getFieldValue("lineThickness");
    this.uniforms.uniforms.uStrength = this.getFieldValue("strength");
    this.uniforms.uniforms.uNegative = this.getFieldValue("negative") ? 1 : 0;
  }
}
