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

const layers: DisplayLayer[] = [];

export const subscribeToLayerUpdates = (sceneStateId: string) => {
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;
  application.ticker.add((time) => {
    for (const layer of layers) {
      //TODO: IMPLEMENT LOOP DETECTION
      layer.tick(time, false);
    }
  });

  EventDispatcher.getInstance().addEventListener(
    sceneStateId + ".layers",
    "update",
    () => {
      console.log("Received layer update event for sceneStateId", sceneStateId);
      const sceneState = DataStore.getInstance().getStore(sceneStateId);

      //CREATE LAYERS IF THEY DONT EXIST, DESTROY LAYERS THAT DONT EXIST IN SCENESTATE
      for (const layerState of sceneState.layers) {
        let layer = layers.find((l) => l.id === layerState.id);
        if (!layer) {
          if (layerState.type === "background") {
            layer = new BackgroundLayer(
              sceneStateId,
              layerState as BackgroundLayerState,
            );
            layer.bind();
            layers.push(layer);
          } else if (layerState.type === "video") {
            layer = new VideoLayer(sceneStateId, layerState as VideoLayerState);
            layer.bind();
            layers.push(layer);
          }
        }
      }

      for (const layer of layers) {
        const existsInSceneState = sceneState.layers.some(
          (ls: LayerState) => ls.id === layer.id,
        );
        if (!existsInSceneState) {
          layer.unbind();
          layers.splice(layers.indexOf(layer), 1);
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
