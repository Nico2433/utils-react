import type { ComponentProps } from "react";
import { cx } from "../../lib/cn.ts";
import { Field, type FieldOwnProps, splitFieldProps, useFieldControl } from "./Field.tsx";

export interface CheckboxProps extends FieldOwnProps, Omit<ComponentProps<"input">, "className" | "type"> {}

/** Checkbox with its label on the right. Spread `register()` on it to get a boolean. */
export const Checkbox = (props: CheckboxProps) => {
  const [field, inputClassName, { id, "aria-describedby": describedBy, ...rest }] =
    splitFieldProps(props);
  const control = useFieldControl(id, field, describedBy);

  return (
    <Field {...field} id={control.id} inline>
      <input
        type="checkbox"
        className={cx(
          "size-4 shrink-0 cursor-pointer rounded accent-ui-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent disabled:cursor-not-allowed disabled:opacity-50",
          control.invalid && "outline-2 outline-ui-error",
          inputClassName
        )}
        {...control.props}
        {...rest}
      />
    </Field>
  );
};

/** On/off toggle, announced as a switch. Spread `register()` on it to get a boolean. */
export const Switch = (props: CheckboxProps) => {
  const [field, inputClassName, { id, "aria-describedby": describedBy, ...rest }] =
    splitFieldProps(props);
  const control = useFieldControl(id, field, describedBy);

  return (
    <Field {...field} id={control.id} inline>
      <span className="relative inline-flex shrink-0">
        <input type="checkbox" role="switch" className="peer sr-only" {...control.props} {...rest} />
        <span
          aria-hidden
          className={cx(
            "h-5 w-9 rounded-full bg-ui-border transition-colors peer-checked:bg-ui-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ui-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
            "after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-4 motion-reduce:transition-none motion-reduce:after:transition-none",
            control.invalid && "outline-2 outline-ui-error",
            inputClassName
          )}
        />
      </span>
    </Field>
  );
};
