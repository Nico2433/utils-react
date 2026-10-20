import { type Context, use } from "react";

/**
 * Reads a context and throws when it is used outside its provider.
 * Only `undefined` counts as missing, so falsy values like `0` or `false` are valid.
 */
export const useGetContext = <T>(context: Context<T>): Exclude<T, undefined> => {
  const value = use(context);

  if (value === undefined) {
    const name = context.displayName ?? "Context";
    throw new Error(`${name} has to be used within its provider`);
  }

  return value as Exclude<T, undefined>;
};
