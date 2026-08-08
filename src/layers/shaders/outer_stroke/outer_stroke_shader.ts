import { Color, type UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./outer_stroke_shader.frag?raw";

export type OuterStrokeShaderState = ShaderLayerState & {
  color: string;
  thickness: number;
  softness: number;
  alphaThreshold: number;
};

export class OuterStrokeShader extends ShaderLayer {
  declare _state: OuterStrokeShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): OuterStrokeShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "outer_stroke",
      name: "outer_stroke_" + getCount(sceneStateId),
      color: "#000000",
      thickness: 3,
      softness: 0,
      alphaThreshold: 0.5,
    };
  }

  constructor(
    sceneStateId: string,
    state: OuterStrokeShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    const strokeColor = new Color(this.getFieldValue("color"));
    return {
      uStrokeColor: {
        value: [
          strokeColor.red,
          strokeColor.green,
          strokeColor.blue,
          strokeColor.alpha,
        ],
        type: "vec4<f32>",
      },
      uThickness: { value: this.getFieldValue("thickness"), type: "f32" },
      uSoftness: { value: this.getFieldValue("softness"), type: "f32" },
      uAlphaThreshold: {
        value: this.getFieldValue("alphaThreshold"),
        type: "f32",
      },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    const strokeColor = new Color(this.getFieldValue("color"));
    this.uniforms.uniforms.uStrokeColor = [
      strokeColor.red,
      strokeColor.green,
      strokeColor.blue,
      strokeColor.alpha,
    ];
    this.uniforms.uniforms.uThickness = this.getFieldValue("thickness");
    this.uniforms.uniforms.uSoftness = this.getFieldValue("softness");
    this.uniforms.uniforms.uAlphaThreshold = this.getFieldValue("alphaThreshold");
  }
}
