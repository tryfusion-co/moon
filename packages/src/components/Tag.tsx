import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants, Contexts } from "../types";

export type TagSizes = Extract<Sizes, "2xs" | "xs">;

export type TagVariants = Variants;

type TagProps = JSX.HTMLAttributes<HTMLDivElement> & {
  size?: TagSizes;
  variant?: TagVariants;
  context?: Contexts;
  class?: string;
  children?: JSX.Element;
};

const Tag: Component<TagProps> = (props) => {
  const merged = mergeProps(
    { size: "xs", variant: "fill", context: "brand" } as const,
    props
  );
  const [local] = splitProps(merged, [
    "class",
    "size",
    "variant",
    "context",
    "children",
  ]);
  return (
    <div
      class={mergeClasses(
        "moon-tag",
        local.size !== "xs" && `moon-tag-${local.size}`,
        local.variant !== "fill" && `moon-tag-${local.variant}`,
        local.context !== "brand" && `moon-tag-${local.context}`,
        local.class
      )}
    >
      {local.children}
    </div>
  );
};

export default Tag;
