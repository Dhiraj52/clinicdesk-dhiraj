import { useEffect, useReducer } from 'react';

/**
 * Keeps reducer state in localStorage.
 * The reducer remains responsible for application updates; this hook only
 * handles reading saved data once and writing updates after each render.
 */
export function usePersistentReducer(reducer, createInitialState, storageKey) {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => createInitialState(storageKey),
  );

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  return [state, dispatch];
}
