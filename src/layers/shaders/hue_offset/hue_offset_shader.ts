import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./hue_offset_shader.frag?raw";

export type HueOffsetShaderState = ShaderLayerState & {
  offset: number;
};

export class HueOffsetShader extends ShaderLayer {
  declare _state: HueOffsetShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): HueOffsetShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "hue_offset",
      name: "hue_offset_" + getCount(sceneStateId),
      offset: Math.floor(Math.random() * 360),
    };
  }

  constructor(
    sceneStateId: string,
    state: HueOffsetShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uOffset: { value: this.getFieldValue("offset"), type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uOffset = this.getFieldValue("offset");
  }
}
