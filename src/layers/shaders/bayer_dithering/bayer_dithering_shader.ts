import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./bayer_dithering_shader.frag?raw";

export type BayerDitheringShaderState = ShaderLayerState & {
  matrixSize: number;
  levels: number;
  pixelSize: number;
  not: boolean;
  rgb: boolean;
};

export class BayerDitheringShader extends ShaderLayer {
  declare _state: BayerDitheringShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): BayerDitheringShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "bayer_dithering",
      name: "bayer_dithering_" + getCount(sceneStateId),
      matrixSize: 4,
      levels: 4,
      pixelSize: 1,
      not: false,
      rgb: false,
    };
  }

  constructor(
    sceneStateId: string,
    state: BayerDitheringShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uMatrixSize: { value: this.getFieldValue("matrixSize"), type: "f32" },
      uLevels: { value: this.getFieldValue("levels"), type: "f32" },
      uPixelSize: { value: this.getFieldValue("pixelSize"), type: "f32" },
      uNot: { value: this.getFieldBoolean("not") ? 1 : 0, type: "i32" },
      uRgb: { value: this.getFieldBoolean("rgb") ? 1 : 0, type: "i32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uMatrixSize = this.getFieldValue("matrixSize");
    this.uniforms.uniforms.uLevels = this.getFieldValue("levels");
    this.uniforms.uniforms.uPixelSize = this.getFieldValue("pixelSize");
    this.uniforms.uniforms.uNot = this.getFieldBoolean("not") ? 1 : 0;
    this.uniforms.uniforms.uRgb = this.getFieldBoolean("rgb") ? 1 : 0;
  }
}
