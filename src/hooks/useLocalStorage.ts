import { useCallback, useMemo, useSyncExternalStore } from "react";

// `storage` only fires in other tabs, so this one notifies the current tab
const LOCAL_EVENT = "nico2433:local-storage";

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_EVENT, onChange);
  };
};

const parse = <T>(raw: string | null, fallback: T): T => {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

/**
 * State saved in `localStorage` as JSON and synced between components and tabs.
 * Returns `initialValue` on the server, while the key is missing or when it can't be parsed.
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const raw = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(key),
    () => null
  );

  // `initialValue` is left out on purpose, so an inline object doesn't parse on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => parse(raw, initialValue), [raw]);

  const setValue = useCallback(
    (next: T | ((previous: T) => T)) => {
      const previous = parse(localStorage.getItem(key), initialValue);
      const resolved = next instanceof Function ? next(previous) : next;
      localStorage.setItem(key, JSON.stringify(resolved));
      window.dispatchEvent(new Event(LOCAL_EVENT));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );

  const remove = useCallback(() => {
    localStorage.removeItem(key);
    window.dispatchEvent(new Event(LOCAL_EVENT));
  }, [key]);

  return [value, setValue, remove] as const;
};
