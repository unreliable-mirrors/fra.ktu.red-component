import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./scramble_shader.frag?raw";

export type ScrambleShaderState = ShaderLayerState & {
  range: number;
};

export class ScrambleShader extends ShaderLayer {
  declare _state: ScrambleShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): ScrambleShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "scramble",
      name: "scramble_" + getCount(sceneStateId),
      range: 10,
    };
  }

  constructor(sceneStateId: string, state: ScrambleShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uRange: { value: this.getFieldValue("range"), type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uRange = this.getFieldValue("range");
  }
}
