import { DataStore } from "../ktu/ui/core/data_store.js";
import type { IModulator } from "../modulators/imodulator.js";

export type Signal = {
  name: string;
  getValue: () => number;
  changed: boolean;
};

export type SignalValue = {
  value: number;
  emulator?: number;
};

export const getSignalValue = (
  signal: string,
  sceneStateId: string,
): number => {
  const signalValue = DataStore.getInstance().getStore(
    "signals." + signal,
  ) as SignalValue;
  console.log("Getting signal value for", signal, ":", signalValue);
  if (!signalValue) {
    return 0;
  }
  return signalValue.value !== undefined
    ? signalValue.value
    : signalValue.emulator !== undefined && signalValue.emulator !== null
      ? (
          DataStore.getInstance().getStore(
            "instances." +
              sceneStateId +
              ".modulators.!" +
              signalValue.emulator,
          ) as IModulator
        ).value
      : 0;
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
    ...(
      DataStore.getInstance().getStore(sceneStateId + ".signals") ||
      ([] as IModulator[])
    ).map((signal: string) => ({
      name: "signal." + signal,
      getValue: () => getSignalValue(signal, sceneStateId),
      changed: true,
    })),
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
