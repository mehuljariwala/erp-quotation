import { useEffect, useRef, useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const useStoreSubscription = (store, selector, callback, options = {}) => {
  const { fireImmediately = false, equalityFn = Object.is } = options;
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (fireImmediately) {
      callbackRef.current(selector(store.getState()));
    }

    const unsubscribe = store.subscribe(
      (state) => selector(state),
      (selectedState, previousSelectedState) => {
        if (!equalityFn(selectedState, previousSelectedState)) {
          callbackRef.current(selectedState, previousSelectedState);
        }
      }
    );

    return unsubscribe;
  }, [store, selector, fireImmediately, equalityFn]);
};

export const useStoreHydration = (store) => {
  const hasHydrated = store.persist?.hasHydrated?.() ?? true;
  return hasHydrated;
};

export const useStoreActions = (store, actionNames) => {
  return useShallow(() => {
    const state = store.getState();
    const actions = {};
    actionNames.forEach(name => {
      if (typeof state[name] === 'function') {
        actions[name] = state[name];
      }
    });
    return actions;
  });
};

export const useDebouncedStoreUpdate = (store, action, delay = 300) => {
  const timeoutRef = useRef(null);

  const debouncedAction = useCallback((...args) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      store.getState()[action](...args);
    }, delay);
  }, [store, action, delay]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedAction;
};

export const useOptimisticUpdate = (store, action, rollbackAction) => {
  const previousStateRef = useRef(null);

  const optimisticAction = useCallback(async (...args) => {
    previousStateRef.current = store.getState();

    store.getState()[action](...args);

    try {
      return { success: true };
    } catch (error) {
      if (previousStateRef.current && rollbackAction) {
        store.setState(previousStateRef.current);
      }
      return { success: false, error };
    }
  }, [store, action, rollbackAction]);

  return optimisticAction;
};

export const createStoreSelector = (keys) => {
  return (state) => {
    const selected = {};
    keys.forEach(key => {
      selected[key] = state[key];
    });
    return selected;
  };
};

export const combineSelectors = (...selectors) => {
  return (state) => {
    const combined = {};
    selectors.forEach(selector => {
      Object.assign(combined, selector(state));
    });
    return combined;
  };
};

export default useStoreSubscription;
