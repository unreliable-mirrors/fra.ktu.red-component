import {
  Assets,
  Sprite,
  Texture,
  Ticker,
  VideoSource,
  type Application,
} from "pixi.js";
import { getCount } from "../../helpers/ids.js";
import { DataStore, EventDispatcher } from "../../index.js";
import type { LayerState } from "../ilayer.js";
import { DisplayLayer, type DisplayLayerState } from "./display_layer.js";
import { GifSprite } from "pixi.js/gif";
import {
  getAsset,
  getVideoAssetInstanceSrc,
  isVideoAsset,
} from "../../helpers/assets.js";

export type VideoLayerState = DisplayLayerState & {
  panX: number;
  panY: number;
  scale: number;
  vFlip: boolean;
  hFlip: boolean;
  imageHash: string;
  timeFrom: number;
  timeLength: number;
  speed: number;
};

export class VideoLayer extends DisplayLayer {
  declare _state: VideoLayerState;
  declare mainSprite: Sprite | GifSprite;
  videoElement?: HTMLVideoElement;
  content?: string;
  playingBefore: boolean = false;

  static getDefaultState(sceneStateId: string): VideoLayerState {
    return {
      ...DisplayLayer.getDefaultState(sceneStateId),
      type: "video",
      name: "video_" + getCount(sceneStateId),
      panX: 0.5,
      panY: 0.5,
      scale: 1,
      vFlip: false,
      hFlip: false,
      imageHash: "",
      timeFrom: 0,
      timeLength: -1,
      speed: 1,
    };
  }

  constructor(sceneStateId: string, state: VideoLayerState, owner: string) {
    super(sceneStateId, state, owner);
    this.mainSprite = new Sprite();

    console.log("Constructed video layer with state", state);

    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    application.stage.addChild(this.mainSprite);
  }

  tick(time: Ticker, loop: boolean): void {
    super.tick(time, loop);
    if (loop) {
      this.correctTime();
    }
    if (
      DataStore.getInstance().getStore("playing") !== this.playingBefore ||
      !DataStore.getInstance().getStore("playing")
    ) {
      this.correctTime();
      this.playingBefore = DataStore.getInstance().getStore("playing");
    }
    if (this.overtime()) {
      this.correctTime();
    }
  }

  overtime(): boolean {
    let currentTime = 0;
    let duration = 0;
    if (
      this.mainSprite.texture &&
      this.mainSprite.texture.source instanceof VideoSource
    ) {
      const resource = this.mainSprite.texture.source.resource;

      currentTime = resource.currentTime;
      duration = resource.duration;
    } else if (this.mainSprite instanceof GifSprite) {
      const gif = this.mainSprite as GifSprite;
      currentTime = gif.currentFrame / GifSprite.defaultOptions.fps!;
      duration = gif.duration / 1000;
    } else {
      return false;
    }
    if (
      currentTime < this.getFieldValue("timeFrom") &&
      duration > this.getFieldValue("timeFrom")
    )
      return true;
    if (this.getFieldValue("timeLength") > 0) {
      return (
        currentTime >
        this.getFieldValue("timeLength") + this.getFieldValue("timeFrom")
      );
    }
    return false;
  }

  correctTime(): void {
    let timeLength = this.getFieldValue("timeLength");
    if (timeLength <= 0.1 || isNaN(timeLength)) {
      timeLength = 9999999;
    }
    const currentTime =
      (((DataStore.getInstance().getStore("elapsedTime") / 1000) *
        this.getFieldValue("speed")) %
        timeLength) +
      this.getFieldValue("timeFrom");
    if (
      this.mainSprite.texture &&
      this.mainSprite.texture.source instanceof VideoSource
    ) {
      const resource = this.mainSprite.texture.source.resource;

      if (!DataStore.getInstance().getStore("playing")) {
        resource.pause();
      } else {
        resource.play();
      }

      if (resource.duration < currentTime) {
        if (this.getFieldValue("timeFrom") >= resource.duration) {
          resource.currentTime = 0;
        } else {
          resource.currentTime = this.getFieldValue("timeFrom");
        }
      } else {
        resource.currentTime = currentTime;
      }
    } else if (this.mainSprite instanceof GifSprite) {
      const gif = this.mainSprite as GifSprite;

      if (!DataStore.getInstance().getStore("playing")) {
        gif.stop();
      } else {
        gif.play();
      }

      if (gif.duration / 1000 < currentTime) {
        if (this.getFieldValue("timeFrom") >= gif.duration / 1000) {
          gif.currentFrame = 0;
        } else {
          gif.currentFrame = Math.floor(
            this.getFieldValue("timeFrom") * GifSprite.defaultOptions.fps!,
          );
        }
      } else {
        gif.currentFrame = Math.floor(
          currentTime * GifSprite.defaultOptions.fps!,
        );
      }
    }
  }

  innerRepaint() {
    console.log("Repainting video layer with imageHash", this._state.imageHash);
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;

    if (this._state.imageHash) {
      VideoSource.defaultOptions = {
        ...VideoSource.defaultOptions,
        loop: true,
        autoPlay: DataStore.getInstance().getStore("playing") || false,
      };

      //GET THE CONTENT
      const content = getAsset(
        this.sceneStateId,
        this._state.imageHash,
        this._state.id,
      );
      if (this.content && this.content === content) {
        this.reposition();
        this.reshader();
      } else if (
        content.startsWith("data:image/gif;") ||
        content.indexOf(".gif") >= 0
      ) {
        this.mainSprite.destroy();
        Assets.load(content).then((tex) => {
          this.mainSprite = new GifSprite({
            source: tex,
            animationSpeed: 1,
            loop: true,
            autoPlay: DataStore.getInstance().getStore("playing") || false,
            onFrameChange: (_currentFrame: number) => {
              EventDispatcher.getInstance().dispatchEvent(
                this.sceneStateId + ".layers.!" + this._state.id,
                "change",
                { sprite: this.mainSprite },
              );
            },
          });
          application.stage.addChild(this.mainSprite);
          this.reposition();
          this.reshader();
        });
      } else {
        this.mainSprite.destroy();
        const textureSrc = isVideoAsset(content)
          ? getVideoAssetInstanceSrc(
              content,
              `${this.sceneStateId}:${this._state.id}:${this._state.imageHash}`,
            )
          : content;
        const texturePromise = Assets.load<Texture>(textureSrc);
        texturePromise.then((resolvedTexture: Texture) => {
          this.mainSprite = Sprite.from(resolvedTexture);
          application.stage.addChild(this.mainSprite);
          this.reposition();
          this.reshader();
        });
      }
      this.content = content;
    } else {
      this.mainSprite = new Sprite();
      const application = DataStore.getInstance().getStore(
        "application",
      ) as Application;
      application.stage.addChild(this.mainSprite);
    }
  }
  reposition() {
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    this.mainSprite.anchor.set(0.5, 0.5);
    this.mainSprite.x = application.canvas.width * this.getFieldValue("panX");
    this.mainSprite.y = application.canvas.height * this.getFieldValue("panY");

    if (this.mainSprite.width < this.mainSprite.height) {
      this.mainSprite.width =
        application.canvas.width * this.getFieldValue("scale");
      this.mainSprite.scale.y = this.mainSprite.scale.x;
    } else {
      this.mainSprite.height =
        application.canvas.height * this.getFieldValue("scale");
      this.mainSprite.scale.x = this.mainSprite.scale.y;
    }
    //this.mainSprite.scale.set(this.getFieldValue("scale"));

    this.mainSprite.scale.x *= this.getFieldValue("hFlip") ? -1 : 1;
    this.mainSprite.scale.y *= this.getFieldValue("vFlip") ? -1 : 1;
  }
}
