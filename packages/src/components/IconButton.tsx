import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants, Contexts } from "../types";

export type IconButtonSizes = Extract<Sizes, "xs" | "sm" | "md" | "lg" | "xl">;

export type IconButtonVariants = Variants;

type IconButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  class?: string;
  variant?: IconButtonVariants;
  size?: IconButtonSizes;
  context?: Contexts;
  isRounded?: boolean;
};

const IconButton: Component<IconButtonProps> = (props) => {
  const merged = mergeProps(
    { variant: "fill", size: "md", context: "brand" } as const,
    props
  );
  const [local, rest] = splitProps(merged, [
    "class",
    "variant",
    "size",
    "context",
    "isRounded",
  ]);
  return (
    <button
      class={mergeClasses(
        "moon-icon-button",
        local.variant !== "fill" && `moon-icon-button-${local.variant}`,
        local.size !== "md" && `moon-icon-button-${local.size}`,
        local.context !== "brand" && `moon-icon-button-${local.context}`,
        local.isRounded && "moon-icon-button-rounded",
        local.class
      )}
      {...rest}
    />
  );
};

export default IconButton;
