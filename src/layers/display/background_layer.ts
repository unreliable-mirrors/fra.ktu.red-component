import { Application, Graphics, Point, Ticker } from "pixi.js";
import { DisplayLayer, type DisplayLayerState } from "./display_layer.js";
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

  static getDefaultState(sceneStateId: string): BackgroundLayerState {
    return {
      ...DisplayLayer.getDefaultState(sceneStateId),
      type: "background",
      name: "background_" + getCount(sceneStateId),
      color: getFunColor(),
    };
  }

  constructor(
    sceneStateId: string,
    state: BackgroundLayerState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
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
    this.mainSprite.clear();
    this.mainSprite
      .rect(0, 0, this.backgroundSize.x, this.backgroundSize.y)
      .fill({ color: this.getFieldValue("color") });
    this.mainSprite.visible = this._state.visible;
  }
}
