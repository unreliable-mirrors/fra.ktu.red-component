import type { Application } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { EventDispatcher } from "../ktu/ui/core/event_dispatcher.js";
import type { LayerState } from "../layers/ilayer.js";
import {
  PixelateShader,
  type PixelateShaderState,
} from "../layers/shaders/pixelate/pixelate_shader.js";
import type { ShaderLayer } from "../layers/shaders/shader_layer.js";
import type { SceneState } from "../types/red_scene_state.js";

export const subscribeToShaderUpdates = (sceneStateId: string) => {
  DataStore.getInstance().setStore(
    "instances." + sceneStateId + ".shaders",
    [],
  );
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;
  application.ticker.add((time) => {
    const shaders: ShaderLayer[] = DataStore.getInstance().getStore(
      "instances." + sceneStateId + ".shaders",
    );
    for (const shader of shaders) {
      shader.tick(time, false);
    }
  });

  EventDispatcher.getInstance().addEventListener(
    sceneStateId + ".shaders",
    "update",
    () => {
      const application = DataStore.getInstance().getStore(
        "application",
      ) as Application;
      const sceneState = DataStore.getInstance().getStore(
        sceneStateId,
      ) as SceneState;
      const shaders = DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".shaders",
      ) as ShaderLayer[];
      for (const shader of sceneState.shaders) {
        let shaderInstance = shaders.find((l) => l.id === shader.id);
        if (!shaderInstance) {
          switch (shader.type) {
            case "pixelate":
              shaderInstance = new PixelateShader(
                sceneStateId,
                shader as PixelateShaderState,
                sceneStateId + ".shaders",
              );
              break;
            default:
              shaderInstance = new PixelateShader(
                sceneStateId,
                shader as PixelateShaderState,
                sceneStateId + ".shaders",
              );
          }
          shaderInstance.bind();
          shaders.push(shaderInstance);
          DataStore.getInstance().touch(
            "instances." + sceneStateId + ".shaders",
          );
        }
      }

      for (let i = shaders.length - 1; i >= 0; i--) {
        const shaderInstance = shaders[i]!;
        const existsInSceneState = sceneState.shaders.some(
          (ls: LayerState) => ls.id === shaderInstance.id,
        );
        if (!existsInSceneState) {
          shaderInstance.unbind();
          shaders.splice(shaders.indexOf(shaderInstance), 1);
          DataStore.getInstance().touch(
            "instances." + sceneStateId + ".shaders",
          );
        }
      }

      application.stage.filters = shaders.map((s) => s.shader);
    },
  );
};
