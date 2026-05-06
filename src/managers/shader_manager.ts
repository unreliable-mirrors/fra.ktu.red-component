import type { Application } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { EventDispatcher } from "../ktu/ui/core/event_dispatcher.js";
import type { LayerState } from "../layers/ilayer.js";
import {
  PixelateShader,
  type PixelateShaderState,
} from "../layers/shaders/pixelate/pixelate_shader.js";
import type {
  ShaderLayer,
  ShaderLayerState,
} from "../layers/shaders/shader_layer.js";
import type { SceneState } from "../types/red_scene_state.js";
import { BnwShader } from "../layers/shaders/bnw/bnw_shader.js";
import {
  AnaglyphShader,
  MontecarloShader,
  VLinesShader,
  type AnaglyphShaderState,
  type MontecarloShaderState,
  type VLinesShaderState,
} from "../index.js";
import {
  HLinesShader,
  type HLinesShaderState,
} from "../layers/shaders/hlines/hlines_shader.js";

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
      let shaders = DataStore.getInstance().getStore(
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
            case "bnw":
              shaderInstance = new BnwShader(
                sceneStateId,
                shader as ShaderLayerState,
                sceneStateId + ".shaders",
              );
              break;
            case "montecarlo":
              shaderInstance = new MontecarloShader(
                sceneStateId,
                shader as MontecarloShaderState,
                sceneStateId + ".shaders",
              );
              break;
            case "anaglyph":
              shaderInstance = new AnaglyphShader(
                sceneStateId,
                shader as AnaglyphShaderState,
                sceneStateId + ".shaders",
              );
              break;
            case "vlines":
              shaderInstance = new VLinesShader(
                sceneStateId,
                shader as VLinesShaderState,
                sceneStateId + ".shaders",
              );
              break;
            case "hlines":
              shaderInstance = new HLinesShader(
                sceneStateId,
                shader as HLinesShaderState,
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

      shaders = sceneState.shaders.map((shaderState) => {
        return shaders.find((l) => l.id === shaderState.id);
      }) as ShaderLayer[];

      DataStore.getInstance().setStore(
        "instances." + sceneStateId + ".shaders",
        shaders,
      );

      application.stage.filters = shaders.map((s) => s.shader);
    },
  );
};
