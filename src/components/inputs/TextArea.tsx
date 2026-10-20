import type { ComponentProps } from "react";
import { cx } from "../../lib/cn.ts";
import {
  controlClassName,
  Field,
  type FieldOwnProps,
  splitFieldProps,
  useFieldControl,
} from "./Field.tsx";

export interface TextAreaProps extends FieldOwnProps, Omit<ComponentProps<"textarea">, "className"> {}

export const TextArea = (props: TextAreaProps) => {
  const [field, inputClassName, { id, "aria-describedby": describedBy, ...rest }] =
    splitFieldProps(props);
  const control = useFieldControl(id, field, describedBy);

  return (
    <Field {...field} id={control.id}>
      <textarea
        className={cx(controlClassName(control.invalid), inputClassName)}
        {...control.props}
        {...rest}
      />
    </Field>
  );
};
