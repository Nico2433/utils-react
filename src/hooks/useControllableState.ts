import { useCallback, useState } from "react";

export interface UseControllableStateOptions<T> {
  /** Controlled value. Leave it undefined to let the hook manage the state. */
  value?: T;
  /** Initial value while uncontrolled. */
  defaultValue: T;
  /** Called on every change, controlled or not. */
  onChange?: (value: T) => void;
}

/** State that can be controlled from props (`value` + `onChange`) or managed internally (`defaultValue`). */
export const useControllableState = <T>({
  value,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const controlled = value !== undefined;

  const setValue = useCallback(
    (next: T) => {
      if (!controlled) setInternalValue(next);
      onChange?.(next);
    },
    [controlled, onChange]
  );

  return [controlled ? value : internalValue, setValue] as const;
};
