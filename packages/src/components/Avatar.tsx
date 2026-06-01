import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import User from "../assets/icons/User";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants } from "../types";

export type AvatarSizes = Extract<
  Sizes,
  "xs" | "sm" | "md" | "lg" | "xl" | "2xl"
>;

export type AvatarVariants = Extract<Variants, "fill" | "soft">;

type AvatarProps = JSX.HTMLAttributes<HTMLDivElement> & {
  size?: AvatarSizes;
  variant?: AvatarVariants;
  class?: string;
  children?: JSX.Element;
};

const Avatar: Component<AvatarProps> = (props) => {
  const merged = mergeProps({ size: "md", variant: "fill" } as const, props);
  const [local, rest] = splitProps(merged, ["size", "variant", "class", "children"]);
  return (
    <div
      class={mergeClasses(
        "moon-avatar",
        local.size !== "md" && `moon-avatar-${local.size}`,
        local.variant !== "fill" && `moon-avatar-${local.variant}`,
        local.class
      )}
      {...rest}
    >
      {local.children || <User />}
    </div>
  );
};

export default Avatar;
