import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants } from "../types";

export type TextareaSizes = Extract<Sizes, "sm" | "md" | "lg" | "xl">;

export type TextareaVariants = Extract<Variants, "fill" | "outline">;

type TextareaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  size?: TextareaSizes;
  variant?: TextareaVariants;
  error?: boolean;
  class?: string;
};

const Textarea: Component<TextareaProps> = (props) => {
  const merged = mergeProps({ size: "md", variant: "fill", error: false } as const, props);
  const [local, rest] = splitProps(merged, ["class", "size", "variant", "error"]);
  return (
    <textarea
      class={mergeClasses(
        "moon-textarea",
        local.size !== "md" && `moon-textarea-${local.size}`,
        local.variant !== "fill" && `moon-textarea-${local.variant}`,
        local.error && "moon-textarea-error",
        local.class
      )}
      {...rest}
    />
  );
};

export default Textarea;
