import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants, Contexts } from "../types";

export type ButtonSizes = Extract<Sizes, "xs" | "sm" | "md" | "lg" | "xl">;

export type ButtonVariants = Variants;

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariants;
  size?: ButtonSizes;
  context?: Contexts;
  class?: string;
  isFullWidth?: boolean;
};

const Button: Component<ButtonProps> = (props) => {
  const merged = mergeProps(
    { variant: "fill", size: "md", context: "brand" } as const,
    props
  );
  const [local, rest] = splitProps(merged, [
    "class",
    "variant",
    "size",
    "context",
    "isFullWidth",
  ]);
  return (
    <button
      class={mergeClasses(
        "moon-button",
        local.variant !== "fill" && `moon-button-${local.variant}`,
        local.size !== "md" && `moon-button-${local.size}`,
        local.context !== "brand" && `moon-button-${local.context}`,
        local.isFullWidth && "moon-button-full-width",
        local.class
      )}
      {...rest}
    />
  );
};

export default Button;
