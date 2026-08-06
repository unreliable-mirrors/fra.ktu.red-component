import { Color, type UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./primary_dithering_shader.frag?raw";

export type PrimaryDitheringShaderState = ShaderLayerState & {
  color1: string;
  color2: string;
  color3: string;
  matrixSize: number;
  pixelSize: number;
  black: boolean;
  white: boolean;
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
      color1: "#ff0000",
      color2: "#00ff00",
      color3: "#0000ff",
      black: true,
      white: true,
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
    const color1 = new Color(this.getFieldValue("color1"));
    const color2 = new Color(this.getFieldValue("color2"));
    const color3 = new Color(this.getFieldValue("color3"));
    return {
      uMatrixSize: { value: this.getFieldValue("matrixSize"), type: "f32" },
      uPixelSize: { value: this.getFieldValue("pixelSize"), type: "f32" },
      uBlack: { value: this.getFieldBoolean("black") ? 1 : 0, type: "i32" },
      uWhite: { value: this.getFieldBoolean("white") ? 1 : 0, type: "i32" },
      uColor1: {
        value: [color1.red, color1.green, color1.blue, color1.alpha],
        type: "vec4<f32>",
      },
      uColor2: {
        value: [color2.red, color2.green, color2.blue, color2.alpha],
        type: "vec4<f32>",
      },
      uColor3: {
        value: [color3.red, color3.green, color3.blue, color3.alpha],
        type: "vec4<f32>",
      },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    const color1 = new Color(this.getFieldValue("color1"));
    const color2 = new Color(this.getFieldValue("color2"));
    const color3 = new Color(this.getFieldValue("color3"));
    this.uniforms.uniforms.uMatrixSize = this.getFieldValue("matrixSize");
    this.uniforms.uniforms.uPixelSize = this.getFieldValue("pixelSize");
    this.uniforms.uniforms.uBlack = this.getFieldBoolean("black") ? 1 : 0;
    this.uniforms.uniforms.uWhite = this.getFieldBoolean("white") ? 1 : 0;
    this.uniforms.uniforms.uColor1 = [
      color1.red,
      color1.green,
      color1.blue,
      color1.alpha,
    ];
    this.uniforms.uniforms.uColor2 = [
      color2.red,
      color2.green,
      color2.blue,
      color2.alpha,
    ];
    this.uniforms.uniforms.uColor3 = [
      color3.red,
      color3.green,
      color3.blue,
      color3.alpha,
    ];
  }
}
