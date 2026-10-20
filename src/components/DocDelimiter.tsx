import type { ComponentPropsWithRef, ElementType } from "react";
import { cx } from "../lib/cn.ts";

const limits = {
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export type DocDelimiterLimit = keyof typeof limits;

export type DocDelimiterProps<T extends ElementType = "div"> = {
  /** Element to render. Defaults to `div`. */
  as?: T;
  /** Max width of the content. Defaults to `full`. */
  limit?: DocDelimiterLimit;
} & Omit<ComponentPropsWithRef<T>, "as" | "limit">;

/** Limits the width of the page content and centers it. */
export const DocDelimiter = <T extends ElementType = "div">({
  as,
  limit = "full",
  className,
  ...rest
}: DocDelimiterProps<T>) => {
  const Element: ElementType = as ?? "div";

  return (
    <Element
      className={cx("mx-auto flex w-full flex-col items-center", limits[limit], className)}
      {...rest}
    />
  );
};
