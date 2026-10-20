import { useCallback, useSyncExternalStore } from "react";

/**
 * Tracks a CSS media query: `useMediaQuery("(min-width: 768px)")`.
 * Returns `serverValue` while rendering on the server and during hydration.
 */
export const useMediaQuery = (query: string, serverValue = false): boolean => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue
  );
};
