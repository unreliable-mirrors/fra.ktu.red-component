import jsx from "texsaur";
import { KTUComponent } from "../ktu/ui/core/ktu_component.js";
import type { SceneState } from "../types/red_scene_state.js";
import { Application, type ApplicationOptions } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { subscribeToLayerUpdates } from "../managers/layer_manager.js";
import { subscribeToShaderUpdates } from "../managers/shader_manager.js";

class RedViewer extends KTUComponent {
  sceneStateId: string;
  app: Application;
  canvas: HTMLCanvasElement | null = null;

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
      DataStore.getInstance().setStore("application", this.app);
      subscribeToLayerUpdates(this.sceneStateId);
      subscribeToShaderUpdates(this.sceneStateId);
      DataStore.getInstance().touch(this.sceneStateId);
    });
  }

  render(): Element {
    console.log("Rendering RedViewer with canvas", this.canvas);
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

  updateState(): void {
    super.updateState();
    console.log("Updating RedViewer state with sceneState", this.sceneState());
  }
}

export function RedViewerComponent(props: {
  sceneState: string;
  resizeTo?: HTMLElement;
}): Element {
  return new RedViewer(props);
}

customElements.define("red-viewer", RedViewer);
