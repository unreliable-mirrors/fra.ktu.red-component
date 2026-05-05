import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./montecarlo_shader.frag?raw";

export type MontecarloShaderState = ShaderLayerState & {
  strength: number;
};

export class MontecarloShader extends ShaderLayer {
  declare _state: MontecarloShaderState;
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): MontecarloShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "montecarlo",
      name: "montecarlo_" + getCount(sceneStateId),
      strength: 0.1,
    };
  }

  constructor(
    sceneStateId: string,
    state: MontecarloShaderState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {
      uStrength: { value: this.getFieldValue("strength"), type: "f32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    this.uniforms.uniforms.uStrength = this.getFieldValue("strength");
  }
}
