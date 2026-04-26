import { Rectangle, type Application } from "pixi.js";
import JSZip from "jszip";
import { DataStore } from "../ktu/ui/core/data_store.js";
import type { SceneState } from "../types/red_scene_state.js";

export type ExportedFrame = {
  filename: string;
  content: string;
};

const getSceneExportContext = (
  sceneStateId: string,
): {
  state: SceneState;
  application: Application;
} => {
  const state = DataStore.getInstance().getStore(sceneStateId) as SceneState;
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;

  return { state, application };
};

export const captureBase64Frame = async (
  sceneStateId: string,
  filename?: string,
): Promise<ExportedFrame> => {
  const { state, application } = getSceneExportContext(sceneStateId);

  return {
    filename: filename ?? `${state.name}.png`,
    content: await application.renderer.extract.base64({
      target: application.stage,
      frame: new Rectangle(0, 0, state.width, state.height),
    }),
  };
};

export const saveBase64Frame = (
  sceneStateId: string,
  filename?: string,
): Promise<void> => {
  const { state } = getSceneExportContext(sceneStateId);
  filename = filename ?? state.name + ".png";

  DataStore.getInstance().setStore(
    "instances." + sceneStateId + ".exportNext",
    false,
  );

  return captureBase64Frame(sceneStateId, filename)
    .then((frame) => {
      const link = document.createElement("a");
      link.download = frame.filename;
      link.href = frame.content;
      link.click();
    })
    .finally(() => {
      DataStore.getInstance().setStore(
        "instances." + sceneStateId + ".exportNext",
        true,
      );
    });
};

export const saveBase64FramesZip = async (
  sceneStateId: string,
  frames: ExportedFrame[],
  zipFilename?: string,
): Promise<void> => {
  const state = DataStore.getInstance().getStore(sceneStateId) as SceneState;
  const resolvedZipFilename = zipFilename ?? `${state.name}_frames.zip`;

  DataStore.getInstance().setStore(
    "instances." + sceneStateId + ".exportNext",
    false,
  );

  try {
    const zip = new JSZip();

    for (const frame of frames) {
      const base64Content = frame.content.includes(",")
        ? frame.content.split(",")[1]!
        : frame.content;
      zip.file(frame.filename, base64Content, { base64: true });
    }

    const zipBlob = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(zipBlob);
    link.download = resolvedZipFilename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  } finally {
    DataStore.getInstance().setStore(
      "instances." + sceneStateId + ".exportNext",
      true,
    );
  }
};
