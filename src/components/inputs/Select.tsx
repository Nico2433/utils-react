import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../lib/cn.ts";
import {
  controlClassName,
  Field,
  type FieldOwnProps,
  splitFieldProps,
  useFieldControl,
} from "./Field.tsx";

export interface SelectOption {
  label: ReactNode;
  value: string;
  disabled?: boolean;
}

export interface SelectProps extends FieldOwnProps, Omit<ComponentProps<"select">, "className"> {
  options?: SelectOption[];
  /** Disabled first option shown while nothing is selected. Ignored with `multiple`. */
  placeholder?: string;
}

export const Select = (props: SelectProps) => {
  const [
    field,
    inputClassName,
    { id, options, placeholder, children, "aria-describedby": describedBy, ...rest },
  ] = splitFieldProps(props);
  const control = useFieldControl(id, field, describedBy);

  const showPlaceholder = placeholder !== undefined && !rest.multiple;
  const startsEmpty = showPlaceholder && rest.value === undefined && rest.defaultValue === undefined;

  return (
    <Field {...field} id={control.id}>
      <select
        defaultValue={startsEmpty ? "" : undefined}
        className={cx(controlClassName(control.invalid), inputClassName)}
        {...control.props}
        {...rest}
      >
        {showPlaceholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options?.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
        {children}
      </select>
    </Field>
  );
};
