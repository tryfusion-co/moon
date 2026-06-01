import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes } from "../types";

export type CircularProgressSizes = Extract<
  Sizes,
  "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
>;

type CircularProgressProps = JSX.HTMLAttributes<HTMLDivElement> & {
  size?: CircularProgressSizes;
  class?: string;
  value?: number;
};

const CircularProgress: Component<CircularProgressProps> = (props) => {
  const merged = mergeProps({ size: "md", value: 0 } as const, props);
  const [local, rest] = splitProps(merged, ["size", "class", "value"]);
  return (
    <div
      class={mergeClasses(
        "moon-circular-progress",
        local.size !== "md" && `moon-circular-progress-${local.size}`,
        local.class
      )}
      data-value={local.value}
      {...rest}
    />
  );
};

export default CircularProgress;
