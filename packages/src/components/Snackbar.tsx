import { mergeProps, splitProps, Show, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Variants, Contexts } from "../types";

export type SnackbarVariants = Extract<Variants, "fill" | "soft">;

type SnackbarProps = {
  isOpen: boolean;
  children?: JSX.Element;
  variant?: SnackbarVariants;
  context?: Contexts;
};

type SnackbarSubProps = {
  children?: JSX.Element;
  class?: string;
};

const Action: Component<JSX.HTMLAttributes<HTMLDivElement> & SnackbarSubProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-snackbar-action", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

const Meta: Component<JSX.HTMLAttributes<HTMLDivElement> & SnackbarSubProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-snackbar-meta", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

const Group: Component<JSX.HTMLAttributes<HTMLDivElement> & SnackbarSubProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-snackbar-group", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

const Root: Component<SnackbarProps> = (props) => {
  const merged = mergeProps({ variant: "fill" as SnackbarVariants, context: "brand" as Contexts }, props);
  const [local] = splitProps(merged, ["isOpen", "children", "variant", "context"]);
  return (
    <Show when={local.isOpen}>
      <div
        class={mergeClasses(
          "moon-snackbar",
          local.variant !== "fill" && `moon-snackbar-${local.variant}`,
          local.context !== "brand" && `moon-snackbar-${local.context}`
        )}
      >
        {local.children}
      </div>
    </Show>
  );
};

const Snackbar = Object.assign(Root, { Action, Meta, Group });

export default Snackbar;
