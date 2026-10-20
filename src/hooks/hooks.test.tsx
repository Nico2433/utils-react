import { act, render, renderHook, screen } from "@testing-library/react";
import { createContext, type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useControllableState } from "./useControllableState.ts";
import { useDebounce } from "./useDebounce.ts";
import { useGetContext } from "./useGetContext.ts";
import { useIsVisible } from "./useIsVisible.ts";
import { useLocalStorage } from "./useLocalStorage.ts";
import { useMediaQuery } from "./useMediaQuery.ts";
import { useScrollLock } from "./useScrollLock.ts";

describe("useGetContext", () => {
  const NumberContext = createContext<number | undefined>(undefined);
  NumberContext.displayName = "Number";

  it("returns falsy values from the provider", () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NumberContext value={0}>{children}</NumberContext>
    );

    const { result } = renderHook(() => useGetContext(NumberContext), { wrapper });
    expect(result.current).toBe(0);
  });

  it("throws with the context name outside the provider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const Consumer = () => <>{useGetContext(NumberContext)}</>;

    expect(() => render(<Consumer />)).toThrow("Number has to be used within its provider");
    vi.restoreAllMocks();
  });
});

describe("useScrollLock", () => {
  it("restores the previous overflow", () => {
    document.body.style.overflow = "clip";

    const { rerender, unmount } = renderHook(({ locked }) => useScrollLock(locked), {
      initialProps: { locked: true },
    });
    expect(document.body.style.overflow).toBe("hidden");

    rerender({ locked: false });
    expect(document.body.style.overflow).toBe("clip");

    rerender({ locked: true });
    unmount();
    expect(document.body.style.overflow).toBe("clip");
    document.body.style.overflow = "";
  });
});

describe("useControllableState", () => {
  it("manages the state when uncontrolled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));

    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("only reports changes when controlled", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ value: 1, defaultValue: 0, onChange }));

    act(() => result.current[1](2));
    expect(result.current[0]).toBe(1);
    expect(onChange).toHaveBeenCalledWith(2);
  });
});

describe("useDebounce", () => {
  afterEach(() => vi.useRealTimers());

  it("updates the value after it stops changing", () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 200), {
      initialProps: { value: "a" },
    });

    rerender({ value: "ab" });
    act(() => vi.advanceTimersByTime(100));
    rerender({ value: "abc" });
    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("a");

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe("abc");
  });
});

describe("useLocalStorage", () => {
  afterEach(() => localStorage.clear());

  it("saves JSON and syncs every hook with the same key", () => {
    const first = renderHook(() => useLocalStorage("count", 0));
    const second = renderHook(() => useLocalStorage("count", 0));

    act(() => first.result.current[1]((count) => count + 1));

    expect(localStorage.getItem("count")).toBe("1");
    expect(second.result.current[0]).toBe(1);

    act(() => second.result.current[2]());
    expect(first.result.current[0]).toBe(0);
  });

  it("falls back to the initial value when the stored one is not JSON", () => {
    localStorage.setItem("broken", "{");
    const { result } = renderHook(() => useLocalStorage("broken", "fallback"));
    expect(result.current[0]).toBe("fallback");
  });
});

describe("useMediaQuery", () => {
  it("reads the media query", () => {
    expect(renderHook(() => useMediaQuery("(min-width: 1px)")).result.current).toBe(true);
    expect(renderHook(() => useMediaQuery("(max-width: 1px)")).result.current).toBe(false);
  });
});

describe("useIsVisible", () => {
  const Box = ({ top, once }: { top: number; once?: boolean }) => {
    const [ref, visible] = useIsVisible<HTMLDivElement>({ once });
    return (
      <div ref={ref} style={{ position: "absolute", top, height: 10, width: 10 }}>
        {visible ? "visible" : "hidden"}
      </div>
    );
  };

  it("tracks whether the element is inside the viewport", async () => {
    render(<Box top={0} />);
    expect(await screen.findByText("visible")).toBeTruthy();
  });

  it("stays hidden while the element is outside the viewport", async () => {
    render(<Box top={window.innerHeight + 500} />);
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(screen.getByText("hidden")).toBeTruthy();
  });
});
