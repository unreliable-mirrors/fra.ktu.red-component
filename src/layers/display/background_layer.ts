import { Application, Graphics, Point, Sprite, Ticker } from "pixi.js";
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

  graphics: Graphics;
  declare mainSprite: Sprite;

  static getDefaultState(
    sceneStateId: string,
    color?: string,
  ): BackgroundLayerState {
    return {
      ...DisplayLayer.getDefaultState(sceneStateId),
      type: "background",
      name: "background_" + getCount(sceneStateId),
      color: color || getFunColor(),
    };
  }

  constructor(
    sceneStateId: string,
    state: BackgroundLayerState,
    owner: string,
  ) {
    super(sceneStateId, state, owner);
    this.mainSprite = new Sprite();
    this.graphics = new Graphics();

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
    this.graphics.clear();
    this.graphics
      .rect(0, 0, this.backgroundSize.x, this.backgroundSize.y)
      .fill({ color: this.getFieldValue("color") });
    const texture = DataStore.getInstance()
      .getStore("application")
      .renderer.generateTexture(this.graphics);
    this.mainSprite.texture = texture;
    this.mainSprite.visible = this._state.visible;
  }
}
