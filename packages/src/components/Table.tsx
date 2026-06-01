import { mergeProps, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes } from "../types";

export type TableSizes = Extract<Sizes, "sm" | "md" | "lg" | "xl">;

type TableProps = JSX.HTMLAttributes<HTMLTableElement> & {
  size?: TableSizes;
};

const Head: Component<JSX.HTMLAttributes<HTMLTableSectionElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <thead class={local.class} {...rest} />;
};

const Body: Component<JSX.HTMLAttributes<HTMLTableSectionElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <tbody class={local.class} {...rest} />;
};

const Foot: Component<JSX.HTMLAttributes<HTMLTableSectionElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <tfoot class={local.class} {...rest} />;
};

const Row: Component<JSX.HTMLAttributes<HTMLTableRowElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <tr class={local.class} {...rest} />;
};

const HeadCell: Component<JSX.ThHTMLAttributes<HTMLTableCellElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <th class={local.class} {...rest} />;
};

const Cell: Component<JSX.TdHTMLAttributes<HTMLTableCellElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <td class={local.class} {...rest} />;
};

const Caption: Component<JSX.HTMLAttributes<HTMLTableCaptionElement>> = (props) => {
  const [local, rest] = splitProps(props, ["class"]);
  return <caption class={local.class} {...rest} />;
};

const Root: Component<TableProps> = (props) => {
  const merged = mergeProps({ size: "md" as TableSizes }, props);
  const [local, rest] = splitProps(merged, ["class", "size"]);
  return (
    <table
      class={mergeClasses(
        "moon-table",
        local.size !== "md" && `moon-table-${local.size}`
      )}
      {...rest}
    />
  );
};

const Table = Object.assign(Root, {
  Head,
  Body,
  Foot,
  Row,
  HeadCell,
  Cell,
  Caption,
});

export default Table;
