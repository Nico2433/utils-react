import { act, render, screen, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { Checkbox, Switch } from "./Checkbox.tsx";
import { FileDropInput, FileInput } from "./FileInput.tsx";
import { Input } from "./Input.tsx";
import { RadioGroup } from "./RadioGroup.tsx";
import { Select } from "./Select.tsx";

const file = (name: string, size = 1, type = "text/plain") =>
  new File([new Uint8Array(size)], name, { type });

const fileInput = () => document.querySelector<HTMLInputElement>("input[type=file]")!;

const drop = (target: HTMLElement, files: File[]) => {
  const dataTransfer = new DataTransfer();
  files.forEach((dropped) => dataTransfer.items.add(dropped));
  act(() => {
    target.dispatchEvent(new DragEvent("drop", { dataTransfer, bubbles: true, cancelable: true }));
  });
};

describe("Input", () => {
  it("links the label, the description and the error", () => {
    render(<Input label="Name" description="Your full name" error="Required" />);
    const input = screen.getByLabelText("Name");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBe(
      `${input.id}-description ${screen.getByRole("alert").id}`
    );
    expect(screen.getByRole("alert").textContent).toBe("Required");
  });

  it("marks the input invalid without a message when error is true", () => {
    render(<Input label="Name" error />);
    const input = screen.getByLabelText("Name");

    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.getAttribute("aria-describedby")).toBeNull();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("has no error state without an error", () => {
    render(<Input label="Name" />);
    const input = screen.getByLabelText("Name");

    expect(input.getAttribute("aria-invalid")).toBeNull();
    expect(input.getAttribute("aria-describedby")).toBeNull();
  });

  it("lets inputClassName override the default classes", () => {
    render(<Input label="Name" inputClassName="p-4" />);
    const { className } = screen.getByLabelText("Name");

    expect(className).toContain("p-4");
    expect(className).not.toContain("px-2");
  });

  it("works with react-hook-form register", async () => {
    const onSubmit = vi.fn();

    const Form = () => {
      const { register, handleSubmit, formState } = useForm<{ name: string }>();
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Input label="Name" error={formState.errors.name?.message} {...register("name", { required: "Required" })} />
          <button>Submit</button>
        </form>
      );
    };

    render(<Form />);

    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    expect((await screen.findByRole("alert")).textContent).toBe("Required");

    await userEvent.type(screen.getByLabelText("Name"), "Ana");
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));
    await waitFor(() => expect(onSubmit.mock.calls[0]?.[0]).toEqual({ name: "Ana" }));
  });
});

describe("Select", () => {
  it("starts on the placeholder and renders the options", () => {
    render(
      <Select
        label="Color"
        placeholder="Pick one"
        options={[
          { label: "Red", value: "red" },
          { label: "Blue", value: "blue" },
        ]}
      />
    );

    expect(screen.getByLabelText<HTMLSelectElement>("Color").value).toBe("");
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual(["Pick one", "Red", "Blue"]);
  });
});

describe("Checkbox, Switch and RadioGroup", () => {
  it("give booleans and the selected value to react-hook-form", async () => {
    const onSubmit = vi.fn();

    const Form = () => {
      const { register, handleSubmit } = useForm<{ terms: boolean; news: boolean; plan: string }>({
        defaultValues: { plan: "free" },
      });
      return (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Checkbox label="Accept terms" {...register("terms")} />
          <Switch label="Newsletter" {...register("news")} />
          <RadioGroup
            label="Plan"
            options={[
              { label: "Free", value: "free" },
              { label: "Pro", value: "pro" },
            ]}
            {...register("plan")}
          />
          <button>Submit</button>
        </form>
      );
    };

    render(<Form />);

    expect(screen.getByRole("switch", { name: "Newsletter" })).toBeTruthy();
    expect(screen.getByRole("group", { name: "Plan" })).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>("Free").checked).toBe(true);

    await userEvent.click(screen.getByLabelText("Accept terms"));
    await userEvent.click(screen.getByText("Newsletter"));
    await userEvent.click(screen.getByLabelText("Pro"));
    await userEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(onSubmit.mock.calls[0]?.[0]).toEqual({ terms: true, news: true, plan: "pro" }));
  });

  it("marks every radio invalid and links them to the error", () => {
    render(<RadioGroup label="Plan" error="Pick a plan" options={[{ label: "Free", value: "free" }]} />);
    const radio = screen.getByLabelText("Free");

    expect(radio.getAttribute("aria-invalid")).toBe("true");
    expect(radio.getAttribute("aria-describedby")).toBe(screen.getByRole("alert").id);
  });
});

describe("FileInput", () => {
  it("lists the selected files and removes them one by one", async () => {
    const onChange = vi.fn();
    render(<FileInput label="Files" placeholder="Choose files" multiple onChange={onChange} />);

    await userEvent.upload(fileInput(), [file("a.txt"), file("b.txt")]);
    expect(screen.getByText("a.txt")).toBeTruthy();
    expect(screen.getByText("b.txt")).toBeTruthy();

    await userEvent.click(screen.getByRole("button", { name: "Remove a.txt" }));

    expect(Array.from(fileInput().files!, (selected) => selected.name)).toEqual(["b.txt"]);
    expect(screen.queryByText("a.txt")).toBeNull();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it("shows a preview for images", async () => {
    render(<FileInput label="Avatar" />);

    await userEvent.upload(fileInput(), file("photo.png", 10, "image/png"));
    expect(document.querySelector("li img")?.getAttribute("src")).toMatch(/^blob:/);
  });

  it("leaves out files bigger than maxSize and reports them", async () => {
    const onReject = vi.fn();
    const onChange = vi.fn();
    render(<FileInput label="Files" multiple maxSize={5} onReject={onReject} onChange={onChange} />);

    await userEvent.upload(fileInput(), [file("small.txt", 2), file("big.txt", 10)]);

    expect(Array.from(fileInput().files!, (selected) => selected.name)).toEqual(["small.txt"]);
    expect(onReject.mock.calls[0]?.[0].map((rejected: File) => rejected.name)).toEqual(["big.txt"]);
    expect(onChange.mock.calls[0]?.[0].target.files).toHaveLength(1);
    expect(screen.queryByText("big.txt")).toBeNull();
  });

  it("clears the list when the form resets", async () => {
    render(
      <form>
        <FileInput label="Files" />
      </form>
    );

    await userEvent.upload(fileInput(), file("a.txt"));
    expect(screen.getByText("a.txt")).toBeTruthy();

    fileInput().form!.reset();
    await waitFor(() => expect(screen.queryByText("a.txt")).toBeNull());
  });
});

describe("FileDropInput", () => {
  it("sends dropped files through the native input", () => {
    const onChange = vi.fn();
    render(<FileDropInput label="Files" placeholder="Drop here" multiple onChange={onChange} />);

    drop(screen.getByText("Drop here"), [file("a.txt"), file("b.txt")]);

    expect(Array.from(fileInput().files!, (selected) => selected.name)).toEqual(["a.txt", "b.txt"]);
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("keeps one file without multiple and reports the ones that do not match accept", () => {
    const onReject = vi.fn();
    render(<FileDropInput label="Images" placeholder="Drop here" accept="image/*" onReject={onReject} />);

    drop(screen.getByText("Drop here"), [
      file("notes.txt"),
      file("a.png", 1, "image/png"),
      file("b.png", 1, "image/png"),
    ]);

    expect(Array.from(fileInput().files!, (selected) => selected.name)).toEqual(["a.png"]);
    expect(onReject.mock.calls[0]?.[0].map((rejected: File) => rejected.name)).toEqual(["notes.txt"]);
  });
});
