import jsx from "texsaur";
import { KTUComponent } from "../ktu/ui/core/ktu_component.js";
import type { SceneState } from "../types/red_scene_state.js";
import { Application, type ApplicationOptions } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import {
  BackgroundLayer,
  type BackgroundLayerState,
} from "../layers/display/background_layer.js";
import type { DisplayLayer } from "../layers/display/display_layer.js";

class RedViewer extends KTUComponent {
  sceneStateId: string;
  app: Application;
  canvas: HTMLCanvasElement | null = null;

  layers: DisplayLayer[] = [];

  constructor(props: { sceneState: string; resizeTo?: HTMLElement }) {
    super({ binding: props.sceneState });
    this.sceneStateId = props.sceneState;

    this.app = new Application();

    const options: Partial<ApplicationOptions> = {
      background: "#000000",
      sharedTicker: true,
    };

    console.log("RESIZE TO", props.resizeTo);
    if (props.resizeTo) {
      options.resizeTo = props.resizeTo;
    } else {
      options.width = this.bindingData[this.sceneStateId]?.width || 800;
      options.height = this.bindingData[this.sceneStateId]?.height || 600;
    }

    this.app.init(options).then(() => {
      this.canvas = this.app.canvas;
      this.reRender();
      DataStore.getInstance().setStore("application", this.app);

      this.materializeState();
      this.bindTicker();
    });
  }

  render(): Element {
    return (
      <div>
        <div class="red-viewer">{this.canvas}</div>
      </div>
    );
  }

  sceneState(): SceneState {
    return this.bindingData[this.sceneStateId];
  }

  defaultBinding(): Record<string, any> {
    return {
      [this.sceneStateId]: {
        width: 800,
        height: 600,
        layers: [],
      },
    };
  }

  materializeState() {
    const sceneState = this.sceneState();

    console.log("MATERIALIZING STATE", sceneState);

    for (const layerState of sceneState.layers) {
      if (layerState.type === "background") {
        const layer = new BackgroundLayer(layerState as BackgroundLayerState);
        layer.bind();
        this.layers.push(layer);
      }
    }
  }

  bindTicker() {
    this.app.ticker.add((time) => {
      for (const layer of this.layers) {
        layer.tick(time, this.app.ticker.started);
      }
    });
  }
}

export function RedViewerComponent(props: {
  sceneState: string;
  resizeTo?: HTMLElement;
}): Element {
  return new RedViewer(props);
}

customElements.define("red-viewer", RedViewer);
