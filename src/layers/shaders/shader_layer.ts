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

  bind(): void {
    console.log("Binding shader layer with state", this._state);
    this.buildShader();
    console.log("Bound shader layer with uniforms", this.uniforms);
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
      uRedDryWet: {
        value: this._state.visible ? this._state.redDryWet : 0,
        type: "f32",
      },
      uGreenDryWet: {
        value: this._state.visible ? this._state.greenDryWet : 0,
        type: "f32",
      },
      uBlueDryWet: {
        value: this._state.visible ? this._state.blueDryWet : 0,
        type: "f32",
      },
    };
  }

  updateUniforms() {
    console.log(
      "Updating shader uniforms with state",
      this,
      this.uniforms,
      this._state,
      DataStore.getInstance().getStore(
        "instances." + this.sceneStateId + ".shaders",
      ),
    );
    this.uniforms.uniforms.uRedDryWet = this._state.visible
      ? this._state.redDryWet
      : 0;
    this.uniforms.uniforms.uGreenDryWet = this._state.visible
      ? this._state.greenDryWet
      : 0;
    this.uniforms.uniforms.uBlueDryWet = this._state.visible
      ? this._state.blueDryWet
      : 0;
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

  unbind() {}
}
