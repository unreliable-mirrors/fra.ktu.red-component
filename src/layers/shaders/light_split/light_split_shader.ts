import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./light_split_shader.frag?raw";

export type LightSplitShaderState = ShaderLayerState & {
  threshold: number;
  power: number;
  darken: boolean;
  lighten: boolean;
  inverse: boolean;
};

export class LightSplitShader extends ShaderLayer {
  declare _state: LightSplitShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): LightSplitShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "light_split",
      name: "light_split_" + getCount(sceneStateId),
      threshold: 0.5,
      power: 2,
      darken: false,
      lighten: false,
      inverse: false,
    };
  }

  constructor(
    sceneStateId: string,
    state: LightSplitShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uThreshold: { value: this.getFieldValue("threshold"), type: "f32" },
      uPower: { value: this.getFieldValue("power"), type: "f32" },
      uDarken: { value: this.getFieldValue("darken") ? 1 : 0, type: "i32" },
      uLighten: { value: this.getFieldValue("lighten") ? 1 : 0, type: "i32" },
      uInverse: { value: this.getFieldValue("inverse") ? 1 : 0, type: "i32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uThreshold = this.getFieldValue("threshold");
    this.uniforms.uniforms.uPower = this.getFieldValue("power");
    this.uniforms.uniforms.uDarken = this.getFieldValue("darken") ? 1 : 0;
    this.uniforms.uniforms.uLighten = this.getFieldValue("lighten") ? 1 : 0;
    this.uniforms.uniforms.uInverse = this.getFieldValue("inverse") ? 1 : 0;
  }
}
