import { DataStore } from "../ktu/ui/core/data_store.js";

export const getCount = (sceneStateId: string) => {
  let counter = DataStore.getInstance().getStore(sceneStateId + ".counter");
  if (counter === undefined) {
    counter = 0;
  }
  counter++;
  DataStore.getInstance().setStore(sceneStateId + ".counter", counter);
  return counter;
};
