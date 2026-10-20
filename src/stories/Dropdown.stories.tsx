import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Dropdown,
  DropdownClose,
  DropdownContent,
  type DropdownContentProps,
  type DropdownProps,
  DropdownTrigger,
} from "../components/Dropdown.tsx";

const meta: Meta<typeof Dropdown> = {
  title: "Dropdown",
  component: Dropdown,
  parameters: {
    // `open` makes the dropdown controlled, so the trigger would stop working from the story
    controls: { exclude: ["open", "onOpenChange"] },
  },
  args: { defaultOpen: false, closeOnOutsideClick: true },
};

export default meta;

type Story = StoryObj<DropdownProps & Pick<DropdownContentProps, "position">>;

const button = "rounded bg-ui-accent px-3 py-1 text-white hover:opacity-90";
const panel = "m-1 w-48 rounded bg-white p-2 shadow";

export const Positions: Story = {
  argTypes: {
    position: { control: "inline-radio", options: ["top", "right", "bottom", "left"] },
  },
  args: { position: "bottom" },
  // `defaultOpen` is only read on mount, so the key remounts the dropdown when it changes
  render: ({ position, ...args }) => (
    <Dropdown key={String(args.defaultOpen)} {...args}>
      <DropdownTrigger className={button}>Open</DropdownTrigger>
      <DropdownContent position={position} className={panel}>
        <p>Dropdown content</p>
        <DropdownClose className="mt-2 text-sm underline">Close</DropdownClose>
      </DropdownContent>
    </Dropdown>
  ),
};

export const InsideOverflowHidden: Story = {
  render: (args) => (
    <div className="h-16 w-64 overflow-hidden rounded border border-dashed border-ui-border p-2">
      <p className="mb-1 text-sm text-ui-muted">overflow: hidden</p>
      <Dropdown key={String(args.defaultOpen)} {...args}>
        <DropdownTrigger className={button}>Open</DropdownTrigger>
        <DropdownContent className={panel}>
          <p>Not clipped by the parent</p>
        </DropdownContent>
      </Dropdown>
    </div>
  ),
};

export const Animated: Story = {
  render: (args) => (
    <Dropdown key={String(args.defaultOpen)} {...args}>
      <DropdownTrigger className={button}>Open</DropdownTrigger>
      <DropdownContent
        className={`${panel} opacity-0 transition-[opacity,translate,display,overlay] transition-discrete duration-200 motion-reduce:transition-none open:translate-y-0 open:opacity-100 starting:open:-translate-y-1 starting:open:opacity-0 -translate-y-1`}
      >
        <p>Fades in and out</p>
      </DropdownContent>
    </Dropdown>
  ),
};
