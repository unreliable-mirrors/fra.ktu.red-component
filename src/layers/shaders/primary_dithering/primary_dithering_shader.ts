import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./primary_dithering_shader.frag?raw";

export type PrimaryDitheringShaderState = ShaderLayerState & {
  matrixSize: number;
  pixelSize: number;
};

export class PrimaryDitheringShader extends ShaderLayer {
  declare _state: PrimaryDitheringShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): PrimaryDitheringShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "primary_dithering",
      name: "primary_dithering_" + getCount(sceneStateId),
      matrixSize: 4,
      pixelSize: 1,
    };
  }

  constructor(
    sceneStateId: string,
    state: PrimaryDitheringShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uMatrixSize: { value: this.getFieldValue("matrixSize"), type: "f32" },
      uPixelSize: { value: this.getFieldValue("pixelSize"), type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uMatrixSize = this.getFieldValue("matrixSize");
    this.uniforms.uniforms.uPixelSize = this.getFieldValue("pixelSize");
  }
}
