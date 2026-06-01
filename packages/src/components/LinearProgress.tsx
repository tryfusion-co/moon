import { mergeProps, splitProps, Show, type Component } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes } from "../types";

export type LinearProgressSizes = Extract<Sizes, "5xs" | "4xs" | "3xs" | "2xs">;

type LinearProgressProps = {
  label?: string;
  class?: string;
  size?: LinearProgressSizes;
  value: number;
};

const LinearProgress: Component<LinearProgressProps> = (props) => {
  const merged = mergeProps({ size: "2xs" } as const, props);
  const [local] = splitProps(merged, ["class", "value", "size", "label"]);
  return (
    <Show
      when={local.label}
      fallback={
        <progress
          value={String(local.value)}
          max="100"
          class={mergeClasses(
            "moon-linear-progress",
            local.size !== "2xs" && `moon-linear-progress-${local.size}`,
            local.class
          )}
        />
      }
    >
      {(label) => (
        <label class={local.class}>
          <progress
            value={String(local.value)}
            max="100"
            class={mergeClasses(
              "moon-linear-progress",
              local.size !== "2xs" && `moon-linear-progress-${local.size}`
            )}
          />
          <span>{label()}</span>
        </label>
      )}
    </Show>
  );
};

export default LinearProgress;
