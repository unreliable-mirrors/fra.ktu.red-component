import { DataStore } from "../ktu/ui/core/data_store.js";
import type { IModulator } from "../modulators/imodulator.js";

export type Signal = {
  name: string;
  getValue: () => number;
  changed: boolean;
};

export const getAvailableSignals = (sceneStateId: string): Signal[] => {
  return [
    {
      name: "scene.width",
      getValue: () =>
        DataStore.getInstance().getStore(sceneStateId + ".width") || 0,
      changed: false,
    },
    {
      name: "scene.height",
      getValue: () =>
        DataStore.getInstance().getStore(sceneStateId + ".height") || 0,
      changed: false,
    },
    {
      name: "scene.elapsedTime",
      getValue: () =>
        DataStore.getInstance().getStore(
          "instances." + sceneStateId + ".elapsedTime",
        ) / 1000 || 0,
      changed: true,
    },
    {
      name: "scene.elapsedRatio",
      getValue: () =>
        DataStore.getInstance().getStore(
          "instances." + sceneStateId + ".elapsedTime",
        ) /
          1000 /
          DataStore.getInstance().getStore(sceneStateId + ".duration") || 0,
      changed: true,
    },
    {
      name: "punk.master.volume",
      getValue: () =>
        DataStore.getInstance().getStore("punk.master.volume") || 0,
      changed: false,
    },
    {
      name: "punk.master.pitch",
      getValue: () =>
        DataStore.getInstance().getStore("punk.master.pitch") || 0,
      changed: false,
    },
    ...(
      DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".modulators",
      ) || ([] as IModulator[])
    ).map((modulator: IModulator) => ({
      name: "modulator." + modulator.name,
      getValue: () => modulator.value,
      changed: modulator.changed,
    })),
  ];
};

export const getSignal = (sceneStateId: string, signalName: string) => {
  const signal = getAvailableSignals(sceneStateId).find(
    (s) => s.name === signalName,
  );
  if (signal) {
    return signal;
  }
  return null;
};
