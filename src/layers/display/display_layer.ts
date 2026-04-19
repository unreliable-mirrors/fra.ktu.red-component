import { Application, Graphics, Sprite } from "pixi.js";
import { BaseLayer } from "../base_layer.js";
import type { LayerState } from "../ilayer.js";
import { DataStore } from "../../index.js";

export abstract class DisplayLayer extends BaseLayer {
  mainSprite!: Sprite | Graphics;

  constructor(sceneStateId: string, state: LayerState) {
    super(sceneStateId, state);
  }

  onStateChange(): void {
    this.repaint();
  }

  repaint(): void {
    this.innerRepaint();
  }

  bind(): void {
    this.repaint();
  }

  unbind() {
    const application = DataStore.getInstance().getStore(
      "application",
    ) as Application;
    application.stage.removeChild(this.mainSprite);
    this.mainSprite.destroy();
  }

  abstract innerRepaint(): void;
}
