import { splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

type BreadcrumbProps = {
  children?: JSX.Element;
  class?: string;
};

type BreadcrumbItemProps = JSX.LiHTMLAttributes<HTMLLIElement> & {
  isActive?: boolean;
};

const Item: Component<BreadcrumbItemProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "isActive"]);
  return (
    <li
      class={mergeClasses(
        "moon-breadcrumb-item",
        local.isActive && "moon-breadcrumb-item-active",
        local.class
      )}
      {...rest}
    />
  );
};

const Root: Component<BreadcrumbProps> = (props) => {
  const [local] = splitProps(props, ["children", "class"]);
  return (
    <nav>
      <ol class={mergeClasses("moon-breadcrumb", local.class)}>
        {local.children}
      </ol>
    </nav>
  );
};

const Breadcrumb = Object.assign(Root, { Item });

export default Breadcrumb;
