import { Application, Graphics, Sprite } from "pixi.js";
import { BaseLayer } from "../base_layer.js";
import type { LayerState } from "../ilayer.js";
import {
  DataStore,
  PixelateShader,
  type PixelateShaderState,
  type ShaderLayerState,
} from "../../index.js";
import type { ShaderLayer } from "../shaders/shader_layer.js";

export type DisplayLayerState = LayerState & {
  shaders: ShaderLayerState[];
};

export abstract class DisplayLayer extends BaseLayer {
  declare _state: DisplayLayerState;
  mainSprite!: Sprite | Graphics;
  shaders: ShaderLayer[] = [];

  static getDefaultState(): DisplayLayerState {
    return {
      ...BaseLayer.getDefaultState(),
      shaders: [],
    };
  }

  constructor(sceneStateId: string, state: DisplayLayerState) {
    super(sceneStateId, state);
  }

  onStateChange(): void {
    this.repaint();
    this.reshader();
  }

  repaint(): void {
    this.innerRepaint();
  }

  reshader(): void {
    for (const shader of this._state.shaders) {
      let layer = this.shaders.find((l) => l.id === shader.id);
      if (!layer) {
        if (shader.type === "pixelate") {
          layer = new PixelateShader(
            this.sceneStateId,
            shader as PixelateShaderState,
          );
          layer.bind();
          this.shaders.push(layer);
        }
      }
    }

    for (let i = this.shaders.length - 1; i >= 0; i--) {
      const layer = this.shaders[i]!;
      const existsInSceneState = this._state.shaders.some(
        (ls: LayerState) => ls.id === layer.id,
      );
      if (!existsInSceneState) {
        layer.unbind();
        this.shaders.splice(this.shaders.indexOf(layer), 1);
      }
    }

    if (!this.mainSprite || this.mainSprite.destroyed) {
      return;
    }
    console.log(
      "Applied shaders",
      this.shaders.map((s) => s.id),
    );
    this.mainSprite.filters = this.shaders.map((s) => s.shader);
  }

  bind(): void {
    this.repaint();
  }

  unbind() {
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    application.stage.removeChild(this.mainSprite);
    this.mainSprite.destroy();
    for (const shader of this.shaders) {
      shader.unbind();
    }
    this.shaders = [];
  }

  abstract innerRepaint(): void;
}
