import { Color, type UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./palette_recolour_shader.frag?raw";
import { getFunColor } from "../../../helpers/sparkle.js";

export type PaletteRecolourShaderState = ShaderLayerState & {
  color1: string;
  color2: string;
  color3: string;
  color4: string;
  color5: string;
  onlyHue: boolean;
  onlySaturation: boolean;
  onlyLightness: boolean;
};

export class PaletteRecolourShader extends ShaderLayer {
  declare _state: PaletteRecolourShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): PaletteRecolourShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "palette_recolour",
      name: "palette_recolour_" + getCount(sceneStateId),
      color1: getFunColor(),
      color2: getFunColor(),
      color3: getFunColor(),
      color4: getFunColor(),
      color5: getFunColor(),
      onlyHue: true,
      onlySaturation: false,
      onlyLightness: false,
    };
  }

  constructor(
    sceneStateId: string,
    state: PaletteRecolourShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    const color1 = new Color(this.getFieldValue("color1"));
    const color2 = new Color(this.getFieldValue("color2"));
    const color3 = new Color(this.getFieldValue("color3"));
    const color4 = new Color(this.getFieldValue("color4"));
    const color5 = new Color(this.getFieldValue("color5"));

    return {
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
      uColor4: {
        value: [color4.red, color4.green, color4.blue, color4.alpha],
        type: "vec4<f32>",
      },
      uColor5: {
        value: [color5.red, color5.green, color5.blue, color5.alpha],
        type: "vec4<f32>",
      },
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
    const color1 = new Color(this.getFieldValue("color1"));
    const color2 = new Color(this.getFieldValue("color2"));
    const color3 = new Color(this.getFieldValue("color3"));
    const color4 = new Color(this.getFieldValue("color4"));
    const color5 = new Color(this.getFieldValue("color5"));

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
    this.uniforms.uniforms.uColor4 = [
      color4.red,
      color4.green,
      color4.blue,
      color4.alpha,
    ];
    this.uniforms.uniforms.uColor5 = [
      color5.red,
      color5.green,
      color5.blue,
      color5.alpha,
    ];
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
