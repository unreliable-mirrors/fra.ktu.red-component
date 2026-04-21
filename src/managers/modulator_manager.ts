import type { Application } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { EventDispatcher } from "../ktu/ui/core/event_dispatcher.js";
import type { SceneState } from "../types/red_scene_state.js";
import type { IModulator, ModulatorState } from "../modulators/imodulator.js";
import {
  LfoModulator,
  type LfoModulatorState,
} from "../modulators/lfo_modulator.js";

export const subscribeToModulatorUpdates = (sceneStateId: string) => {
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;
  application.ticker.add((time) => {
    const modulators = DataStore.getInstance().getStore(
      "instances." + sceneStateId + ".modulators",
    ) as IModulator[];
    for (const modulator of modulators) {
      modulator.tick(time);
    }
  });

  DataStore.getInstance().setStore(
    "instances." + sceneStateId + ".modulators",
    [],
  );
  EventDispatcher.getInstance().addEventListener(
    sceneStateId + ".modulators",
    "update",
    () => {
      console.log("Updating modulators for sceneStateId", sceneStateId);
      const application = DataStore.getInstance().getStore(
        "application",
      ) as Application;
      const sceneState = DataStore.getInstance().getStore(
        sceneStateId,
      ) as SceneState;
      const modulators = DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".modulators",
      ) as IModulator[];
      for (const modulator of sceneState.modulators) {
        let modulatorInstance = modulators.find((l) => l.id === modulator.id);
        if (!modulatorInstance) {
          switch (modulator.type) {
            case "lfo":
              modulatorInstance = new LfoModulator(
                sceneStateId,
                modulator as LfoModulatorState,
              );
              break;
            default:
              modulatorInstance = new LfoModulator(
                sceneStateId,
                modulator as LfoModulatorState,
              );
          }
          modulators.push(modulatorInstance);
          DataStore.getInstance().touch(
            "instances." + sceneStateId + ".modulators",
          );
        }
      }

      for (let i = modulators.length - 1; i >= 0; i--) {
        const modulatorInstance = modulators[i]!;
        const existsInSceneState = sceneState.modulators.some(
          (ls: ModulatorState) => ls.id === modulatorInstance.id,
        );
        if (!existsInSceneState) {
          modulators.splice(modulators.indexOf(modulatorInstance), 1);
          DataStore.getInstance().touch(
            "instances." + sceneStateId + ".modulators",
          );
        }
      }
    },
  );
};
