import { mergeProps, onMount, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import CloseIcon from "../assets/icons/Close";
import type { Variants, Contexts } from "../types";

export type AlertVariants = Extract<Variants, "fill" | "soft" | "outline">;

type AlertProps = {
  children?: JSX.Element;
  class?: string;
};

type AlertRootProps = JSX.HTMLAttributes<HTMLDivElement> &
  AlertProps & {
    variant?: AlertVariants;
    context?: Contexts;
  };

type ActionProps = AlertProps & {
  onClick?: (_e: MouseEvent) => void;
};

const Close: Component<ActionProps> = (props) => {
  const [local] = splitProps(props, ["children", "onClick", "class"]);
  let ref!: HTMLParagraphElement;
  onMount(() => {
    ref.addEventListener("click", (e) => local.onClick?.(e));
  });
  return (
    <p
      ref={ref}
      class={mergeClasses("moon-alert-close", local.class)}
    >
      {local.children ? local.children : <CloseIcon />}
    </p>
  );
};

const Meta: Component<AlertProps> = (props) => {
  const [local] = splitProps(props, ["children", "class"]);
  return (
    <p class={mergeClasses("moon-alert-meta", local.class)}>{local.children}</p>
  );
};

const Content: Component<AlertProps> = (props) => {
  const [local] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-alert-content", local.class)}>
      {local.children}
    </div>
  );
};

const Action: Component<ActionProps> = (props) => {
  const [local] = splitProps(props, ["children", "onClick", "class"]);
  let ref!: HTMLButtonElement;
  onMount(() => {
    ref.addEventListener("click", (e) => local.onClick?.(e));
  });
  return (
    <button
      ref={ref}
      class={mergeClasses("moon-alert-action", local.class)}
    >
      {local.children}
    </button>
  );
};

const Root: Component<AlertRootProps> = (props) => {
  const merged = mergeProps({ variant: "fill" as AlertVariants, context: "brand" as Contexts }, props);
  const [local] = splitProps(merged, ["variant", "context", "children", "class"]);
  return (
    <div
      class={mergeClasses(
        "moon-alert",
        local.variant !== "fill" && `moon-alert-${local.variant}`,
        local.context !== "brand" && `moon-alert-${local.context}`,
        local.class
      )}
    >
      {local.children}
    </div>
  );
};

const Alert = Object.assign(Root, { Close, Content, Action, Meta });

export default Alert;
