import { md5 } from "js-md5";
import { DataStore } from "../ktu/ui/core/data_store.js";

export const ASSETS_CLIENTS: Record<string, number[]> = {};
const VIDEO_EXT_REGEX = /\.(mp4|webm|ogv|mov|m4v)(\?.*)?(#.*)?$/i;

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

export const isVideoAsset = (content: string): boolean => {
  return content.startsWith("data:video/") || VIDEO_EXT_REGEX.test(content);
};

export const getVideoAssetInstanceSrc = (
  content: string,
  instanceKey: string,
): string => {
  const cacheTag = encodeURIComponent(instanceKey);

  if (content.startsWith("data:")) {
    return `${content}#red-video-instance=${cacheTag}`;
  }

  try {
    const base =
      typeof window !== "undefined" ? window.location.href : "http://localhost";
    const url = new URL(content, base);
    url.searchParams.set("redVideoInstance", instanceKey);
    if (url.origin === "http://localhost" && !content.startsWith("http")) {
      return `${url.pathname}${url.search}${url.hash}`;
    }
    return url.toString();
  } catch {
    const hashIndex = content.indexOf("#");
    const hash = hashIndex >= 0 ? content.slice(hashIndex) : "";
    const path = hashIndex >= 0 ? content.slice(0, hashIndex) : content;
    const separator = path.includes("?") ? "&" : "?";
    return `${path}${separator}redVideoInstance=${cacheTag}${hash}`;
  }
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
