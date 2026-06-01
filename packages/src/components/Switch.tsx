import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes } from "../types";

export type SwitchSizes = Extract<Sizes, "2xs" | "xs" | "sm">;

type SwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "size"> & {
  checked?: boolean;
  // Public prop name `onChange` is preserved for API parity with the React version.
  // Internally, we bind `onInput` instead of `onChange` on the DOM input element,
  // because React's onChange fires on every keystroke/toggle (mapped to the native
  // `input` event), while Solid's onChange fires only on blur (native `change` event).
  // Per D-02 / Pitfall 9: use onInput for immediate toggle semantics (Solid correct).
  onChange?: () => void;
  disabled?: boolean;
  label?: string;
  size?: SwitchSizes;
  class?: string;
};

const Switch: Component<SwitchProps> = (props) => {
  const merged = mergeProps({ size: "sm" } as const, props);
  const [local, rest] = splitProps(merged, ["onChange", "onInput", "size", "label", "class"]);

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = () => {
    if (typeof local.onChange === "function") {
      local.onChange();
    }
  };

  return (
    <label>
      {local.label && local.label}
      <input
        type="checkbox"
        onInput={handleInput}
        class={mergeClasses(
          "moon-switch",
          local.size !== "sm" && `moon-switch-${local.size}`,
          local.class
        )}
        {...rest}
      />
    </label>
  );
};

export default Switch;
