import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Positions } from "../types";

export type TooltipPositions = Positions;

type TooltipChildProps = {
  children?: JSX.Element;
  class?: string;
};

type TooltipProps = {
  children?: JSX.Element;
  position?: TooltipPositions;
  hasPointer?: boolean;
};

const Trigger: Component<TooltipChildProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <p class={local.class} {...rest}>
      {local.children}
    </p>
  );
};

const Content: Component<TooltipChildProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-tooltip-content", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

const Root: Component<TooltipProps> = (props) => {
  const merged = mergeProps({ position: "top" as TooltipPositions, hasPointer: false }, props);
  const [local] = splitProps(merged, ["children", "position", "hasPointer"]);
  return (
    <div
      class={mergeClasses(
        "moon-tooltip",
        local.position !== "top" && `moon-tooltip-${local.position}`,
        local.hasPointer && "moon-tooltip-pointer"
      )}
    >
      {local.children}
    </div>
  );
};

const Tooltip = Object.assign(Root, { Trigger, Content });

export default Tooltip;
