import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

const isDev = import.meta.env.DEV;

export const createStore = (name, storeCreator, options = {}) => {
  const {
    persist: shouldPersist = false,
    persistOptions = {},
    enableDevtools = isDev,
    enableImmer = true,
    enableSubscribeWithSelector = true
  } = options;

  let middleware = storeCreator;

  if (enableImmer) {
    middleware = immer(middleware);
  }

  if (enableSubscribeWithSelector) {
    middleware = subscribeWithSelector(middleware);
  }

  if (shouldPersist) {
    middleware = persist(middleware, {
      name: `erp-${name}`,
      ...persistOptions
    });
  }

  if (enableDevtools) {
    middleware = devtools(middleware, {
      name: `ERP/${name}`,
      enabled: isDev
    });
  }

  return middleware;
};

export const createPersistConfig = (name, options = {}) => ({
  name: `erp-${name}`,
  version: 1,
  ...options
});

export const createSelectors = (store) => {
  const selectors = {};

  Object.keys(store.getState()).forEach((key) => {
    selectors[`use${key.charAt(0).toUpperCase() + key.slice(1)}`] = () =>
      store((state) => state[key]);
  });

  return selectors;
};

export const resetAllStores = (stores) => {
  stores.forEach(store => {
    if (store.getState().reset) {
      store.getState().reset();
    }
  });
};
