import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../lib/cn.ts";
import {
  controlClassName,
  Field,
  type FieldOwnProps,
  splitFieldProps,
  useFieldControl,
} from "./Field.tsx";

export interface InputProps extends FieldOwnProps, Omit<ComponentProps<"input">, "className"> {
  /** Content placed right after the input, like a button. */
  end?: ReactNode;
}

/** Text-like input (`text`, `password`, `email`, `date`, `number`…). Spread `register()` on it. */
export const Input = (props: InputProps) => {
  const [field, inputClassName, { id, end, "aria-describedby": describedBy, ...rest }] =
    splitFieldProps(props);
  const control = useFieldControl(id, field, describedBy);

  return (
    <Field {...field} id={control.id}>
      <div className="flex w-full">
        <input
          type="text"
          className={cx(
            controlClassName(control.invalid),
            end !== undefined && "rounded-r-none",
            inputClassName
          )}
          {...control.props}
          {...rest}
        />
        {end}
      </div>
    </Field>
  );
};
