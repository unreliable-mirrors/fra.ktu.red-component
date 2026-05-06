import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./vlines_shader.frag?raw";

export type VLinesShaderState = ShaderLayerState & {
  distance: number;
  thickness: number;
};

export class VLinesShader extends ShaderLayer {
  declare _state: VLinesShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): VLinesShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "vlines",
      name: "vlines_" + getCount(sceneStateId),
      distance: 10,
      thickness: 2,
    };
  }

  constructor(sceneStateId: string, state: VLinesShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uDistance: { value: this.getFieldValue("distance"), type: "f32" },
      uThickness: { value: this.getFieldValue("thickness"), type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uDistance = this.getFieldValue("distance");
    this.uniforms.uniforms.uThickness = this.getFieldValue("thickness");
  }
}
