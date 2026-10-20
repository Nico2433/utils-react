import { cn } from "@nico2433/utils";
import { type ReactNode, useId } from "react";
import { cx } from "../../lib/cn.ts";

/** Props shared by every input: the label, the messages and the class name of each part. */
export interface FieldOwnProps {
  label?: ReactNode;
  /** Help text shown under the input. */
  description?: ReactNode;
  /** Error shown under the input, e.g. `errors.email?.message`. Marks the input as invalid; `true` does it without a message. */
  error?: ReactNode;
  /** Class name of the wrapper. */
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

export interface FieldProps extends Omit<FieldOwnProps, "inputClassName"> {
  /** Id of the control inside, used to link the label and the messages. */
  id: string;
  /** Puts the label after the control, like checkboxes do. The whole row is clickable. */
  inline?: boolean;
  children?: ReactNode;
}

const errorIdOf = (id: string) => `${id}-error`;
const descriptionIdOf = (id: string) => `${id}-description`;

const isPresent = (node: ReactNode) =>
  node !== undefined && node !== null && node !== false && node !== "";

const isInvalid = isPresent;
const hasMessage = (error: ReactNode) => isPresent(error) && error !== true;

/** Description and error under a control. */
export const FieldMessages = ({
  id,
  description,
  error,
  descriptionClassName,
  errorClassName,
}: Pick<FieldProps, "id" | "description" | "error" | "descriptionClassName" | "errorClassName">) => (
  <>
    {isPresent(description) && (
      <p id={descriptionIdOf(id)} className={cx("text-sm text-ui-muted", descriptionClassName)}>
        {description}
      </p>
    )}
    {hasMessage(error) && (
      <p id={errorIdOf(id)} role="alert" className={cx("text-sm text-ui-error", errorClassName)}>
        {error}
      </p>
    )}
  </>
);

/** Wraps a control with its label and messages. Use it to build inputs that look like the rest. */
export const Field = ({ id, label, inline = false, className, labelClassName, children, ...messages }: FieldProps) => (
  <div className={cx("flex w-full flex-col gap-1", className)}>
    {inline ? (
      // The control and its text share one hit target
      <label htmlFor={id} className="flex w-fit cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed">
        {children}
        {isPresent(label) && <span className={labelClassName}>{label}</span>}
      </label>
    ) : (
      <>
        {isPresent(label) && (
          <label htmlFor={id} className={labelClassName}>
            {label}
          </label>
        )}
        {children}
      </>
    )}
    <FieldMessages id={id} {...messages} />
  </div>
);

// *-------------------- INTERNALS --------------------* //

/** Separates the `Field` props from the ones that go to the control. */
export const splitFieldProps = <P extends FieldOwnProps>({
  label,
  description,
  error,
  className,
  labelClassName,
  inputClassName,
  descriptionClassName,
  errorClassName,
  ...rest
}: P) =>
  [
    { label, description, error, className, labelClassName, descriptionClassName, errorClassName },
    inputClassName,
    rest,
  ] as const;

/** Resolves the control id and the aria attributes that link it with its messages. */
export const useFieldControl = (
  id: string | undefined,
  { description, error }: Pick<FieldOwnProps, "description" | "error">,
  describedBy?: string
) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const invalid = isInvalid(error);

  return {
    id: controlId,
    invalid,
    props: {
      id: controlId,
      "aria-invalid": invalid || undefined,
      "aria-describedby":
        cn(
          describedBy,
          isPresent(description) && descriptionIdOf(controlId),
          hasMessage(error) && errorIdOf(controlId)
        ) || undefined,
    },
  };
};

export const controlClassName = (invalid: boolean) =>
  cx(
    "w-full rounded border border-transparent px-2 py-1 shadow outline-none focus-visible:ring-2 focus-visible:ring-ui-accent disabled:cursor-not-allowed disabled:opacity-50",
    invalid && "border-ui-error focus-visible:ring-ui-error"
  );
