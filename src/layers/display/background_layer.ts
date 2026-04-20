import { Application, Graphics, Point, Ticker } from "pixi.js";
import { DisplayLayer, type DisplayLayerState } from "./display_layer.js";
import type { LayerState } from "../ilayer.js";
import { DataStore } from "../../index.js";
import { getCount } from "../../helpers/ids.js";
import { getFunColor } from "../../helpers/sparkle.js";

export type BackgroundLayerState = DisplayLayerState & {
  color: string;
};

export class BackgroundLayer extends DisplayLayer {
  declare _state: BackgroundLayerState;
  backgroundSize: Point;

  declare mainSprite: Graphics;

  static getDefaultState(): BackgroundLayerState {
    return {
      ...DisplayLayer.getDefaultState(),
      type: "background",
      name: "background_" + getCount(),
      color: getFunColor(),
    };
  }

  constructor(sceneStateId: string, state: BackgroundLayerState) {
    super(sceneStateId, state);
    this.mainSprite = new Graphics();

    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    application.stage.addChild(this.mainSprite);

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

  innerRepaint() {
    console.log(
      "Repainting background layer with color",
      this._state.color,
      "and size",
      this.backgroundSize,
    );
    this.mainSprite.clear();
    this.mainSprite
      .rect(0, 0, this.backgroundSize.x, this.backgroundSize.y)
      .fill({ color: this._state.color });
    this.mainSprite.visible = this._state.visible;
  }
}
