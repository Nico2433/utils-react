"use client";

import { type ComponentProps, createContext, type MouseEvent, type ReactNode, useEffect, useId, useMemo, useRef } from "react";
import { useControllableState } from "../hooks/useControllableState.ts";
import { useGetContext } from "../hooks/useGetContext.ts";
import { useScrollLock } from "../hooks/useScrollLock.ts";
import { cx } from "../lib/cn.ts";
import { mergeRefs } from "../lib/mergeRefs.ts";

// *-------------------- CONTEXT --------------------* //

export interface ModalState {
  open: boolean;
  setOpen: (open: boolean) => void;
}

interface ModalContextValue extends ModalState {
  contentId: string;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);
ModalContext.displayName = "Modal";

/** Reads the state of the closest `Modal`, to open or close it from custom components. */
export const useModal = (): ModalState => {
  const { open, setOpen } = useGetContext(ModalContext);
  return { open, setOpen };
};

// *-------------------- ROOT --------------------* //

export interface ModalProps {
  /** Controlled open state. Leave it undefined to let the modal manage it. */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

/** Holds the state of a modal. Renders no element, only its children. */
export const Modal = ({ open: openProp, defaultOpen = false, onOpenChange, children }: ModalProps) => {
  const [open, setOpen] = useControllableState({
    value: openProp,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const contentId = useId();

  const context = useMemo(() => ({ open, setOpen, contentId }), [open, setOpen, contentId]);

  return <ModalContext value={context}>{children}</ModalContext>;
};

// *-------------------- TRIGGER --------------------* //

export type ModalTriggerProps = ComponentProps<"button">;

export const ModalTrigger = ({ onClick, ...rest }: ModalTriggerProps) => {
  const { open, setOpen, contentId } = useGetContext(ModalContext);

  return (
    <button
      type="button"
      aria-haspopup="dialog"
      aria-expanded={open}
      aria-controls={contentId}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) setOpen(true);
      }}
      {...rest}
    />
  );
};

// *-------------------- CONTENT --------------------* //

export type ModalPosition = "center" | "top" | "right" | "bottom" | "left";

const positions: Record<ModalPosition, string> = {
  center: "m-auto max-h-[85dvh] max-w-[calc(100vw-2rem)]",
  top: "mx-0 mt-0 mb-auto w-dvw max-w-none max-h-[85dvh]",
  right: "my-0 mr-0 ml-auto h-dvh max-h-none max-w-[85vw]",
  bottom: "mx-0 mb-0 mt-auto w-dvw max-w-none max-h-[85dvh]",
  left: "my-0 ml-0 mr-auto h-dvh max-h-none max-w-[85vw]",
};

export interface ModalContentProps extends ComponentProps<"dialog"> {
  /** `center` for a dialog, or a side to show it as a drawer. Defaults to `center`. */
  position?: ModalPosition;
  /** Closes when the user clicks the backdrop. Defaults to `true`. */
  closeOnBackdropClick?: boolean;
}

/**
 * Native modal `<dialog>`: traps the focus, makes the page inert, closes with Escape
 * and gives the focus back to where it was. The page scroll is blocked while open.
 * It stays mounted while closed, so `data-state` and `open:` / `starting:` classes can animate it.
 */
export const ModalContent = ({
  position = "center",
  closeOnBackdropClick = true,
  className,
  ref,
  onCancel,
  onClick,
  ...rest
}: ModalContentProps) => {
  const { open, setOpen, contentId } = useGetContext(ModalContext);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const mergedRef = useMemo(() => mergeRefs(dialogRef, ref), [ref]);

  useScrollLock(open);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog?.showModal) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const onBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || !closeOnBackdropClick || event.target !== event.currentTarget) return;

    // Clicks on the dialog's own padding also target it, so only clicks outside its box close it
    const box = event.currentTarget.getBoundingClientRect();
    const inside =
      event.clientX >= box.left &&
      event.clientX <= box.right &&
      event.clientY >= box.top &&
      event.clientY <= box.bottom;

    if (!inside) setOpen(false);
  };

  return (
    <dialog
      ref={mergedRef}
      id={contentId}
      data-state={open ? "open" : "closed"}
      // The state decides when to close, so Escape goes through it instead of closing the dialog directly
      onCancel={(event) => {
        onCancel?.(event);
        event.preventDefault();
        setOpen(false);
      }}
      // Covers closes the cancel event can't stop, like a second Escape press
      onClose={() => {
        if (open) setOpen(false);
      }}
      onClick={onBackdropClick}
      className={cx(
        "overscroll-contain border-0 bg-white p-0 text-inherit shadow-xl backdrop:bg-black/50",
        positions[position],
        className
      )}
      {...rest}
    />
  );
};

// *-------------------- CLOSE --------------------* //

export type ModalCloseProps = ComponentProps<"button">;

/** Button that closes the modal, to use inside its content. */
export const ModalClose = ({ onClick, ...rest }: ModalCloseProps) => {
  const { setOpen } = useGetContext(ModalContext);

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
