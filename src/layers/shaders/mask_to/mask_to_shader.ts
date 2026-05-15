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
import fragment from "./mask_to_shader.frag?raw";
import vertex from "./mask_to_shader.vert?raw";
import { DataStore } from "../../../ktu/ui/core/data_store.js";

export type MaskToShaderState = ShaderLayerState & {
  lowThreshold: number;
  topThreshold: number;
  inverse: boolean;
  baseLayerId?: number;
};

type MaskToTexture = {
  name: "base";
  texture: Texture;
  sprite: Sprite;
  matrix: TextureMatrix;
};

export class MaskToShader extends ShaderLayer {
  declare _state: MaskToShaderState;
  fragment: string = fragment;

  base!: MaskToTexture;

  static getDefaultState(sceneStateId: string): MaskToShaderState {
    return {
      ...ShaderLayer.getDefaultState(sceneStateId),
      type: "mask_to",
      name: "mask_to_" + getCount(sceneStateId),
      lowThreshold: 0.35,
      topThreshold: 0.65,
      inverse: false,
    };
  }

  constructor(sceneStateId: string, state: MaskToShaderState, owner: string) {
    super(sceneStateId, state, owner);
  }

  bind(): void {
    super.bind();
  }

  tick(time: any, loop: boolean): void {
    super.tick(time, loop);
    this.setupTexture();
  }

  setupUniformValues(): { [key: string]: UniformData } {
    const lowThreshold = this.getFieldValue("lowThreshold");
    const topThreshold = this.getFieldValue("topThreshold");

    return {
      uBaseMatrix: { value: new Matrix(), type: "mat3x3<f32>" },
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
    if (this.base === undefined) {
      this.base = this.buildTexture("base", new Sprite());
    }
    return {
      uBaseTexture: this.base.texture.source,
    };
  }

  getVertex(): string {
    return vertex;
  }

  buildTexture(name: "base", sprite: Sprite | null): MaskToTexture {
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
      texture,
      sprite,
      matrix: new TextureMatrix(texture),
    };
  }

  setBaseTexture(maskTex: MaskToTexture) {
    const uniformMatrix = this.uniforms.uniforms.uBaseMatrix as Matrix;

    if (maskTex.sprite.texture) {
      (
        DataStore.getInstance().getStore("application") as Application
      ).renderer.filter
        .calculateSpriteMatrix(uniformMatrix, maskTex.sprite)
        .prepend(maskTex.matrix.mapCoord);

      this.shader.resources.uBaseTexture = maskTex.texture.source;
    } else {
      console.log("No sprite texture for", maskTex.name);
    }
  }

  setupTexture() {
    const baseLayerId = this.getFieldValue("baseLayerId");
    if (baseLayerId !== undefined) {
      const baseLayer = DataStore.getInstance().getStore(
        "instances." + this.sceneStateId + ".layers.!" + baseLayerId,
      );
      if (baseLayer) {
        const baseSprite = baseLayer.mainSprite;
        if (baseSprite) {
          this.base = this.buildTexture("base", baseSprite);
          this.setBaseTexture(this.base);
        } else {
          console.log("Base layer has no sprite", baseLayer);
        }
      } else {
        console.log("No layer found with id", baseLayerId);
      }
    } else {
      console.log("No baseLayerId set for MaskToShader", this.id);
    }
  }

  onStateChange(): void {
    super.onStateChange();
    console.log("ON STATE CHANGE", this.id, this._state);
    this.setupTexture();
  }
}
