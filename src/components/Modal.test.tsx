import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { userEvent } from "vitest/browser";
import { Modal, ModalClose, ModalContent, type ModalContentProps, ModalTrigger } from "./Modal.tsx";

const renderModal = (props: ModalContentProps = {}) =>
  render(
    <Modal>
      <ModalTrigger>Open</ModalTrigger>
      <ModalContent className="w-64 p-4" {...props}>
        <p>Content</p>
        <ModalClose>Close</ModalClose>
      </ModalContent>
    </Modal>
  );

const trigger = () => screen.getByRole("button", { name: "Open" });
const dialog = () => document.querySelector("dialog")!;

describe("Modal", () => {
  it("opens as a modal dialog, blocks the scroll and closes with ModalClose", async () => {
    renderModal();
    expect(dialog().open).toBe(false);

    await userEvent.click(trigger());
    expect(dialog().open).toBe(true);
    expect(dialog().matches(":modal")).toBe(true);
    expect(dialog().dataset.state).toBe("open");
    expect(document.body.style.overflow).toBe("hidden");

    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(dialog().open).toBe(false);
    expect(document.body.style.overflow).toBe("");
  });

  it("closes with Escape and gives the focus back to the trigger", async () => {
    renderModal();

    await userEvent.click(trigger());
    await userEvent.keyboard("{Escape}");

    expect(dialog().open).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it("closes on backdrop clicks but not on clicks inside", async () => {
    renderModal();
    await userEvent.click(trigger());

    const box = dialog().getBoundingClientRect();
    fireEvent.click(dialog(), { clientX: box.left + 2, clientY: box.top + 2 });
    expect(dialog().open).toBe(true);

    fireEvent.click(dialog(), { clientX: box.left - 10, clientY: box.top - 10 });
    expect(dialog().open).toBe(false);
  });

  it("ignores backdrop clicks when closeOnBackdropClick is false", async () => {
    renderModal({ closeOnBackdropClick: false });
    await userEvent.click(trigger());

    const box = dialog().getBoundingClientRect();
    fireEvent.click(dialog(), { clientX: box.left - 10, clientY: box.top - 10 });
    expect(dialog().open).toBe(true);
  });

  it("shows a drawer on the side of the screen", async () => {
    renderModal({ position: "right" });
    await userEvent.click(trigger());

    const box = dialog().getBoundingClientRect();
    expect(Math.round(box.right)).toBe(window.innerWidth);
    expect(Math.round(box.height)).toBe(window.innerHeight);
  });
});
