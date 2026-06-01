import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants } from "../types";

export type InputSizes = Extract<Sizes, "sm" | "md" | "lg" | "xl">;

export type InputVariants = Extract<Variants, "fill" | "outline">;

type InputProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  size?: InputSizes;
  variant?: InputVariants;
  error?: boolean;
  class?: string;
};

const Input: Component<InputProps> = (props) => {
  const merged = mergeProps({ size: "md", variant: "fill", error: false } as const, props);
  const [local, rest] = splitProps(merged, ["class", "type", "size", "variant", "error"]);
  return (
    <input
      type={local.type}
      class={mergeClasses(
        "moon-input",
        local.size !== "md" && `moon-input-${local.size}`,
        local.variant !== "fill" && `moon-input-${local.variant}`,
        local.error && "moon-input-error",
        local.class
      )}
      {...rest}
    />
  );
};

export default Input;
