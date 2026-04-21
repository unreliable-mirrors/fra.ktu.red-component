import { DataStore } from "../ktu/ui/core/data_store.js";
import type { IModulator } from "../modulators/imodulator.js";

export type Signal = {
  name: string;
  getValue: () => number;
};

export const getAvailableSignals = (sceneStateId: string): Signal[] => {
  return [
    {
      name: "scene.width",
      getValue: () =>
        DataStore.getInstance().getStore(sceneStateId + ".width") || 0,
    },
    {
      name: "scene.height",
      getValue: () =>
        DataStore.getInstance().getStore(sceneStateId + ".height") || 0,
    },
    {
      name: "scene.elapsedTime",
      getValue: () =>
        DataStore.getInstance().getStore(sceneStateId + ".elapsedTime") || 0,
    },
    {
      name: "scene.elapsedRatio",
      getValue: () =>
        DataStore.getInstance().getStore(sceneStateId + ".elapsedTime") /
          DataStore.getInstance().getStore(sceneStateId + ".duration") || 0,
    },
    {
      name: "punk.master.volume",
      getValue: () =>
        DataStore.getInstance().getStore("punk.master.volume") || 0,
    },
    {
      name: "punk.master.pitch",
      getValue: () =>
        DataStore.getInstance().getStore("punk.master.pitch") || 0,
    },
    ...(
      DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".modulators",
      ) || ([] as IModulator[])
    ).map((modulator: IModulator) => ({
      name: "modulator." + modulator.name,
      getValue: () => modulator.getValue(),
    })),
  ];
};
