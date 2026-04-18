import { Application, Sprite } from "pixi.js";
import { BaseLayer } from "../base_layer.js";
import type { LayerState } from "../ilayer.js";
import { DataStore } from "../../index.js";

export abstract class DisplayLayer extends BaseLayer {
  mainSprite!: Sprite;

  constructor(state: LayerState) {
    super(state);

    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    if (!this.mainSprite) {
      this.mainSprite = new Sprite();
      application.stage.addChild(this.mainSprite);
      this.mainSprite.visible = false;
    }
  }

  onStateChange(): void {
    this.repaint();
  }

  repaint(): void {
    this.innerRepaint();
    this.retexture();
  }

  abstract innerRepaint(): void;

  abstract retexture(): void;
}
