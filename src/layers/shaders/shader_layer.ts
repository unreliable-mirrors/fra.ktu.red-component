import {
  Application,
  Filter,
  Graphics,
  Sprite,
  TextureSource,
  UniformGroup,
  type UniformData,
} from "pixi.js";
import { BaseLayer } from "../base_layer.js";
import type { LayerState } from "../ilayer.js";
import { DataStore } from "../../index.js";
import vertex from "./defaultFilter.vert?raw";

export type ShaderLayerState = LayerState & {
  redDryWet: number;
  greenDryWet: number;
  blueDryWet: number;
};

export abstract class ShaderLayer extends BaseLayer {
  declare _state: ShaderLayerState;
  shader!: Filter;
  abstract fragment: string;
  uniforms!: UniformGroup;

  static getDefaultState(sceneStateId: string): ShaderLayerState {
    return {
      ...BaseLayer.getDefaultState(sceneStateId),
      type: "pixelate",
      name: "shader",
      redDryWet: 1,
      greenDryWet: 1,
      blueDryWet: 1,
    };
  }

  constructor(sceneStateId: string, state: LayerState, owner: string) {
    super(sceneStateId, state, owner);
  }

  onStateChange(): void {
    this.updateUniforms();
  }

  onSignalChange(): void {
    this.updateUniforms();
  }

  bind(): void {
    this.buildShader();
  }

  buildShader() {
    this.uniforms = new UniformGroup({
      ...this.defaultUniforms(),
      ...this.setupUniformValues(),
    });
    const uniforms = this.uniforms;
    this.shader = Filter.from({
      gl: {
        vertex: this.getVertex(),
        fragment: this.fragment,
      },
      resources: { uniforms, ...this.getExtraTextures() },
    });
  }

  defaultUniforms(): {
    [key: string]: UniformData;
  } {
    return {
      uDryWet: {
        value: [
          this._state.visible ? this.getFieldValue("redDryWet") : 0,
          this._state.visible ? this.getFieldValue("greenDryWet") : 0,
          this._state.visible ? this.getFieldValue("blueDryWet") : 0,
          1,
        ],
        type: "vec4<f32>",
      },
    };
  }

  updateUniforms() {
    this.uniforms.uniforms.uDryWet = [
      this._state.visible ? this.getFieldValue("redDryWet") : 0,
      this._state.visible ? this.getFieldValue("greenDryWet") : 0,
      this._state.visible ? this.getFieldValue("blueDryWet") : 0,
      1,
    ];
  }

  abstract setupUniformValues(): {
    [key: string]: UniformData;
  };

  getVertex(): string {
    return vertex;
  }

  getExtraTextures(): {
    [key: string]: TextureSource;
  } {
    return {};
  }
}
