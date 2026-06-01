import { splitProps, type Component } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

type PlaceholderProps = { class?: string };

const Placeholder: Component<PlaceholderProps> = (props) => {
  const [local] = splitProps(props, ["class"]);
  return <div class={mergeClasses("moon-placeholder", local.class)} />;
};

export default Placeholder;
