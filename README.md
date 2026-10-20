# @nico2433/utils-react

React components and hooks for my personal projects, styled with Tailwind CSS v4. Requires React 19.2+.

```bash
pnpm add @nico2433/utils-react
```

Storybook: https://nico2433.github.io/utils-react

## Setup

Import the theme after Tailwind in your main CSS file. It defines the colors and lets Tailwind find the classes the components use:

```css
@import "tailwindcss";
@import "@nico2433/utils-react/theme.css";
```

### Colors

The components use four theme colors. Override any of them in your own `@theme`:

```css
@theme {
  --color-ui-accent: var(--color-violet-600); /* focus rings, checked controls, active states */
  --color-ui-error: var(--color-rose-600); /* errors and invalid borders */
  --color-ui-border: var(--color-zinc-300); /* neutral borders and the switch track */
  --color-ui-muted: var(--color-zinc-500); /* descriptions and secondary text */
}
```

They are regular Tailwind colors, so `bg-ui-accent` or `text-ui-error` also work in your code.

### Class names

Every component accepts `className`, and the inputs also accept `labelClassName`, `inputClassName`, `descriptionClassName` and `errorClassName`. Your classes override the defaults even when they conflict, so `inputClassName="p-4"` replaces the default padding.

Components that need state are marked with `"use client"`, so they work from Next.js Server Components.

## Inputs

`Input`, `TextArea`, `Select`, `Checkbox`, `Switch`, `RadioGroup`, `FileInput` and `FileDropInput` accept every prop of their native element, plus `label`, `description` and `error`. They work with [react-hook-form](https://react-hook-form.com) by spreading `register()`, or without it as plain inputs.

```tsx
import { Checkbox, FileDropInput, Input, RadioGroup } from "@nico2433/utils-react";
import { useForm } from "react-hook-form";

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<{ email: string; plan: string; files: FileList; terms: boolean }>();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <Input
        label="Email"
        type="email"
        description="We never share it"
        error={errors.email?.message}
        {...register("email", { required: "Email is required" })}
      />
      <RadioGroup
        label="Plan"
        options={[
          { label: "Free", value: "free" },
          { label: "Pro", value: "pro" },
        ]}
        {...register("plan")}
      />
      <FileDropInput label="Files" placeholder="Drop files or click here" multiple maxSize={5 * 1024 ** 2} {...register("files")} />
      <Checkbox label="I accept the terms" {...register("terms", { required: true })} />
      <button>Submit</button>
    </form>
  );
};
```

- `Input` covers every text-like type (`text`, `password`, `email`, `date`, `number`…). Use `end` to place something after it, like a button.
- `Select` takes `options` and/or `<option>` children. `placeholder` adds a disabled first option.
- `Checkbox` and `Switch` give a boolean. `RadioGroup` gives the selected value and takes `horizontal` to lay the options in a row.
- `FileInput` shows a button and `FileDropInput` a drop area. Both list the selected files with image previews and a button to remove each one (`showFiles={false}` hides the list), and give a `FileList` to `register()`.
  - `maxSize` (bytes) leaves out bigger files, and dropped files follow `accept` and `multiple` like the picker does. The files left out go to `onReject`.
- The description and the error are linked to the input with `aria-describedby`, and the error also sets `aria-invalid`. `error={true}` marks the input as invalid without a message.
- `Field` renders the label and messages of any custom control: `<Field id="color" label="Color" error={error}><MyPicker id="color" /></Field>`.

## Dropdown

```tsx
import { Dropdown, DropdownClose, DropdownContent, DropdownTrigger } from "@nico2433/utils-react";

<Dropdown>
  <DropdownTrigger className="rounded bg-ui-accent px-3 py-1 text-white">Open</DropdownTrigger>
  <DropdownContent position="bottom" className="rounded bg-white p-2 shadow">
    <p>Content</p>
    <DropdownClose>Close</DropdownClose>
  </DropdownContent>
</Dropdown>;
```

- `Dropdown`: `open`, `defaultOpen` and `onOpenChange` to control it, and `closeOnOutsideClick` (default `true`).
- `DropdownContent` is a popover: it shows above everything else and is never clipped by a parent with `overflow: hidden`. It's anchored to the trigger on the `position` side (`top`, `right`, `bottom` or `left`) and flips to the other side when it doesn't fit. Use `position="none"` to place it yourself.
- It closes with Escape and returns the focus to the trigger.
- `useDropdown()` returns `{ open, setOpen, toggle }` inside a dropdown.

## Modal

A native modal `<dialog>`: it traps the focus, makes the rest of the page inert, closes with Escape and gives the focus back to where it was. The page scroll is blocked while it's open.

```tsx
import { Modal, ModalClose, ModalContent, ModalTrigger } from "@nico2433/utils-react";

<Modal>
  <ModalTrigger>Menu</ModalTrigger>
  <ModalContent position="left" className="w-64 p-4">
    <ModalClose>Close</ModalClose>
    <nav>...</nav>
  </ModalContent>
</Modal>;
```

- `Modal`: `open`, `defaultOpen` and `onOpenChange` to control it. It renders no element.
- `ModalContent`: `position` is `center` (default) for a dialog, or `top`, `right`, `bottom` or `left` for a drawer. `closeOnBackdropClick` defaults to `true`, and `backdrop:` classes style the backdrop.
- `useModal()` returns `{ open, setOpen }` inside a modal.

## Animations

`DropdownContent` and `ModalContent` stay mounted while closed and have `data-state="open" | "closed"`, so they can animate both ways with CSS only:

```tsx
<DropdownContent className="opacity-0 transition-[opacity,display,overlay] transition-discrete duration-200 open:opacity-100 starting:open:opacity-0 motion-reduce:transition-none">
```

## DocDelimiter

Limits the width of the page content and centers it. `limit` is `6xl`, `7xl` or `full` (default) and `as` changes the element.

```tsx
<DocDelimiter as="main" limit="7xl">
  ...
</DocDelimiter>
```

## Hooks

```tsx
import {
  useClickOutside,
  useControllableState,
  useDebounce,
  useGetContext,
  useIsVisible,
  useLocalStorage,
  useMediaQuery,
  useScrollLock,
} from "@nico2433/utils-react";

const [ref, visible] = useIsVisible<HTMLDivElement>({ once: true, rootMargin: "100px" }); // <div ref={ref}>
const isDesktop = useMediaQuery("(min-width: 768px)");
const search = useDebounce(text, 300);
const [theme, setTheme, removeTheme] = useLocalStorage("theme", "light"); // synced between tabs
const [value, setValue] = useControllableState({ value: props.value, defaultValue: "", onChange: props.onChange });
useClickOutside(ref, () => setOpen(false), open);
useScrollLock(open);
const context = useGetContext(MyContext); // throws outside the provider
```

## Development

```bash
pnpm storybook
```

- `pnpm test` runs the tests in a real Chromium. The first time, install it with `pnpm exec playwright install chromium`.
- `pnpm typecheck`, `pnpm lint` and `pnpm check:package` check the code and the published package.

### Releases

Releases are automatic from [Conventional Commits](https://www.conventionalcommits.org): `fix:` bumps the patch, `feat:` the minor and `feat!:` or a `BREAKING CHANGE:` footer the major.

1. Every push to `main` opens or updates a release PR with the next version and changelog.
2. Merging that PR tags the release and publishes it to npm from GitHub Actions.
