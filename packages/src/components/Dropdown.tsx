import { splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

type DropdownProps = {
  children?: JSX.Element;
  class?: string;
};

type DropdownTriggerProps = {
  children?: JSX.Element;
};

type DropdownContentProps = {
  children?: JSX.Element;
  class?: string;
};

const Trigger: Component<DropdownTriggerProps> = (props) => {
  const [local] = splitProps(props, ["children"]);
  return (
    <span style={{ display: "contents" }} tabIndex={0} role="button">
      {local.children}
    </span>
  );
};

const Content: Component<DropdownContentProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div tabIndex={0} class={mergeClasses("moon-dropdown-content", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

const Root: Component<DropdownProps> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-dropdown", local.class)} {...rest}>
      {local.children}
    </div>
  );
};

const Dropdown = Object.assign(Root, { Trigger, Content });

export default Dropdown;
