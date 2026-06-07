import { createSignal, mergeProps, onMount, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants } from "../types";

export type ChipSizes = Extract<Sizes, "sm" | "md">;
export type ChipVariants = Extract<Variants, "fill" | "soft" | "outline">;

type ChipProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: ChipSizes;
  variant?: ChipVariants;
  isActive?: boolean;
  children?: JSX.Element;
};

const Chip: Component<ChipProps> = (props) => {
  const merged = mergeProps({ size: "md", variant: "fill" } as const, props);
  const [local, rest] = splitProps(merged, [
    "class",
    "size",
    "variant",
    "isActive",
    "onClick",
    "children",
  ]);
  const [active, setActive] = createSignal(false);
  const currentActive = () => local.isActive ?? active();
  let ref!: HTMLButtonElement;
  onMount(() => {
    ref.addEventListener("click", (e) => {
      const ev = e as unknown as MouseEvent & { currentTarget: HTMLButtonElement; target: Element };
      if (local.isActive === undefined) {
        setActive(!active());
      }
      if (typeof local.onClick === "function") {
        local.onClick(ev);
      } else if (Array.isArray(local.onClick)) {
        local.onClick[0](local.onClick[1], ev);
      }
    });
  });
  return (
    <button
      ref={ref}
      class={mergeClasses(
        "moon-chip",
        local.size !== "md" && `moon-chip-${local.size}`,
        local.variant !== "fill" && `moon-chip-${local.variant}`,
        currentActive() && "moon-chip-active",
        local.class
      )}
      {...rest}
    >
      {local.children}
    </button>
  );
};

export default Chip;
