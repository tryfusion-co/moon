import {
  createSignal,
  mergeProps,
  splitProps,
  Index,
  Show,
  type Component,
  type JSX,
} from "solid-js";
import ChevronLeft from "../assets/icons/ChevronLeft";
import ChevronRight from "../assets/icons/ChevronRight";
import mergeClasses from "../helpers/mergeClasses";
import type { Directions } from "../types";

type PaginationProps = {
  length: number;
  class?: string;
  activePage?: number;
  hasControls?: boolean;
  onPageChange?: (page: number) => void;
  renderItem?: (index: number) => JSX.Element;
};

type PaginationItemProps = JSX.HTMLAttributes<HTMLLIElement> & {
  pageIndex: number;
  onPageChange: (page: number) => void;
  currentPage: number;
  children?: JSX.Element;
};

const Item: Component<PaginationItemProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "pageIndex",
    "onPageChange",
    "currentPage",
  ]);
  const isActive = () => local.currentPage === local.pageIndex;
  return (
    <li
      class={mergeClasses(
        "moon-pagination-item",
        isActive() && "moon-pagination-item-active",
        local.class
      )}
      onClick={() => local.onPageChange(local.pageIndex)}
      {...(isActive() ? { "aria-current": "page" } : {})}
      {...rest}
    >
      {local.children}
    </li>
  );
};

type ControlProps = JSX.HTMLAttributes<HTMLLIElement> & {
  direction: Directions;
  disabled?: boolean;
  onClick?: JSX.EventHandlerUnion<HTMLLIElement, MouseEvent>;
};

const Control: Component<ControlProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "direction",
    "class",
    "disabled",
    "onClick",
  ]);
  const isRTL = () => {
    if (typeof document === "undefined") return false;
    const el = document.querySelector(".moon-pagination");
    return el ? getComputedStyle(el).direction === "rtl" : false;
  };
  return (
    <li
      class={mergeClasses(
        "moon-pagination-control",
        local.disabled && "moon-pagination-control-disabled",
        local.class
      )}
      onClick={local.disabled ? undefined : local.onClick}
      aria-label={local.direction === "previous" ? "Previous" : "Next"}
      {...(local.disabled ? { "aria-disabled": "true" } : {})}
      {...rest}
    >
      {local.direction === "previous" ? (
        isRTL() ? <ChevronRight /> : <ChevronLeft />
      ) : isRTL() ? (
        <ChevronLeft />
      ) : (
        <ChevronRight />
      )}
    </li>
  );
};

const Pagination: Component<PaginationProps> = (props) => {
  const merged = mergeProps({ activePage: 0, hasControls: false }, props);
  const [local] = splitProps(merged, [
    "length",
    "class",
    "activePage",
    "hasControls",
    "onPageChange",
    "renderItem",
  ]);
  const [currentPage, setCurrentPage] = createSignal(local.activePage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    local.onPageChange?.(page);
  };
  return (
    <nav role="navigation" aria-label="pagination">
      <ul class={mergeClasses("moon-pagination", local.class)}>
        <Show when={local.hasControls}>
          <Control
            direction="previous"
            disabled={currentPage() === 0}
            onClick={() => handlePageChange(currentPage() - 1)}
          />
        </Show>
        <Index each={Array.from({ length: local.length })}>
          {(_, index) => (
            <Item
              pageIndex={index}
              onPageChange={handlePageChange}
              currentPage={currentPage()}
            >
              {local.renderItem ? local.renderItem(index) : index + 1}
            </Item>
          )}
        </Index>
        <Show when={local.hasControls}>
          <Control
            direction="next"
            disabled={currentPage() === local.length - 1}
            onClick={() => handlePageChange(currentPage() + 1)}
          />
        </Show>
      </ul>
    </nav>
  );
};

export default Pagination;
