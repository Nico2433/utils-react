import type { ComponentProps, ReactNode } from "react";
import { cx } from "../../lib/cn.ts";
import { FieldMessages, type FieldOwnProps, splitFieldProps, useFieldControl } from "./Field.tsx";

export interface RadioOption {
  label: ReactNode;
  value: string;
  disabled?: boolean;
}

export interface RadioGroupProps
  extends FieldOwnProps, Omit<ComponentProps<"input">, "className" | "type" | "value" | "defaultValue"> {
  options: RadioOption[];
  /** Selected value when controlled. */
  value?: string;
  defaultValue?: string;
  /** Lays the options in a row instead of a column. */
  horizontal?: boolean;
}

/** Group of radio buttons with a legend. Spread `register()` on it to get the selected value. */
export const RadioGroup = (props: RadioGroupProps) => {
  const [
    { label, labelClassName, ...messages },
    inputClassName,
    { id, options, value, defaultValue, horizontal = false, "aria-describedby": describedBy, ...rest },
  ] = splitFieldProps(props);
  const control = useFieldControl(id, messages, describedBy);
  const { id: _id, ...ariaProps } = control.props;

  return (
    <fieldset className={cx("m-0 flex w-full flex-col gap-1 border-0 p-0", messages.className)}>
      {label !== undefined && label !== null && <legend className={cx("mb-1", labelClassName)}>{label}</legend>}
      <div className={cx("flex gap-x-4 gap-y-1", !horizontal && "flex-col")}>
        {options.map((option, index) => {
          const optionId = `${control.id}-${index}`;

          return (
            // The radio and its text share one hit target
            <label key={option.value} className="flex w-fit cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed">
              <input
                id={optionId}
                type="radio"
                value={option.value}
                checked={value === undefined ? undefined : value === option.value}
                defaultChecked={defaultValue === undefined ? undefined : defaultValue === option.value}
                className={cx(
                  "size-4 shrink-0 cursor-pointer accent-ui-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ui-accent disabled:cursor-not-allowed disabled:opacity-50",
                  inputClassName
                )}
                {...ariaProps}
                {...rest}
                disabled={rest.disabled || option.disabled}
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>
      <FieldMessages id={control.id} {...messages} />
    </fieldset>
  );
};
