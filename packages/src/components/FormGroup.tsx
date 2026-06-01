import { splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

type RootProps = JSX.HTMLAttributes<HTMLDivElement> & {
  error?: boolean;
  class?: string;
  children?: JSX.Element;
};

type LabelProps = JSX.LabelHTMLAttributes<HTMLLabelElement> & {
  class?: string;
  children?: JSX.Element;
};

type HintProps = JSX.HTMLAttributes<HTMLParagraphElement> & {
  class?: string;
  children?: JSX.Element;
};

const Root: Component<RootProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "error", "children"]);
  return (
    <div
      class={mergeClasses(
        "moon-form-group",
        local.error && "moon-form-group-error",
        local.class
      )}
      {...rest}
    >
      {local.children}
    </div>
  );
};

const Label: Component<LabelProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <label class={local.class} {...rest}>
      {local.children}
    </label>
  );
};

const Hint: Component<HintProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <p class={mergeClasses("moon-form-hint", local.class)} {...rest}>
      {local.children}
    </p>
  );
};

const FormGroup = Object.assign(Root, { Label, Hint });

export default FormGroup;
