import { mergeProps, splitProps, type Component } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes } from "../types";

export type LoaderSizes = Extract<Sizes, "2xs" | "xs" | "sm" | "md" | "lg">;

type LoaderProps = { size?: LoaderSizes; class?: string };

const Loader: Component<LoaderProps> = (props) => {
  const merged = mergeProps({ size: "md" } as const, props);
  const [local] = splitProps(merged, ["size", "class"]);
  return (
    <div
      class={mergeClasses(
        "moon-loader",
        local.size !== "md" && `moon-loader-${local.size}`,
        local.class
      )}
    />
  );
};

export default Loader;
