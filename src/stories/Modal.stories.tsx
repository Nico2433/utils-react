import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Modal,
  ModalClose,
  ModalContent,
  type ModalContentProps,
  type ModalProps,
  ModalTrigger,
} from "../components/Modal.tsx";

const meta: Meta<typeof Modal> = {
  title: "Modal",
  component: Modal,
  parameters: {
    controls: { exclude: ["open", "onOpenChange", "children"] },
  },
  args: { defaultOpen: false },
};

export default meta;

type Story = StoryObj<ModalProps & Pick<ModalContentProps, "position" | "closeOnBackdropClick">>;

const button = "rounded bg-ui-accent px-3 py-1 text-white hover:opacity-90";

// Fades the dialog and its backdrop in and out
const animation =
  "opacity-0 transition-[opacity,display,overlay] transition-discrete duration-200 open:opacity-100 starting:open:opacity-0 motion-reduce:transition-none backdrop:transition-[opacity,display,overlay] backdrop:transition-discrete backdrop:duration-200 backdrop:opacity-0 open:backdrop:opacity-100 starting:open:backdrop:opacity-0";

export const Dialog: Story = {
  args: { position: "center", closeOnBackdropClick: true },
  argTypes: {
    position: { control: "inline-radio", options: ["center", "top", "right", "bottom", "left"] },
  },
  render: ({ position, closeOnBackdropClick, ...args }) => (
    <Modal key={String(args.defaultOpen)} {...args}>
      <ModalTrigger className={button}>Open</ModalTrigger>
      <ModalContent position={position} closeOnBackdropClick={closeOnBackdropClick} className={`w-96 p-6 ${animation}`}>
        <h2 className="text-lg font-semibold">Modal title</h2>
        <p className="mt-2">Escape, the backdrop or the button close it, and the focus returns to the trigger.</p>
        <ModalClose className={`${button} mt-4`}>Close</ModalClose>
      </ModalContent>
    </Modal>
  ),
};

export const SideMenu: Story = {
  render: (args) => (
    <Modal key={String(args.defaultOpen)} {...args}>
      <ModalTrigger className={button}>Menu</ModalTrigger>
      <ModalContent position="left" className={`w-64 p-4 ${animation}`}>
        <ModalClose className={button}>Close</ModalClose>
        <nav className="mt-5 flex flex-col gap-2">
          <a href="#home">Home</a>
          <a href="#about">About</a>
        </nav>
      </ModalContent>
    </Modal>
  ),
};
