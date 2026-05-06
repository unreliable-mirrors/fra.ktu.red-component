import { Color, type UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./chroma_shader.frag?raw";

export type ChromaShaderState = ShaderLayerState & {
  color: string;
  threshold: number;
  not: boolean;
};

export class ChromaShader extends ShaderLayer {
  declare _state: ChromaShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): ChromaShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "chroma",
      name: "chroma_" + getCount(sceneStateId),
      color: "#000000",
      threshold: 0.1,
      not: false,
    };
  }

  constructor(sceneStateId: string, state: ChromaShaderState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    const color = new Color(this.getFieldValue("color"));
    return {
      uColor: {
        value: [color.red, color.green, color.blue, color.alpha],
        type: "vec4<f32>",
      },
      uThreshold: { value: this.getFieldValue("threshold"), type: "f32" },
      uNot: { value: this.getFieldBoolean("not") ? 1 : 0, type: "i32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    const color = new Color(this.getFieldValue("color"));
    this.uniforms.uniforms.uColor = [
      color.red,
      color.green,
      color.blue,
      color.alpha,
    ];
    this.uniforms.uniforms.uThreshold = this.getFieldValue("threshold");
    this.uniforms.uniforms.uNot = this.getFieldBoolean("not") ? 1 : 0;
  }
}
