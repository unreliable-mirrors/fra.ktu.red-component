import { Application, Graphics, Point, Ticker } from "pixi.js";
import { DisplayLayer } from "./display_layer.js";
import type { LayerState } from "../ilayer.js";
import { DataStore } from "../../index.js";
import { getCount } from "../../helpers/ids.js";
import { getFunColor } from "../../helpers/sparkle.js";

export type BackgroundLayerState = LayerState & {
  color: string;
};

export class BackgroundLayer extends DisplayLayer {
  declare _state: BackgroundLayerState;
  graphics: Graphics;
  backgroundSize: Point;

  static getDefaultState(): BackgroundLayerState {
    return {
      ...DisplayLayer.getDefaultState(),
      type: "background",
      name: "Background" + getCount(),
      color: getFunColor(),
    };
  }

  constructor(state: BackgroundLayerState) {
    super(state);
    this.graphics = new Graphics();
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    application.stage.addChild(this.graphics);

    this.backgroundSize = new Point(
      application.canvas.width,
      application.canvas.height,
    );
  }

  tick(time: Ticker, loop: boolean): void {
    super.tick(time, loop);
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    if (
      this.backgroundSize.x != application.canvas.width ||
      this.backgroundSize.y != application.canvas.height
    ) {
      this.backgroundSize = new Point(
        application.canvas.width,
        application.canvas.height,
      );
      this.repaint();
    }
  }

  bind(): void {
    super.bind();
    this.repaint();
  }

  innerRepaint() {
    console.log(
      "Repainting background layer with color",
      this._state.color,
      "and size",
      this.backgroundSize,
    );
    this.graphics.clear();
    this.graphics
      .rect(0, 0, this.backgroundSize.x, this.backgroundSize.y)
      .fill({ color: this._state.color });

    this.retexture();
  }

  retexture() {
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    const texture = application.renderer.generateTexture(this.graphics);
    this.mainSprite.texture = texture;
  }
}
