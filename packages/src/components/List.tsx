import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes } from "../types";

export type ListSizes = Extract<Sizes, "sm" | "md" | "lg">;

type ListProps = JSX.HTMLAttributes<HTMLUListElement> & {
  size?: ListSizes;
};

const Item: Component<JSX.HTMLAttributes<HTMLLIElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <li class={mergeClasses("moon-list-item", local.class)} {...rest}>
      {local.children}
    </li>
  );
};

const Meta: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div class={mergeClasses("moon-list-item-meta", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

const Root: Component<ListProps> = (props) => {
  const merged = mergeProps({ size: "md" as ListSizes }, props);
  const [local, rest] = splitProps(merged, ["class", "size", "children"]);
  return (
    <ul
      class={mergeClasses(
        "moon-list",
        local.size !== "md" && `moon-list-${local.size}`,
        local.class
      )}
      {...rest}
    >
      {local.children}
    </ul>
  );
};

const List = Object.assign(Root, { Item, Meta });

export default List;
