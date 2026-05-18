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
import {
  CameraLayer,
  type CameraLayerState,
} from "../layers/display/camera_layer.js";

let lastElapsedTime: number = 0;
const pointerHandlersAttached = new Set<string>();
const activePressedLayerByScene = new Map<string, number>();

const getLayerById = (
  sceneStateId: string,
  layerId: number,
): DisplayLayer | undefined => {
  const layers = DataStore.getInstance().getStore(
    "instances." + sceneStateId + ".layers",
  ) as DisplayLayer[];
  return layers.find((layer) => layer.id === layerId);
};

const getTopLayerAtPoint = (
  sceneStateId: string,
  x: number,
  y: number,
): DisplayLayer | undefined => {
  const layers = DataStore.getInstance().getStore(
    "instances." + sceneStateId + ".layers",
  ) as DisplayLayer[];
  for (let i = layers.length - 1; i >= 0; i--) {
    const layer = layers[i];
    if (!layer || !layer.mainSprite || layer.mainSprite.destroyed) {
      continue;
    }
    if (!layer.mainSprite.visible) {
      continue;
    }
    const bounds = layer.mainSprite.getBounds() as any;
    if (
      x >= bounds.minX &&
      x <= bounds.maxX &&
      y >= bounds.minY &&
      y <= bounds.maxY
    ) {
      return layer;
    }
  }
  return undefined;
};

const dispatchLayerMouseMove = (
  sceneStateId: string,
  layer: DisplayLayer,
  x: number,
  y: number,
) => {
  EventDispatcher.getInstance().dispatchEvent(sceneStateId, "mouseMove", {
    state: layer._state,
    layerId: layer.id,
    x,
    y,
  });
};

const setMousePosition = (sceneStateId: string, x: number, y: number) => {
  DataStore.getInstance().setStore("instances." + sceneStateId + ".mouseX", x);
  DataStore.getInstance().setStore("instances." + sceneStateId + ".mouseY", y);
};

const bindCanvasPointerHandlers = (
  sceneStateId: string,
  application: Application,
) => {
  if (pointerHandlersAttached.has(sceneStateId)) {
    return;
  }

  application.stage.eventMode = "static";
  application.stage.hitArea = application.screen;

  application.stage.on("pointerdown", (event: any) => {
    const x = event?.global?.x;
    const y = event?.global?.y;
    if (x === undefined || y === undefined) {
      return;
    }

    setMousePosition(sceneStateId, x, y);

    const layer = getTopLayerAtPoint(sceneStateId, x, y);
    if (!layer) {
      activePressedLayerByScene.delete(sceneStateId);
      return;
    }

    activePressedLayerByScene.set(sceneStateId, layer.id);

    EventDispatcher.getInstance().dispatchEvent(sceneStateId, "layerClick", {
      state: layer._state,
      layerId: layer.id,
      x,
      y,
    });
  });

  application.stage.on("pointerup", (event: any) => {
    const x = event?.global?.x;
    const y = event?.global?.y;
    if (x === undefined || y === undefined) {
      return;
    }

    setMousePosition(sceneStateId, x, y);

    const pressedLayerId = activePressedLayerByScene.get(sceneStateId);
    const layer =
      (pressedLayerId !== undefined
        ? getLayerById(sceneStateId, pressedLayerId)
        : undefined) || getTopLayerAtPoint(sceneStateId, x, y);
    activePressedLayerByScene.delete(sceneStateId);
    if (!layer) {
      return;
    }

    EventDispatcher.getInstance().dispatchEvent(
      sceneStateId,
      "layerClickRelease",
      {
        state: layer._state,
        layerId: layer.id,
        x,
        y,
      },
    );
  });

  application.stage.on("pointermove", (event: any) => {
    const x = event?.global?.x;
    const y = event?.global?.y;
    if (x === undefined || y === undefined) {
      return;
    }

    setMousePosition(sceneStateId, x, y);

    const pressedLayerId = activePressedLayerByScene.get(sceneStateId);
    const layer =
      (pressedLayerId !== undefined
        ? getLayerById(sceneStateId, pressedLayerId)
        : undefined) || getTopLayerAtPoint(sceneStateId, x, y);
    if (!layer) {
      return;
    }

    dispatchLayerMouseMove(sceneStateId, layer, x, y);
  });

  if (typeof window !== "undefined") {
    window.addEventListener("pointerup", (event: PointerEvent) => {
      const pressedLayerId = activePressedLayerByScene.get(sceneStateId);
      if (pressedLayerId === undefined) {
        return;
      }

      activePressedLayerByScene.delete(sceneStateId);
      const layer = getLayerById(sceneStateId, pressedLayerId);
      if (!layer) {
        return;
      }

      const rect = application.canvas.getBoundingClientRect();
      const x =
        ((event.clientX - rect.left) / Math.max(rect.width, 1)) *
        application.screen.width;
      const y =
        ((event.clientY - rect.top) / Math.max(rect.height, 1)) *
        application.screen.height;

      setMousePosition(sceneStateId, x, y);

      EventDispatcher.getInstance().dispatchEvent(
        sceneStateId,
        "layerClickRelease",
        {
          state: layer._state,
          layerId: layer.id,
          x,
          y,
        },
      );
    });

    window.addEventListener("pointermove", (event: PointerEvent) => {
      const pressedLayerId = activePressedLayerByScene.get(sceneStateId);
      if (pressedLayerId === undefined) {
        return;
      }

      const rect = application.canvas.getBoundingClientRect();
      const isOutsideCanvas =
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom;
      if (!isOutsideCanvas) {
        return;
      }

      const layer = getLayerById(sceneStateId, pressedLayerId);
      if (!layer) {
        return;
      }

      const x =
        ((event.clientX - rect.left) / Math.max(rect.width, 1)) *
        application.screen.width;
      const y =
        ((event.clientY - rect.top) / Math.max(rect.height, 1)) *
        application.screen.height;

      setMousePosition(sceneStateId, x, y);

      dispatchLayerMouseMove(sceneStateId, layer, x, y);
    });
  }

  pointerHandlersAttached.add(sceneStateId);
};

export const subscribeToLayerUpdates = (sceneStateId: string) => {
  DataStore.getInstance().setStore("instances." + sceneStateId + ".layers", []);
  DataStore.getInstance().setStore("instances." + sceneStateId + ".mouseX", 0);
  DataStore.getInstance().setStore("instances." + sceneStateId + ".mouseY", 0);
  const application = DataStore.getInstance().getStore(
    "application",
  ) as Application;
  bindCanvasPointerHandlers(sceneStateId, application);
  application.ticker.add((time) => {
    let loop = false;
    if (
      lastElapsedTime >
      DataStore.getInstance().getStore(
        "instances." + sceneStateId + ".elapsedTime",
      )
    ) {
      loop = true;
    }
    lastElapsedTime = DataStore.getInstance().getStore(
      "instances." + sceneStateId + ".elapsedTime",
    );
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
            case "camera":
              layer = new CameraLayer(
                sceneStateId,
                layerState as CameraLayerState,
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
