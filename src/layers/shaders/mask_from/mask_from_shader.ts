import {
  type UniformData,
  Application,
  Matrix,
  Sprite,
  Texture,
  TextureMatrix,
  TextureSource,
} from "pixi.js";
import { getCount } from "../../../helpers/ids.js";
import { ShaderLayer, type ShaderLayerState } from "../shader_layer.js";
import fragment from "./mask_from_shader.frag?raw";
import vertex from "./mask_from_shader.vert?raw";
import { DataStore } from "../../../ktu/ui/core/data_store.js";
import { EventDispatcher } from "../../../ktu/ui/core/event_dispatcher.js";

export type MaskFromShaderState = ShaderLayerState & {
  lowThreshold: number;
  topThreshold: number;
  inverse: boolean;
  maskLayerId?: number;
};

type MaskFromTexture = {
  name: "mask";
  layerId?: number;
  texture: Texture;
  sprite: Sprite;
  matrix: TextureMatrix;
};

export class MaskFromShader extends ShaderLayer {
  declare _state: MaskFromShaderState;
  fragment: string = fragment;

  mask!: MaskFromTexture;

  handleLayerChangeWrapper: Function = this.handleLayerChange.bind(this);

  static getDefaultState(sceneStateId: string): MaskFromShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "mask_from",
      name: "mask_from_" + getCount(sceneStateId),
      lowThreshold: 0.35,
      topThreshold: 0.65,
      inverse: false,
    };
  }

  constructor(sceneStateId: string, state: MaskFromShaderState, owner: string) {
    super(sceneStateId, state, owner);
  }

  unbind(): void {
    super.unbind();
    EventDispatcher.getInstance().removeEventListener(
      this.sceneStateId + ".layers.!" + this.mask.layerId,
      "frame",
      this.handleLayerChangeWrapper,
    );
    this.mask = undefined as any;
  }

  tick(time: any, loop: boolean): void {
    super.tick(time, loop);
    this.evaluateTexture();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    const lowThreshold = this.getFieldValue("lowThreshold");
    const topThreshold = this.getFieldValue("topThreshold");

    return {
      uMaskMatrix: { value: new Matrix(), type: "mat3x3<f32>" },
      uLowThreshold: { value: lowThreshold, type: "f32" },
      uTopThreshold: { value: topThreshold, type: "f32" },
      uInverse: { value: this.getFieldBoolean("inverse") ? 1 : 0, type: "i32" },
    };
  }

  updateUniforms(): void {
    super.updateUniforms();
    const legacyThreshold = this.getFieldValue("threshold") ?? 0.5;
    this.uniforms.uniforms.uLowThreshold =
      this.getFieldValue("lowThreshold") ?? legacyThreshold;
    this.uniforms.uniforms.uTopThreshold =
      this.getFieldValue("topThreshold") ?? legacyThreshold;
    this.uniforms.uniforms.uInverse = this.getFieldBoolean("inverse") ? 1 : 0;
  }

  getExtraTextures(): { [key: string]: TextureSource } {
    if (this.mask === undefined) {
      this.mask = this.buildTexture("mask", new Sprite());
    }
    return {
      uMaskTexture: this.mask.texture.source,
    };
  }

  getVertex(): string {
    return vertex;
  }

  buildTexture(name: "mask", sprite: Sprite | null): MaskFromTexture {
    if (!sprite) {
      console.log("No sprite for", name);
      sprite = Sprite.from(Texture.EMPTY);
    }
    let texture = sprite.texture;
    if (!texture) {
      console.log("No texture for", name);
      texture = Texture.EMPTY;
    }

    return {
      name: name,
      layerId: this._state.maskLayerId,
      texture,
      sprite,
      matrix: new TextureMatrix(texture),
    };
  }

  setMaskTexture(maskTex: MaskFromTexture) {
    const uniformMatrix = this.uniforms.uniforms.uMaskMatrix as Matrix;

    if (maskTex.sprite.texture) {
      (
        DataStore.getInstance().getStore("application") as Application
      ).renderer.filter
        .calculateSpriteMatrix(uniformMatrix, maskTex.sprite)
        .prepend(maskTex.matrix.mapCoord);

      this.shader.resources.uMaskTexture = maskTex.texture.source;
    } else {
      console.log("No sprite texture for", maskTex.name);
    }
  }

  evaluateTexture(force: boolean = false) {
    const maskSprite = this.getMaskSprite();
    if (maskSprite) {
      const different = this.mask.sprite.texture !== maskSprite.texture;
      if (different || force) {
        if (this.mask.layerId && different) {
          EventDispatcher.getInstance().removeEventListener(
            this.sceneStateId + ".layers.!" + this.mask.layerId,
            "frame",
            this.handleLayerChangeWrapper,
          );
        }
        this.mask = this.buildTexture("mask", maskSprite);
        this.setMaskTexture(this.mask);
        if (this.mask.layerId && different) {
          EventDispatcher.getInstance().addEventListener(
            this.sceneStateId + ".layers.!" + this.mask.layerId,
            "frame",
            this.handleLayerChangeWrapper,
          );
          console.log("Listening to layer", this.mask.layerId);
        }
      }
    }
  }

  handleLayerChange() {
    this.evaluateTexture(true);
  }

  getMaskSprite(): Sprite | null {
    const maskLayerId = this.getFieldValue("maskLayerId");
    if (maskLayerId !== undefined) {
      const maskLayer = DataStore.getInstance().getStore(
        "instances." + this.sceneStateId + ".layers.!" + maskLayerId,
      );
      if (maskLayer) {
        return maskLayer.mainSprite;
      } else {
        console.log("No layer found with id", maskLayerId);
      }
    }
    return null;
  }

  onStateChange(): void {
    super.onStateChange();
    console.log("ON STATE CHANGE", this.id, this._state);
    this.evaluateTexture();
  }
}
