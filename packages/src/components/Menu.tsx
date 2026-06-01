import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes } from "../types";

export type MenuSizes = Extract<Sizes, "sm" | "md" | "lg">;

type BaseProps = {
  children?: JSX.Element;
  class?: string;
};

type MenuProps = JSX.HTMLAttributes<HTMLUListElement> &
  BaseProps & {
    size?: MenuSizes;
  };

const Item: Component<JSX.HTMLAttributes<HTMLLIElement> & BaseProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <li class={mergeClasses("moon-menu-item", local.class)} {...rest}>
      {local.children}
    </li>
  );
};

const Meta: Component<JSX.HTMLAttributes<HTMLDivElement> & BaseProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-menu-item-meta", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

const Root: Component<MenuProps> = (props) => {
  const merged = mergeProps({ size: "md" as MenuSizes }, props);
  const [local, rest] = splitProps(merged, ["children", "size", "class"]);
  return (
    <ul
      class={mergeClasses(
        "moon-menu",
        local.size !== "md" && `moon-menu-${local.size}`,
        local.class
      )}
      {...rest}
    >
      {local.children}
    </ul>
  );
};

const Menu = Object.assign(Root, { Item, Meta });

export default Menu;
