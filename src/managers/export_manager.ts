import type { Application } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { saveBase64Frame, type SceneState } from "../index.js";

export const subscribeExportManager = (sceneStateId: string) => {
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;
  application.ticker.add((time) => {
    const exporting = DataStore.getInstance().getStore(
      "instances." + sceneStateId + ".exporting",
    ) as boolean | false;

    if (
      exporting &&
      DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".exportNext",
      )
    ) {
      let currentFrame = DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".currentExportFrame",
      ) as number;
      if (currentFrame === undefined) {
        currentFrame = 0;
      }
      if (currentFrame !== 0) {
        saveBase64Frame(
          "editorScene",
          `frame_${currentFrame.toString().padStart(4, "0")}.png`,
        );
      }
      const totalFrames =
        (DataStore.getInstance().getStore(sceneStateId) as SceneState)
          .duration * 30;
      if (currentFrame >= totalFrames) {
        DataStore.getInstance().setStore(
          "instances." + sceneStateId + ".exporting",
          false,
        );
      }
      const elapsedTime = (currentFrame / 30) * 1000;
      console.log(
        `Exporting frame ${currentFrame}/${totalFrames} at time ${elapsedTime}ms`,
      );
      DataStore.getInstance().setStore("elapsedTime", elapsedTime);
      DataStore.getInstance().setStore(
        "instances." + sceneStateId + ".currentExportFrame",
        currentFrame + 1,
      );
    }
  });
};
