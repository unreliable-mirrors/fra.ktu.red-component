import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./crosses_shader.frag?raw";

export type CrossesShaderState = ShaderLayerState & {
  gridSize: number;
  crossSize: number;
  lineThickness: number;
  variableCrossSize: boolean;
};

export class CrossesShader extends ShaderLayer {
  declare _state: CrossesShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): CrossesShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "crosses",
      name: "crosses_" + getCount(sceneStateId),
      gridSize: 15,
      crossSize: 9,
      lineThickness: 1,
      variableCrossSize: false,
    };
  }

  constructor(sceneStateId: string, state: CrossesShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uGridSize: { value: this.getFieldValue("gridSize"), type: "f32" },
      uCrossSize: { value: this.getFieldValue("crossSize") / 2, type: "f32" },
      uLineThickness: {
        value: this.getFieldValue("lineThickness"),
        type: "f32",
      },
      uVariableCrossSize: {
        value: this.getFieldBoolean("variableCrossSize") ? 1 : 0,
        type: "f32",
      },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uGridSize = this.getFieldValue("gridSize");
    this.uniforms.uniforms.uCrossSize = this.getFieldValue("crossSize") / 2;
    this.uniforms.uniforms.uLineThickness = this.getFieldValue("lineThickness");
    this.uniforms.uniforms.uVariableCrossSize = this.getFieldBoolean(
      "variableCrossSize",
    )
      ? 1
      : 0;
  }
}
