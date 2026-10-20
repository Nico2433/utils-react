import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import {
  Dropdown,
  DropdownClose,
  DropdownContent,
  type DropdownPosition,
  type DropdownProps,
  DropdownTrigger,
} from "./Dropdown.tsx";

const renderDropdown = (props: DropdownProps = {}, position: DropdownPosition = "bottom") =>
  render(
    <>
      <Dropdown {...props}>
        <DropdownTrigger>Open</DropdownTrigger>
        <DropdownContent position={position}>
          <p>Content</p>
          <DropdownClose>Close</DropdownClose>
        </DropdownContent>
      </Dropdown>
      <button style={{ marginTop: 300 }}>Outside</button>
    </>
  );

const trigger = () => screen.getByRole("button", { name: "Open" });
const content = () => document.querySelector<HTMLElement>("[popover]")!;
const isOpen = () => content().matches(":popover-open");

describe("Dropdown", () => {
  it("toggles the popover from the trigger and updates aria-expanded and data-state", async () => {
    renderDropdown();

    expect(isOpen()).toBe(false);
    expect(trigger().getAttribute("aria-expanded")).toBe("false");
    expect(content().dataset.state).toBe("closed");

    await userEvent.click(trigger());
    expect(isOpen()).toBe(true);
    expect(trigger().getAttribute("aria-expanded")).toBe("true");
    expect(content().dataset.state).toBe("open");

    await userEvent.click(trigger());
    expect(isOpen()).toBe(false);
  });

  it("keeps the trigger's own onClick and can be stopped with preventDefault", async () => {
    const onClick = vi.fn((event: { preventDefault: () => void }) => event.preventDefault());
    render(
      <Dropdown>
        <DropdownTrigger onClick={onClick}>Open</DropdownTrigger>
        <DropdownContent>Content</DropdownContent>
      </Dropdown>
    );

    await userEvent.click(trigger());
    expect(onClick).toHaveBeenCalledOnce();
    expect(isOpen()).toBe(false);
  });

  it("closes on outside click and with DropdownClose", async () => {
    renderDropdown({ defaultOpen: true });
    expect(isOpen()).toBe(true);

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(isOpen()).toBe(false);

    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(isOpen()).toBe(false);
  });

  it("stays open on outside click when closeOnOutsideClick is false", async () => {
    renderDropdown({ defaultOpen: true, closeOnOutsideClick: false });

    await userEvent.click(screen.getByRole("button", { name: "Outside" }));
    expect(isOpen()).toBe(true);
  });

  it("closes with Escape and gives the focus back to the trigger", async () => {
    renderDropdown();

    await userEvent.click(trigger());
    screen.getByRole("button", { name: "Close" }).focus();
    await userEvent.keyboard("{Escape}");

    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(trigger());
  });

  it("does not take the focus on Escape when it is elsewhere", async () => {
    renderDropdown({ defaultOpen: true });
    const outside = screen.getByRole("button", { name: "Outside" });

    outside.focus();
    await userEvent.keyboard("{Escape}");

    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(outside);
  });

  it("only reports changes when controlled", async () => {
    const onOpenChange = vi.fn();
    renderDropdown({ open: false, onOpenChange });

    await userEvent.click(trigger());
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(isOpen()).toBe(false);
  });

  it.each([
    ["bottom", (box: DOMRect, anchor: DOMRect) => box.top >= anchor.bottom - 1],
    ["top", (box: DOMRect, anchor: DOMRect) => box.bottom <= anchor.top + 1],
    ["right", (box: DOMRect, anchor: DOMRect) => box.left >= anchor.right - 1],
    ["left", (box: DOMRect, anchor: DOMRect) => box.right <= anchor.left + 1],
  ] as const)("anchors the content to the %s of the trigger", (position, isPlaced) => {
    render(
      <div style={{ padding: 200 }}>
        <Dropdown defaultOpen>
          <DropdownTrigger>Open</DropdownTrigger>
          <DropdownContent position={position}>Content</DropdownContent>
        </Dropdown>
      </div>
    );

    expect(isPlaced(content().getBoundingClientRect(), trigger().getBoundingClientRect())).toBe(true);
  });

  it("is not clipped by a parent with overflow hidden", () => {
    render(
      <div style={{ overflow: "hidden", height: 40, padding: 8 }}>
        <Dropdown defaultOpen>
          <DropdownTrigger>Open</DropdownTrigger>
          <DropdownContent>
            <p style={{ height: 100, margin: 0 }}>Content</p>
          </DropdownContent>
        </Dropdown>
      </div>
    );

    const box = content().getBoundingClientRect();
    const topElement = document.elementFromPoint(box.left + 5, box.bottom - 5);
    expect(content().contains(topElement)).toBe(true);
  });
});
