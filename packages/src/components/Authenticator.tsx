import { createSignal, mergeProps, splitProps, untrack, Index, type Component } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Variants, Sizes } from "../types";

export type AuthenticatorSizes = Extract<Sizes, "sm" | "md" | "lg" | "xl">;

export type AuthenticatorVariants = Extract<Variants, "fill" | "outline">;

type AuthenticatorProps = {
  id?: string;
  length?: number;
  size?: AuthenticatorSizes;
  variant?: AuthenticatorVariants;
  error?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (_value: string) => void;
  class?: string;
};

const Authenticator: Component<AuthenticatorProps> = (props) => {
  const merged = mergeProps(
    {
      id: "",
      length: 6,
      size: "md" as AuthenticatorSizes,
      variant: "fill" as AuthenticatorVariants,
      error: false,
      disabled: false,
      value: "",
    },
    props
  );
  const [local] = splitProps(merged, [
    "id",
    "length",
    "size",
    "variant",
    "error",
    "disabled",
    "value",
    "onChange",
    "class",
  ]);

  const [internalValue, setInternalValue] = createSignal(untrack(() => local.value));
  let inputs: HTMLInputElement[] = [];

  const handleChange = (index: number, char: string) => {
    const arr = internalValue().split("");
    arr[index] = char;
    const next = arr.join("");
    setInternalValue(next);
    local.onChange?.(next);
    if (char && index < local.length - 1) {
      inputs[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent & { currentTarget: HTMLInputElement }) => {
    if (e.key === "Backspace" && !internalValue()[index] && index > 0) {
      inputs[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent & { currentTarget: HTMLInputElement }) => {
    const pasted = e.clipboardData?.getData("text").slice(0, local.length) ?? "";
    const clean = pasted.replace(/[^0-9a-zA-Z]/g, "").slice(0, local.length);

    if (clean) {
      setInternalValue(clean.padEnd(local.length, ""));
      local.onChange?.(clean);
      inputs[Math.min(clean.length, local.length - 1)]?.focus();
      e.preventDefault();
    }
  };

  return (
    <div
      class={mergeClasses(
        "moon-authenticator",
        local.size !== "md" && `moon-authenticator-${local.size}`,
        local.variant !== "fill" && `moon-authenticator-${local.variant}`,
        local.error && "moon-authenticator-error",
        local.class
      )}
      role="group"
    >
      <Index each={Array.from({ length: local.length })}>
        {(_, index) => (
          <input
            id={index === 0 ? local.id : `${local.id}${index}`}
            ref={(el) => (inputs[index] = el)}
            type="text"
            maxLength={1}
            value={internalValue()[index] || ""}
            onInput={(e) => handleChange(index, e.currentTarget.value.slice(-1))}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            autocomplete="off"
            inputMode="text"
            pattern="[0-9a-zA-Z]*"
            disabled={local.disabled}
          />
        )}
      </Index>
    </div>
  );
};

export default Authenticator;
