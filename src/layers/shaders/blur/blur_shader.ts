import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./blur_shader.frag?raw";

export type BlurShaderState = ShaderLayerState & {
  radius: number;
  ignoreAlpha: boolean;
};

export class BlurShader extends ShaderLayer {
  declare _state: BlurShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): BlurShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "blur",
      name: "blur_" + getCount(sceneStateId),
      radius: 5,
      ignoreAlpha: false,
    };
  }

  constructor(sceneStateId: string, state: BlurShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uRadius: { value: this.getFieldValue("radius"), type: "f32" },
      uIgnoreAlpha: {
        value: this.getFieldBoolean("ignoreAlpha") ? 1 : 0,
        type: "i32",
      },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uRadius = this.getFieldValue("radius");
    this.uniforms.uniforms.uIgnoreAlpha = this.getFieldBoolean("ignoreAlpha")
      ? 1
      : 0;
  }
}
