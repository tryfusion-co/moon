import {
  createSignal,
  mergeProps,
  splitProps,
  type Component,
  type JSX,
} from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes, Variants } from "../types";
import ChevronDown from "../assets/icons/ChevronDown";

export type AccordionSizes = Extract<Sizes, "sm" | "md" | "lg" | "xl">;
export type AccordionVariants = Extract<Variants, "fill" | "ghost" | "outline">;

type AccordionProps = {
  size?: AccordionSizes;
  variant?: AccordionVariants;
  class?: string;
  children?: JSX.Element;
};

type ItemProps = {
  initiallyOpen?: boolean;
  class?: string;
  children?: JSX.Element;
};

const Item: Component<ItemProps> = (props) => {
  const merged = mergeProps({ initiallyOpen: false }, props);
  const [local] = splitProps(merged, ["initiallyOpen", "children", "class"]);
  const [isOpen, setIsOpen] = createSignal(local.initiallyOpen);
  return (
    <details
      class={mergeClasses(
        "moon-accordion-item",
        isOpen() && "moon-accordion-open",
        local.class
      )}
      open={isOpen()}
      onToggle={(e) => setIsOpen(e.currentTarget.open)}
    >
      {local.children}
    </details>
  );
};

const Header: Component<JSX.HTMLAttributes<HTMLElement>> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <summary
      class={mergeClasses("moon-accordion-item-header", local.class)}
      {...rest}
    >
      {local.children}
    </summary>
  );
};

const Toggle: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div
      class={mergeClasses("moon-accordion-item-toggle", local.class)}
      {...rest}
    >
      {local.children || <ChevronDown />}
    </div>
  );
};

const Content: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div
      class={mergeClasses("moon-accordion-item-content", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

const Meta: Component<JSX.HTMLAttributes<HTMLDivElement>> = (props) => {
  const [local, rest] = splitProps(props, ["children", "class"]);
  return (
    <div
      class={mergeClasses("moon-accordion-item-meta", local.class)}
      {...rest}
    >
      {local.children}
    </div>
  );
};

const Root: Component<AccordionProps> = (props) => {
  const merged = mergeProps(
    { size: "md" as AccordionSizes, variant: "fill" as AccordionVariants },
    props
  );
  const [local] = splitProps(merged, ["size", "variant", "class", "children"]);
  return (
    <div
      class={mergeClasses(
        "moon-accordion",
        local.size !== "md" && `moon-accordion-${local.size}`,
        local.variant !== "fill" && `moon-accordion-${local.variant}`,
        local.class
      )}
    >
      {local.children}
    </div>
  );
};

const Accordion = Object.assign(Root, {
  Item,
  Header,
  Toggle,
  Content,
  Meta,
});

export default Accordion;
