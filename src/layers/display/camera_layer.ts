import { Sprite, Texture, type Application } from "pixi.js";
import { getCount } from "../../helpers/ids.js";
import { DataStore } from "../../index.js";
import { DisplayLayer, type DisplayLayerState } from "./display_layer.js";

export type CameraLayerState = DisplayLayerState & {
  panX: number;
  panY: number;
  scale: number;
  vFlip: boolean;
  hFlip: boolean;
};

export class CameraLayer extends DisplayLayer {
  declare _state: CameraLayerState;
  declare mainSprite: Sprite;

  private stream?: MediaStream;
  private videoElement?: HTMLVideoElement;
  private streamPromise?: Promise<void>;

  static getDefaultState(sceneStateId: string): CameraLayerState {
    return {
      ...DisplayLayer.getDefaultState(sceneStateId),
      type: "camera",
      name: "camera_" + getCount(sceneStateId),
      panX: 0.5,
      panY: 0.5,
      scale: 1,
      vFlip: false,
      hFlip: false,
    };
  }

  constructor(sceneStateId: string, state: CameraLayerState, owner: string) {
    super(sceneStateId, state, owner);
    this.mainSprite = new Sprite();

    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    application.stage.addChild(this.mainSprite);
  }

  innerRepaint(): void {
    void this.ensureCameraStream();
    this.reposition();
  }

  unbind(): void {
    super.unbind();
    this.stopCameraStream();
  }

  private async ensureCameraStream(): Promise<void> {
    if (this.stream || this.streamPromise) {
      return this.streamPromise;
    }
    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia ||
      !navigator.mediaDevices.enumerateDevices
    ) {
      console.warn("[CameraLayer] Media devices are not available");
      return;
    }

    this.streamPromise = this.startCameraStream()
      .catch((error) => {
        console.error("[CameraLayer] Failed to initialize camera", error);
      })
      .finally(() => {
        this.streamPromise = undefined;
      });

    return this.streamPromise;
  }

  private async startCameraStream(): Promise<void> {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const firstCamera = devices.find((device) => device.kind === "videoinput");

    const constraintsToTry: MediaStreamConstraints[] = [];
    if (firstCamera?.deviceId) {
      constraintsToTry.push({
        video: { deviceId: { exact: firstCamera.deviceId } },
        audio: false,
      });
      constraintsToTry.push({
        video: { deviceId: { ideal: firstCamera.deviceId } },
        audio: false,
      });
    }
    constraintsToTry.push({ video: true, audio: false });

    let stream: MediaStream | undefined;
    let lastError: unknown;
    for (const constraints of constraintsToTry) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        break;
      } catch (error) {
        lastError = error;
      }
    }

    if (!stream) {
      throw lastError;
    }

    const videoElement = document.createElement("video");
    videoElement.autoplay = true;
    videoElement.muted = true;
    videoElement.playsInline = true;
    videoElement.srcObject = stream;
    await videoElement.play().catch(() => undefined);

    this.stream = stream;
    this.videoElement = videoElement;
    this.mainSprite.texture = Texture.from(videoElement);
    this.reposition();
  }

  private stopCameraStream(): void {
    if (this.videoElement) {
      this.videoElement.pause();
      this.videoElement.srcObject = null;
      this.videoElement = undefined;
    }
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
      this.stream = undefined;
    }
  }

  private reposition(): void {
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;

    this.mainSprite.anchor.set(0.5, 0.5);
    this.mainSprite.x = application.canvas.width * this.getFieldValue("panX");
    this.mainSprite.y = application.canvas.height * this.getFieldValue("panY");

    if (this.mainSprite.width > 0 && this.mainSprite.height > 0) {
      if (this.mainSprite.width < this.mainSprite.height) {
        this.mainSprite.width =
          application.canvas.width * this.getFieldValue("scale");
        this.mainSprite.scale.y = this.mainSprite.scale.x;
      } else {
        this.mainSprite.height =
          application.canvas.height * this.getFieldValue("scale");
        this.mainSprite.scale.x = this.mainSprite.scale.y;
      }
    }

    this.mainSprite.scale.x *= this.getFieldValue("hFlip") ? -1 : 1;
    this.mainSprite.scale.y *= this.getFieldValue("vFlip") ? -1 : 1;
    this.mainSprite.visible = this.getFieldBoolean("visible");
  }
}
