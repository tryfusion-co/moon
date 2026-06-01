import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Variants, Contexts } from "../types";

export type BadgeVariants = Extract<Variants, "fill" | "soft" | "outline">;

type BadgeProps = {
  children?: JSX.Element;
  class?: string;
  variant?: BadgeVariants;
  context?: Contexts;
};

const Badge: Component<BadgeProps> = (props) => {
  const merged = mergeProps({ variant: "fill", context: "brand" } as const, props);
  const [local] = splitProps(merged, ["children", "class", "variant", "context"]);
  return (
    <span
      class={mergeClasses(
        "moon-badge",
        local.variant !== "fill" && `moon-badge-${local.variant}`,
        local.context !== "brand" && `moon-badge-${local.context}`,
        local.class
      )}
    >
      {local.children}
    </span>
  );
};

export default Badge;
