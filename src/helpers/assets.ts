import { md5 } from "js-md5";
import { DataStore } from "../ktu/ui/core/data_store.js";

export const ASSETS_CLIENTS: Record<string, number[]> = {};

export const getAsset = (
  sceneStateId: string,
  key: string,
  layerId: number,
): string => {
  const assetsMap = DataStore.getInstance().getStore(
    sceneStateId + ".assets",
  ) as Record<string, string>;
  ASSETS_CLIENTS[key] ||= [];
  if (ASSETS_CLIENTS[key].indexOf(layerId) === -1) {
    ASSETS_CLIENTS[key].push(layerId);
  }
  return assetsMap[key]!;
};

export const freeAsset = (
  sceneStateId: string,
  key: string,
  layerId: number,
) => {
  const assetsMap = DataStore.getInstance().getStore(
    sceneStateId + ".assets",
  ) as Record<string, string>;
  const index = ASSETS_CLIENTS[key]!.indexOf(layerId);
  ASSETS_CLIENTS[key]!.splice(index, 1);

  console.log(key, layerId, ASSETS_CLIENTS[key]);
  if (ASSETS_CLIENTS[key]!.length === 0) {
    delete assetsMap[key];
    delete ASSETS_CLIENTS[key];
  }
  DataStore.getInstance().touch(sceneStateId + ".assets");
};

export const cacheAsset = (sceneStateId: string, content: string): string => {
  const assetsMap = DataStore.getInstance().getStore(
    sceneStateId + ".assets",
  ) as Record<string, string>;
  const key = md5(content);
  assetsMap[key] = content;

  DataStore.getInstance().touch(sceneStateId + ".assets");

  return key;
};

export const rebuildAssets = (
  sceneStateId: string,
  map: Record<string, string>,
) => {
  const assetsMap = DataStore.getInstance().getStore(
    sceneStateId + ".assets",
  ) as Record<string, string>;
  for (const key in map) {
    assetsMap[key] = map[key]!;
  }
  DataStore.getInstance().touch(sceneStateId + ".assets");
};
