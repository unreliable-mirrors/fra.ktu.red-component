import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./hsb_blur_shader.frag?raw";

export type HSBBlurShaderState = ShaderLayerState & {
  hueRadius: number;
  saturationRadius: number;
  lightnessRadius: number;
  ignoreAlpha: boolean;
};

export class HSBBlurShader extends ShaderLayer {
  declare _state: HSBBlurShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): HSBBlurShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "hsb_blur",
      name: "hsb_blur_" + getCount(sceneStateId),
      hueRadius: 5,
      saturationRadius: 5,
      lightnessRadius: 5,
      ignoreAlpha: false,
    };
  }

  constructor(sceneStateId: string, state: HSBBlurShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uHueRadius: { value: this.getFieldValue("hueRadius"), type: "f32" },
      uSaturationRadius: {
        value: this.getFieldValue("saturationRadius"),
        type: "f32",
      },
      uLightnessRadius: {
        value: this.getFieldValue("lightnessRadius"),
        type: "f32",
      },
      uIgnoreAlpha: {
        value: this.getFieldBoolean("ignoreAlpha") ? 1 : 0,
        type: "i32",
      },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uHueRadius = this.getFieldValue("hueRadius");
    this.uniforms.uniforms.uSaturationRadius =
      this.getFieldValue("saturationRadius");
    this.uniforms.uniforms.uLightnessRadius =
      this.getFieldValue("lightnessRadius");
    this.uniforms.uniforms.uIgnoreAlpha = this.getFieldBoolean("ignoreAlpha")
      ? 1
      : 0;
  }
}
