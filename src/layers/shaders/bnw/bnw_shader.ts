import type { UniformData } from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./bnw_shader.frag?raw";

export class BnwShader extends ShaderLayer {
  fragment: string = fragment;

  static getDefaultState(sceneStateId: string): ShaderLayerState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "bnw",
      name: "bnw_" + getCount(sceneStateId),
    };
  }

  constructor(sceneStateId: string, state: ShaderLayerState, owner: string) {
    super(sceneStateId, state, owner);
    console.trace();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    return {};
  }
}
