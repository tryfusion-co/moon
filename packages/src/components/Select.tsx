import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants } from "../types";

export type SelectSizes = Extract<Sizes, "sm" | "md" | "lg" | "xl">;

export type SelectVariants = Extract<Variants, "fill" | "outline">;

// Public prop name `onChange` is preserved for API parity with the React version.
// Internally, we bind `onInput` instead of `onChange` on the DOM select element,
// because React's onChange fires on every selection (mapped to the native `input` event),
// while Solid's onChange fires only on blur/commit (native `change` event).
type SelectProps = Omit<JSX.SelectHTMLAttributes<HTMLSelectElement>, "onChange"> & {
  size?: SelectSizes;
  variant?: SelectVariants;
  error?: boolean;
  children?: JSX.Element;
  class?: string;
  onChange?: JSX.EventHandler<HTMLSelectElement, Event>;
};

type OptionProps = JSX.OptionHTMLAttributes<HTMLOptionElement> & {
  children?: JSX.Element;
};

type OptionGroupProps = JSX.OptgroupHTMLAttributes<HTMLOptGroupElement> & {
  children?: JSX.Element;
  label: string;
  disabled?: boolean;
};

const Option: Component<OptionProps> = (props) => {
  const [local, rest] = splitProps(props, ["children"]);
  return <option {...rest}>{local.children}</option>;
};

const OptionGroup: Component<OptionGroupProps> = (props) => {
  const [local, rest] = splitProps(props, ["children"]);
  return <optgroup {...rest}>{local.children}</optgroup>;
};

const Root: Component<SelectProps> = (props) => {
  const merged = mergeProps({ size: "md" as SelectSizes, variant: "fill" as SelectVariants, error: false }, props);
  const [local, rest] = splitProps(merged, ["children", "size", "variant", "error", "class", "onChange"]);

  const handleInput: JSX.EventHandler<HTMLSelectElement, InputEvent> = (e) => {
    if (typeof local.onChange === "function") {
      local.onChange(e as any);
    }
  };

  return (
    <select
      class={mergeClasses(
        "moon-select",
        local.size !== "md" && `moon-select-${local.size}`,
        local.variant !== "fill" && `moon-select-${local.variant}`,
        local.error && "moon-select-error",
        local.class
      )}
      onInput={handleInput}
      {...rest}
    >
      {local.children}
    </select>
  );
};

const Select = Object.assign(Root, { Option, OptionGroup });

export default Select;
