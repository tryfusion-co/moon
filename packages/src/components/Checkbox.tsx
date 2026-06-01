import { Show, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

// Public prop name `onChange` is preserved for API parity with the React version.
// Internally, we bind `onInput` instead of `onChange` on the DOM input element,
// because React's onChange fires on every toggle (mapped to the native `input` event),
// while Solid's onChange fires only on blur (native `change` event).
// Per D-02 / Pitfall 9: use onInput for immediate toggle semantics (Solid correct).
type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> & {
  label?: string;
  class?: string;
  onChange?: JSX.EventHandler<HTMLInputElement, Event>;
};

const Checkbox: Component<CheckboxProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "label", "onChange"]);

  const handleInput: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    if (typeof local.onChange === "function") {
      local.onChange(e);
    }
  };

  return (
    <Show
      when={local.label}
      fallback={
        <input
          type="checkbox"
          class={mergeClasses("moon-checkbox", local.class)}
          onInput={handleInput}
          {...rest}
        />
      }
    >
      {(label) => (
        <label class={local.class}>
          <input type="checkbox" class="moon-checkbox" onInput={handleInput} {...rest} />
          <span>{label()}</span>
        </label>
      )}
    </Show>
  );
};

export default Checkbox;
