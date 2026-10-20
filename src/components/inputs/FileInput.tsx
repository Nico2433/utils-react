"use client";

import {
  type ComponentProps,
  type DragEvent,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
} from "react";
import { cx } from "../../lib/cn.ts";
import { mergeRefs } from "../../lib/mergeRefs.ts";
import { controlClassName, Field, type FieldOwnProps, splitFieldProps, useFieldControl } from "./Field.tsx";

export interface FileInputProps
  extends FieldOwnProps, Omit<ComponentProps<"input">, "className" | "type" | "placeholder"> {
  /** Text shown in the button or the drop area. */
  placeholder?: ReactNode;
  /** Max size of each file in bytes. Bigger files are left out and sent to `onReject`. */
  maxSize?: number;
  /** Receives the files left out because of `maxSize`, or dropped files that don't match `accept`. */
  onReject?: (files: File[]) => void;
  /** Lists the selected files, with image previews and a button to remove each one. Defaults to `true`. */
  showFiles?: boolean;
}

// *-------------------- HELPERS --------------------* //

/** Checks a file against an `accept` attribute, like the picker does: `.pdf`, `image/*` or `image/png`. */
const isAccepted = (file: File, accept: string | undefined) => {
  if (!accept) return true;

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  return accept.split(",").some((token) => {
    const rule = token.trim().toLowerCase();
    if (rule.startsWith(".")) return name.endsWith(rule);
    if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
    return type === rule;
  });
};

const toFileList = (files: File[]) => {
  const transfer = new DataTransfer();
  files.forEach((file) => transfer.items.add(file));
  return transfer.files;
};

/** Replaces the files of the native input, so `register()` and `onChange` see it like a normal pick. */
const setInputFiles = (input: HTMLInputElement, files: FileList) => {
  input.files = files;
  input.dispatchEvent(new Event("change", { bubbles: true }));
};

const sizeUnits = [
  ["megabyte", 1024 ** 2],
  ["kilobyte", 1024],
  ["byte", 1],
] as const;

/** File size in the user's locale, e.g. `1.5 MB`. */
const formatSize = (bytes: number) => {
  const [unit, factor] = sizeUnits.find(([, factor]) => bytes >= factor) ?? sizeUnits[2];
  return new Intl.NumberFormat(undefined, { style: "unit", unit, unitDisplay: "short", maximumFractionDigits: 1 }).format(
    bytes / factor
  );
};

// *-------------------- FILE LIST --------------------* //

/** Selected files, kept in sync with picks, drops, removals and form resets. */
const useSelectedFiles = (
  inputRef: RefObject<HTMLInputElement | null>,
  maxSize: number | undefined,
  onReject: ((files: File[]) => void) | undefined
) => {
  const [files, setFiles] = useState<File[]>([]);
  const reject = useEffectEvent((rejected: File[]) => onReject?.(rejected));

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const form = input.form;

    // Runs on the input itself, before React's onChange, so oversized files never reach it
    const update = () => {
      const selected = Array.from(input.files ?? []);
      const tooBig = maxSize === undefined ? [] : selected.filter((file) => file.size > maxSize);

      if (tooBig.length > 0) {
        const kept = selected.filter((file) => !tooBig.includes(file));
        input.files = toFileList(kept);
        reject(tooBig);
        setFiles(kept);
        return;
      }

      setFiles(selected);
    };

    const clear = () => setFiles([]);

    input.addEventListener("change", update);
    form?.addEventListener("reset", clear);

    return () => {
      input.removeEventListener("change", update);
      form?.removeEventListener("reset", clear);
    };
  }, [inputRef, maxSize]);

  const remove = (file: File) => {
    const input = inputRef.current;
    if (input) setInputFiles(input, toFileList(files.filter((selected) => selected !== file)));
  };

  return { files, remove };
};

const FilePreview = ({ file }: { file: File }) => {
  // The object URL lives as long as the image, so it's never revoked while shown
  const previewRef = useCallback(
    (image: HTMLImageElement | null) => {
      if (!image) return;
      const url = URL.createObjectURL(file);
      image.src = url;
      return () => URL.revokeObjectURL(url);
    },
    [file]
  );

  if (!file.type.startsWith("image/")) return null;

  return <img ref={previewRef} alt="" width={40} height={40} className="size-10 shrink-0 rounded object-cover" />;
};

const SelectedFiles = ({
  files,
  onRemove,
  disabled,
}: {
  files: File[];
  onRemove: (file: File) => void;
  disabled?: boolean;
}) => (
  <ul className="flex flex-col gap-1">
    {files.map((file, index) => (
      <li key={`${index}-${file.name}`} className="flex items-center gap-2 rounded px-2 py-1 shadow">
        <FilePreview file={file} />
        <span className="min-w-0 flex-1 truncate">{file.name}</span>
        <span className="shrink-0 text-sm text-ui-muted tabular-nums">{formatSize(file.size)}</span>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onRemove(file)}
          aria-label={`Remove ${file.name}`}
          className="shrink-0 rounded px-1 hover:bg-ui-border/40 focus-visible:outline-2 focus-visible:outline-ui-accent disabled:opacity-50"
        >
          <span aria-hidden>×</span>
        </button>
      </li>
    ))}
  </ul>
);

// *-------------------- INPUTS --------------------* //

const useFileInput = (props: FileInputProps, dropzone: boolean) => {
  const [
    field,
    inputClassName,
    { id, ref, placeholder, maxSize, onReject, showFiles = true, "aria-describedby": describedBy, ...rest },
  ] = splitFieldProps(props);
  const control = useFieldControl(id, field, describedBy);

  const inputRef = useRef<HTMLInputElement>(null);
  const userRef = props.ref;
  const mergedRef = useMemo(() => mergeRefs(inputRef, userRef), [userRef]);
  const { files, remove } = useSelectedFiles(inputRef, maxSize, onReject);

  const input = <input ref={mergedRef} type="file" className="peer sr-only" {...control.props} {...rest} />;

  const boxClassName = cx(
    controlClassName(control.invalid),
    "block cursor-pointer text-center peer-focus-visible:ring-2 peer-focus-visible:ring-ui-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
    dropzone && "border-2 border-dashed border-ui-border px-4 py-8",
    control.invalid && "border-ui-error peer-focus-visible:ring-ui-error",
    inputClassName
  );

  const list = showFiles && files.length > 0 && (
    <SelectedFiles files={files} onRemove={remove} disabled={rest.disabled} />
  );

  return { field, control, inputRef, input, boxClassName, placeholder, list, onReject, ...rest };
};

/** File picker shown as a button. Spread `register()` on it to get a `FileList`. */
export const FileInput = (props: FileInputProps) => {
  const { field, control, input, boxClassName, placeholder, list } = useFileInput(props, false);

  return (
    <Field {...field} id={control.id}>
      {input}
      <label htmlFor={control.id} className={boxClassName}>
        {placeholder}
      </label>
      {list}
    </Field>
  );
};

/** File picker that also accepts files dropped on it. Spread `register()` on it to get a `FileList`. */
export const FileDropInput = (props: FileInputProps) => {
  const { field, control, inputRef, input, boxClassName, placeholder, list, onReject, disabled, multiple, accept } =
    useFileInput(props, true);
  const [dragging, setDragging] = useState(false);

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    if (!disabled) setDragging(true);
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    setDragging(false);

    const input = inputRef.current;
    if (!input || disabled) return;

    const dropped = event.dataTransfer.files;
    const all = Array.from(dropped);
    const accepted = all.filter((file) => isAccepted(file, accept));
    const kept = multiple ? accepted : accepted.slice(0, 1);

    const notAccepted = all.filter((file) => !accepted.includes(file));
    if (notAccepted.length > 0) onReject?.(notAccepted);
    if (kept.length === 0) return;

    setInputFiles(input, kept.length === dropped.length ? dropped : toFileList(kept));
  };

  return (
    <Field {...field} id={control.id}>
      {input}
      <label
        htmlFor={control.id}
        data-dragging={dragging || undefined}
        onDragOver={onDragOver}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cx(boxClassName, dragging && "border-ui-accent bg-ui-accent/10")}
      >
        {placeholder}
      </label>
      {list}
    </Field>
  );
};
