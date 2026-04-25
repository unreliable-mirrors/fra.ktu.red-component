import { Rectangle, type Application } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import type { SceneState } from "../types/red_scene_state.js";

export const saveBase64Frame = (sceneStateId: string): void => {
  const state = DataStore.getInstance().getStore(sceneStateId) as SceneState;
  const filename = state.name + ".png";
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;

  const content = application.renderer.extract
    .base64({
      target: application.stage,
      frame: new Rectangle(0, 0, state.width, state.height),
    })
    .then((content) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = content;
      link.click();
    });
};
