import { useEffect, useState } from "react";

export interface UseIsVisibleOptions {
  /** Stops observing after the element becomes visible for the first time. */
  once?: boolean;
  rootMargin?: string;
  threshold?: number;
}

/**
 * Tracks whether an element is inside the viewport. Put the returned ref on the element:
 * `const [ref, visible] = useIsVisible<HTMLDivElement>()`. It also works when the element mounts later.
 */
export const useIsVisible = <T extends Element = HTMLElement>({
  once = false,
  rootMargin,
  threshold,
}: UseIsVisibleOptions = {}) => {
  const [element, setElement] = useState<T | null>(null);
  const [visible, setVisible] = useState(false);
  const done = once && visible;

  useEffect(() => {
    if (!element || done) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (once && !entry.isIntersecting) return;
        setVisible(entry.isIntersecting);
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [element, once, done, rootMargin, threshold]);

  return [setElement, visible] as const;
};
