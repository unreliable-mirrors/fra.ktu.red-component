import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./anaglyph_shader.frag?raw";

export type AnaglyphShaderState = ShaderLayerState & {
  pixelSize: number;
};

export class AnaglyphShader extends ShaderLayer {
  declare _state: AnaglyphShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): AnaglyphShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "anaglyph",
      name: "anaglyph_" + getCount(sceneStateId),
      pixelSize: 10,
    };
  }

  constructor(sceneStateId: string, state: AnaglyphShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uPixelSize: { value: this.getFieldValue("pixelSize"), type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uPixelSize = this.getFieldValue("pixelSize");
  }
}
