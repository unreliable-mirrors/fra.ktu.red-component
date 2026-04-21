import type { Application } from "pixi.js";
import { DataStore } from "../ktu/ui/core/data_store.js";
import { EventDispatcher } from "../ktu/ui/core/event_dispatcher.js";
import {
  BackgroundLayer,
  type BackgroundLayerState,
} from "../layers/display/background_layer.js";
import type { DisplayLayer } from "../layers/display/display_layer.js";
import type { LayerState } from "../layers/ilayer.js";
import {
  VideoLayer,
  type VideoLayerState,
} from "../layers/display/video_layer.js";

let lastElapsedTime: number = 0;

export const subscribeToLayerUpdates = (sceneStateId: string) => {
  DataStore.getInstance().setStore("instances." + sceneStateId + ".layers", []);
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;
  application.ticker.add((time) => {
    let loop = false;
    if (lastElapsedTime > DataStore.getInstance().getStore("elapsedTime")) {
      loop = true;
    }
    lastElapsedTime = DataStore.getInstance().getStore("elapsedTime");
    const layers = DataStore.getInstance().getStore(
      "instances." + sceneStateId + ".layers",
    );
    for (const layer of layers) {
      layer.tick(time, loop);
    }
  });

  EventDispatcher.getInstance().addEventListener(
    sceneStateId + ".layers",
    "update",
    () => {
      const sceneState = DataStore.getInstance().getStore(sceneStateId);

      const layers = DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".layers",
      ) as DisplayLayer[];
      //CREATE LAYERS IF THEY DONT EXIST, DESTROY LAYERS THAT DONT EXIST IN SCENESTATE
      for (const layerState of sceneState.layers) {
        let layer = layers.find((l) => l.id === layerState.id);
        if (!layer) {
          switch (layerState.type) {
            case "background":
              layer = new BackgroundLayer(
                sceneStateId,
                layerState as BackgroundLayerState,
                sceneStateId + ".layers",
              );
              break;
            case "video":
              layer = new VideoLayer(
                sceneStateId,
                layerState as VideoLayerState,
                sceneStateId + ".layers",
              );
              break;
            default:
              layer = new BackgroundLayer(
                sceneStateId,
                BackgroundLayer.getDefaultState(sceneStateId),
                sceneStateId + ".layers",
              );
          }
          layer.bind();
          layers.push(layer);
          DataStore.getInstance().touch(
            "instances." + sceneStateId + ".layers",
          );
        }
      }

      for (let i = layers.length - 1; i >= 0; i--) {
        const layer = layers[i]!;
        const existsInSceneState = sceneState.layers.some(
          (ls: LayerState) => ls.id === layer.id,
        );
        if (!existsInSceneState) {
          layer.unbind();
          layers.splice(layers.indexOf(layer), 1);
          DataStore.getInstance().touch(
            "instances." + sceneStateId + ".layers",
          );
        }
      }

      //REPOSITION LAYERS IN ARRAY TO MATCH ORDER IN SCENESTATE, ALSO REPOSITION IN PIXI STAGE
      for (let i = 0; i < sceneState.layers.length; i++) {
        const layerState = sceneState.layers[i];
        const layer = layers.find((l) => l.id === layerState.id);
        if (layer) {
          application.stage.setChildIndex(layer.mainSprite, i);
        }
      }
    },
  );
};
