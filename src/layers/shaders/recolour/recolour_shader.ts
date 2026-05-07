import { Color, type UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./recolour_shader.frag?raw";
import { getFunColor } from "../../../helpers/sparkle.js";

export type RecolourShaderState = ShaderLayerState & {
  fromColor: string;
  toColor: string;
  threshold: number;
  not: boolean;
  onlyHue: boolean;
  onlySaturation: boolean;
  onlyLightness: boolean;
};

export class RecolourShader extends ShaderLayer {
  declare _state: RecolourShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): RecolourShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "recolour",
      name: "recolour_" + getCount(sceneStateId),
      fromColor: "#000000",
      toColor: getFunColor(),
      threshold: 0.1,
      not: false,
      onlyHue: false,
      onlySaturation: false,
      onlyLightness: false,
    };
  }

  constructor(sceneStateId: string, state: RecolourShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    const fromColor = new Color(this.getFieldValue("fromColor"));
    const toColor = new Color(this.getFieldValue("toColor"));
    return {
      uFromColor: {
        value: [
          fromColor.red,
          fromColor.green,
          fromColor.blue,
          fromColor.alpha,
        ],
        type: "vec4<f32>",
      },
      uToColor: {
        value: [toColor.red, toColor.green, toColor.blue, toColor.alpha],
        type: "vec4<f32>",
      },

      uThreshold: { value: this.getFieldValue("threshold"), type: "f32" },
      uNot: { value: this.getFieldBoolean("not") ? 1 : 0, type: "i32" },
      uOnlyHue: { value: this.getFieldBoolean("onlyHue") ? 1 : 0, type: "i32" },
      uOnlySaturation: {
        value: this.getFieldBoolean("onlySaturation") ? 1 : 0,
        type: "i32",
      },
      uOnlyLightness: {
        value: this.getFieldBoolean("onlyLightness") ? 1 : 0,
        type: "i32",
      },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    const fromColor = new Color(this.getFieldValue("fromColor"));
    const toColor = new Color(this.getFieldValue("toColor"));
    this.uniforms.uniforms.uFromColor = [
      fromColor.red,
      fromColor.green,
      fromColor.blue,
      fromColor.alpha,
    ];
    this.uniforms.uniforms.uToColor = [
      toColor.red,
      toColor.green,
      toColor.blue,
      toColor.alpha,
    ];
    this.uniforms.uniforms.uThreshold = this.getFieldValue("threshold");
    this.uniforms.uniforms.uNot = this.getFieldBoolean("not") ? 1 : 0;
    this.uniforms.uniforms.uOnlyHue = this.getFieldBoolean("onlyHue") ? 1 : 0;
    this.uniforms.uniforms.uOnlySaturation = this.getFieldBoolean(
      "onlySaturation",
    )
      ? 1
      : 0;
    this.uniforms.uniforms.uOnlyLightness = this.getFieldBoolean(
      "onlyLightness",
    )
      ? 1
      : 0;
  }
}
