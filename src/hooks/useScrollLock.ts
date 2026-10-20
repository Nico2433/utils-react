import { useEffect } from "react";

/** Blocks page scroll while `locked` is true and restores the previous overflow afterwards. */
export const useScrollLock = (locked = true): void => {
  useEffect(() => {
    if (!locked) return;

    const { style } = document.body;
    const previous = style.overflow;
    style.overflow = "hidden";

    return () => {
      style.overflow = previous;
    };
  }, [locked]);
};
