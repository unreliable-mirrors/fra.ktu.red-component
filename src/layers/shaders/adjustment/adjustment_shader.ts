import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./adjustment_shader.frag?raw";

export type AdjustmentShaderState = ShaderLayerState & {
  gamma: number;
  contrast: number;
  saturation: number;
  brightness: number;
  red: number;
  green: number;
  blue: number;
  alpha: number;
};

export class AdjustmentShader extends ShaderLayer {
  declare _state: AdjustmentShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): AdjustmentShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "adjustment",
      name: "adjustment_" + getCount(sceneStateId),
      gamma: 1,
      contrast: 1,
      saturation: 1,
      brightness: 1,
      red: 1,
      green: 1,
      blue: 1,
      alpha: 1,
    };
  }

  constructor(
    sceneStateId: string,
    state: AdjustmentShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uGamma: { value: this.getFieldValue("gamma"), type: "f32" },
      uContrast: { value: this.getFieldValue("contrast"), type: "f32" },
      uSaturation: { value: this.getFieldValue("saturation"), type: "f32" },
      uBrightness: { value: this.getFieldValue("brightness"), type: "f32" },
      uColor: {
        value: [
          this.getFieldValue("red"),
          this.getFieldValue("green"),
          this.getFieldValue("blue"),
          this.getFieldValue("alpha"),
        ],
        type: "vec4<f32>",
      },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uGamma = this.getFieldValue("gamma");
    this.uniforms.uniforms.uContrast = this.getFieldValue("contrast");
    this.uniforms.uniforms.uSaturation = this.getFieldValue("saturation");
    this.uniforms.uniforms.uBrightness = this.getFieldValue("brightness");
    this.uniforms.uniforms.uColor = [
      this.getFieldValue("red"),
      this.getFieldValue("green"),
      this.getFieldValue("blue"),
      this.getFieldValue("alpha"),
    ];
  }
}
