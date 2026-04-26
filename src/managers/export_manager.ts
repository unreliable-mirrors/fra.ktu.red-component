import type { Application } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import {
  captureBase64Frame,
  saveBase64FramesZip,
  type ExportedFrame,
  type SceneState,
} from "../index.js";

export const subscribeExportManager = (sceneStateId: string) => {
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;
  let frameInProgress = false;
  let exportedFrames: ExportedFrame[] = [];

  application.ticker.add(async () => {
    const exporting = DataStore.getInstance().getStore(
      "instances." + sceneStateId + ".exporting",
    ) as boolean | false;

    if (
      exporting &&
      !frameInProgress &&
      DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".exportNext",
      )
    ) {
      frameInProgress = true;
      let currentFrame = DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".currentExportFrame",
      ) as number;
      try {
        if (currentFrame === undefined) {
          currentFrame = 0;
        }

        if (currentFrame === 0) {
          exportedFrames = [];
        }

        if (currentFrame !== 0) {
          exportedFrames.push(
            await captureBase64Frame(
              sceneStateId,
              `frame_${currentFrame.toString().padStart(4, "0")}.png`,
            ),
          );
        }
        const totalFrames =
          (DataStore.getInstance().getStore(sceneStateId) as SceneState)
            .duration * 30;
        if (currentFrame >= totalFrames) {
          await saveBase64FramesZip(sceneStateId, exportedFrames);
          exportedFrames = [];
          DataStore.getInstance().setStore(
            "instances." + sceneStateId + ".exporting",
            false,
          );
          DataStore.getInstance().setStore(
            "instances." + sceneStateId + ".currentExportFrame",
            0,
          );
        } else {
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
      } catch (error) {
        console.error(
          `Failed to export frame ${currentFrame} for scene ${sceneStateId}`,
          error,
        );
        exportedFrames = [];
        DataStore.getInstance().setStore(
          "instances." + sceneStateId + ".exporting",
          false,
        );
        DataStore.getInstance().setStore(
          "instances." + sceneStateId + ".currentExportFrame",
          0,
        );
      } finally {
        frameInProgress = false;
      }
    }
  });
};
