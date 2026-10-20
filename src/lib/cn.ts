import { type ClassValue, cn as join } from "@nico2433/utils";
import { twMerge } from "tailwind-merge";

/** Joins class names and resolves Tailwind conflicts, so later classes win: `cx("p-1", "p-4")` → `"p-4"`. */
export const cx = (...values: ClassValue[]): string => twMerge(join(...values));
