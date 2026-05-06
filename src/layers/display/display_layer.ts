import { Application, Graphics, Sprite } from "pixi.js";
import { BaseLayer } from "../base_layer.js";
import type { LayerState } from "../ilayer.js";
import {
  AnaglyphShader,
  BnwShader,
  DataStore,
  MontecarloShader,
  PixelateShader,
  VLinesShader,
  type AnaglyphShaderState,
  type MontecarloShaderState,
  type PixelateShaderState,
  type ShaderLayerState,
  type VLinesShaderState,
} from "../../index.js";
import type { ShaderLayer } from "../shaders/shader_layer.js";
import {
  HLinesShader,
  type HLinesShaderState,
} from "../shaders/hlines/hlines_shader.js";

export type DisplayLayerState = LayerState & {
  shaders: ShaderLayerState[];
};

export abstract class DisplayLayer extends BaseLayer {
  declare _state: DisplayLayerState;
  mainSprite!: Sprite | Graphics;
  shaders: ShaderLayer[] = [];

  static getDefaultState(sceneStateId: string): DisplayLayerState {
    return {
      ...BaseLayer.getDefaultState(sceneStateId),
      shaders: [],
    };
  }

  constructor(sceneStateId: string, state: DisplayLayerState, owner: string) {
    super(sceneStateId, state, owner);
  }

  onStateChange(): void {
    this.repaint();
    this.reshader();
  }

  onSignalChange(): void {
    this.repaint();
  }

  repaint(): void {
    this.innerRepaint();
  }

  reshader(): void {
    for (const shader of this._state.shaders) {
      let layer = this.shaders.find((l) => l.id === shader.id);
      if (!layer) {
        switch (shader.type) {
          case "pixelate":
            layer = new PixelateShader(
              this.sceneStateId,
              shader as PixelateShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "bnw":
            layer = new BnwShader(
              this.sceneStateId,
              shader as ShaderLayerState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "montecarlo":
            layer = new MontecarloShader(
              this.sceneStateId,
              shader as MontecarloShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "anaglyph":
            layer = new AnaglyphShader(
              this.sceneStateId,
              shader as AnaglyphShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "vlines":
            layer = new VLinesShader(
              this.sceneStateId,
              shader as VLinesShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "hlines":
            layer = new HLinesShader(
              this.sceneStateId,
              shader as HLinesShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          default:
            layer = new PixelateShader(
              this.sceneStateId,
              shader as PixelateShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
        }
        layer.bind();
        this.shaders.push(layer);
      }
    }

    for (let i = this.shaders.length - 1; i >= 0; i--) {
      const shader = this.shaders[i]!;
      const existsInSceneState = this._state.shaders.some(
        (ls: LayerState) => ls.id === shader.id,
      );
      if (!existsInSceneState) {
        shader.unbind();
        this.shaders.splice(this.shaders.indexOf(shader), 1);
      }
    }

    if (!this.mainSprite || this.mainSprite.destroyed) {
      return;
    }
    this.mainSprite.filters = this.shaders.map((s) => s.shader);
  }

  bind(): void {
    this.repaint();
  }

  unbind() {
    super.unbind();
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    application.stage.removeChild(this.mainSprite);
    this.mainSprite.destroy();
    this.mainSprite = undefined as any;
    for (const shader of this.shaders) {
      shader.unbind();
    }
    this.shaders = [];
  }

  abstract innerRepaint(): void;

  tick(time: any, loop: boolean): void {
    super.tick(time, loop);
    for (const shader of this.shaders) {
      shader.tick(time, loop);
    }
  }
}
