"use client";

import {
  type ComponentProps,
  createContext,
  type CSSProperties,
  type RefObject,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
} from "react";
import { useClickOutside } from "../hooks/useClickOutside.ts";
import { useControllableState } from "../hooks/useControllableState.ts";
import { useGetContext } from "../hooks/useGetContext.ts";
import { cx } from "../lib/cn.ts";
import { mergeRefs } from "../lib/mergeRefs.ts";

// *-------------------- CONTEXT --------------------* //

export interface DropdownState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

interface DropdownContextValue extends DropdownState {
  contentId: string;
  anchorName: string;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | undefined>(undefined);
DropdownContext.displayName = "Dropdown";

/** Reads the state of the closest `Dropdown`, to open or close it from custom components. */
export const useDropdown = (): DropdownState => {
  const { open, setOpen, toggle } = useGetContext(DropdownContext);
  return { open, setOpen, toggle };
};

// *-------------------- ROOT --------------------* //

export interface DropdownProps extends ComponentProps<"div"> {
  /** Controlled open state. Leave it undefined to let the dropdown manage it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Closes when the user presses outside the dropdown. Defaults to `true`. */
  closeOnOutsideClick?: boolean;
}

export const Dropdown = ({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  closeOnOutsideClick = true,
  className,
  ref,
  children,
  ...rest
}: DropdownProps) => {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentId = useId();

  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);

  useClickOutside(rootRef, () => setOpen(false), open && closeOnOutsideClick);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // Only takes the focus back when it was inside, so it never steals it from elsewhere
      if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, setOpen]);

  const mergedRef = useMemo(() => mergeRefs(rootRef, ref), [ref]);

  const context = useMemo(
    () => ({
      open,
      setOpen,
      toggle,
      contentId,
      // Anchor names are CSS identifiers, so the characters React puts in ids are left out
      anchorName: `--dropdown-${contentId.replace(/[^\w-]/g, "")}`,
      triggerRef,
    }),
    [open, setOpen, toggle, contentId]
  );

  return (
    <DropdownContext value={context}>
      <div ref={mergedRef} className={cx("relative inline-block", className)} {...rest}>
        {children}
      </div>
    </DropdownContext>
  );
};

// *-------------------- TRIGGER --------------------* //

export type DropdownTriggerProps = ComponentProps<"button">;

export const DropdownTrigger = ({ onClick, ref, style, ...rest }: DropdownTriggerProps) => {
  const { open, toggle, contentId, anchorName, triggerRef } = useGetContext(DropdownContext);
  const mergedRef = useMemo(() => mergeRefs(triggerRef, ref), [triggerRef, ref]);

  return (
    <button
      ref={mergedRef}
      type="button"
      aria-expanded={open}
      aria-controls={contentId}
      style={{ anchorName, ...style }}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) toggle();
      }}
      {...rest}
    />
  );
};

// *-------------------- CONTENT --------------------* //

export type DropdownPosition = "top" | "right" | "bottom" | "left";

// Starts aligned with the trigger and flips to the other side when it doesn't fit
const placements: Record<DropdownPosition, CSSProperties> = {
  top: { positionArea: "top span-right", positionTryFallbacks: "flip-block" },
  right: { positionArea: "right span-bottom", positionTryFallbacks: "flip-inline" },
  bottom: { positionArea: "bottom span-right", positionTryFallbacks: "flip-block" },
  left: { positionArea: "left span-bottom", positionTryFallbacks: "flip-inline" },
};

export interface DropdownContentProps extends ComponentProps<"div"> {
  /** Side where the content opens. Use `"none"` to position it yourself. */
  position?: DropdownPosition | "none";
}

/**
 * Shown as a popover, above everything else and never clipped by its parents.
 * It stays mounted while closed, so `data-state="open" | "closed"` and `open:` / `starting:` classes can animate it.
 */
export const DropdownContent = ({
  position = "bottom",
  className,
  style,
  ref,
  ...rest
}: DropdownContentProps) => {
  const { open, contentId, anchorName } = useGetContext(DropdownContext);
  const contentRef = useRef<HTMLDivElement>(null);
  const mergedRef = useMemo(() => mergeRefs(contentRef, ref), [ref]);

  useEffect(() => {
    const content = contentRef.current;
    if (!content?.showPopover) return;

    const shown = content.matches(":popover-open");
    if (open && !shown) content.showPopover();
    if (!open && shown) content.hidePopover();
  }, [open]);

  const anchored = position !== "none";

  return (
    <div
      ref={mergedRef}
      id={contentId}
      popover="manual"
      data-state={open ? "open" : "closed"}
      className={cx(
        "overflow-visible border-0 bg-transparent p-0 text-inherit",
        anchored && "inset-auto m-0",
        className
      )}
      style={anchored ? { positionAnchor: anchorName, ...placements[position], ...style } : style}
      {...rest}
    />
  );
};

// *-------------------- CLOSE --------------------* //

export type DropdownCloseProps = ComponentProps<"button">;

/** Button that closes the dropdown, to use inside its content. */
export const DropdownClose = ({ onClick, ...rest }: DropdownCloseProps) => {
  const { setOpen } = useGetContext(DropdownContext);

  return (
    <button
      type="button"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(false);
      }}
      {...rest}
    />
  );
};
