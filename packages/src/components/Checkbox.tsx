import { splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  class?: string;
};

const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "label"]);
  if (local.label) {
    return (
      <label class={local.class}>
        <input type="checkbox" class="moon-checkbox" {...rest} />
        <span>{local.label}</span>
      </label>
    );
  }
  return (
    <input
      type="checkbox"
      class={mergeClasses("moon-checkbox", local.class)}
      {...rest}
    />
  );
};

export default Checkbox;
