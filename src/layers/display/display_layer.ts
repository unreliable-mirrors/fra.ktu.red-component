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
import {
  ChromaShader,
  type ChromaShaderState,
} from "../shaders/chroma/chroma_shader.js";
import {
  ScrambleShader,
  type ScrambleShaderState,
} from "../shaders/scramble/scramble_shader.js";
import { NegativeShader } from "../shaders/negative/negative_shader.js";
import {
  CrossesShader,
  type CrossesShaderState,
} from "../shaders/crosses/crosses_shader.js";
import {
  RecolourShader,
  type RecolourShaderState,
} from "../shaders/recolour/recolour_shader.js";
import { HNoiseShader } from "../shaders/hnoise/hnoise_shader.js";
import type { HNoiseShaderState } from "../shaders/hnoise/hnoise_shader.js";
import {
  LightSplitShader,
  type LightSplitShaderState,
} from "../shaders/light_split/light_split_shader.js";
import {
  PosterizeShader,
  type PosterizeShaderState,
} from "../shaders/posterize/posterize_shader.js";
import {
  BlurShader,
  type BlurShaderState,
} from "../shaders/blur/blur_shader.js";
import {
  HSBBlurShader,
  type HSBBlurShaderState,
} from "../shaders/hsb_blur/hsb_blur_shader.js";
import {
  HueOffsetShader,
  type HueOffsetShaderState,
} from "../shaders/hue_offset/hue_offset_shader.js";
import {
  HuePosterizeShader,
  type HuePosterizeShaderState,
} from "../shaders/hue_posterize/hue_posterize_shader.js";
import {
  BrightnessPosterizeShader,
  type BrightnessPosterizeShaderState,
} from "../shaders/brightness_posterize/brightness_posterize_shader.js";
import {
  AdjustmentShader,
  type AdjustmentShaderState,
} from "../shaders/adjustment/adjustment_shader.js";
import {
  PaletteRecolourShader,
  type PaletteRecolourShaderState,
} from "../shaders/palette_recolour/palette_recolour_shader.js";
import {
  LumaKeyShader,
  type LumaKeyShaderState,
} from "../shaders/luma_key/luma_key_shader.js";
import {
  MaskToShader,
  type MaskToShaderState,
} from "../shaders/mask_to/mask_to_shader.js";

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
          case "chroma":
            layer = new ChromaShader(
              this.sceneStateId,
              shader as ChromaShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "scramble":
            layer = new ScrambleShader(
              this.sceneStateId,
              shader as ScrambleShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "negative":
            layer = new NegativeShader(
              this.sceneStateId,
              shader as ShaderLayerState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "crosses":
            layer = new CrossesShader(
              this.sceneStateId,
              shader as CrossesShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "recolour":
            layer = new RecolourShader(
              this.sceneStateId,
              shader as RecolourShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "hnoise":
            layer = new HNoiseShader(
              this.sceneStateId,
              shader as HNoiseShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "light_split":
            layer = new LightSplitShader(
              this.sceneStateId,
              shader as LightSplitShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "posterize":
            layer = new PosterizeShader(
              this.sceneStateId,
              shader as PosterizeShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "blur":
            layer = new BlurShader(
              this.sceneStateId,
              shader as BlurShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "hsb_blur":
            layer = new HSBBlurShader(
              this.sceneStateId,
              shader as HSBBlurShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "hue_offset":
            layer = new HueOffsetShader(
              this.sceneStateId,
              shader as HueOffsetShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "hue_posterize":
            layer = new HuePosterizeShader(
              this.sceneStateId,
              shader as HuePosterizeShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "brightness_posterize":
            layer = new BrightnessPosterizeShader(
              this.sceneStateId,
              shader as BrightnessPosterizeShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "adjustment":
            layer = new AdjustmentShader(
              this.sceneStateId,
              shader as AdjustmentShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "palette_recolour":
            layer = new PaletteRecolourShader(
              this.sceneStateId,
              shader as PaletteRecolourShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "luma_key":
            layer = new LumaKeyShader(
              this.sceneStateId,
              shader as LumaKeyShaderState,
              this.sceneStateId + ".layers.!" + this._state.id + ".shaders",
            );
            break;
          case "mask_to":
            layer = new MaskToShader(
              this.sceneStateId,
              shader as MaskToShaderState,
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

    this.shaders = this._state.shaders.map((shaderState) => {
      return this.shaders.find((l) => l.id === shaderState.id);
    }) as ShaderLayer[];

    if (!this.mainSprite || this.mainSprite.destroyed) {
      return;
    }
    this.mainSprite.filters = this.shaders.map((s) => s.shader);
    console.log("RESHADER", this.mainSprite.filters);
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
