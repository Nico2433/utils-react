import { type RefObject, useEffect, useEffectEvent } from "react";

/** Calls `handler` when the user presses outside the element. Pass `enabled: false` to pause it. */
export const useClickOutside = (
  ref: RefObject<Element | null>,
  handler: (event: PointerEvent) => void,
  enabled = true
): void => {
  const onPointerDown = useEffectEvent((event: PointerEvent) => {
    const element = ref.current;
    if (element && !element.contains(event.target as Node)) handler(event);
  });

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener("pointerdown", onPointerDown);

    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [enabled]);
};
