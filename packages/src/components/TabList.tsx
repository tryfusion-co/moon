import {
  createContext,
  useContext,
  createSignal,
  mergeProps,
  splitProps,
  untrack,
  type Component,
  type JSX,
} from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import type { Sizes } from "../types";

export type TabListSizes = Extract<Sizes, "sm" | "md">;

type TabListContextType = {
  activeIndex: () => number;
  handleTabChange: (_i: number) => void;
  register: () => number;
};

const TabListContext = createContext<TabListContextType>();

function useTabListContext() {
  const c = useContext(TabListContext);
  if (!c)
    throw new Error(
      "TabList components must be used within <TabList> wrapper"
    );
  return c;
}

type TabListProps = {
  children?: JSX.Element;
  size?: TabListSizes;
  defaultActiveIndex?: number;
  class?: string;
  onTabChange?: (_index: number) => void;
};

type TabProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: JSX.Element;
  class?: string;
  index?: number;
};

const Item: Component<TabProps> = (props) => {
  const ctx = useTabListContext();
  const [local, rest] = splitProps(props, ["children", "class", "index"]);
  const index = untrack(() => local.index !== undefined ? local.index : ctx.register());
  const isActive = () => ctx.activeIndex() === index;
  return (
    <li>
      <button
        role="tab"
        aria-selected={isActive()}
        class={mergeClasses(
          "moon-tab-list-item",
          isActive() && "moon-tab-list-item-active",
          local.class
        )}
        on:click={() => ctx.handleTabChange(index)}
        tabIndex={isActive() ? 0 : -1}
        {...rest}
      >
        {local.children}
      </button>
    </li>
  );
};

const Root: Component<TabListProps> = (props) => {
  const merged = mergeProps({ size: "md" as TabListSizes, defaultActiveIndex: 0 }, props);
  const [local] = splitProps(merged, [
    "children",
    "size",
    "defaultActiveIndex",
    "class",
    "onTabChange",
  ]);
  const [internal, setInternal] = createSignal(local.defaultActiveIndex);
  const handleTabChange = (i: number) => {
    setInternal(i);
    local.onTabChange?.(i);
  };
  // NOTE: register() assumes static children only (counter is never reset).
  // For dynamic children use explicit `index` props on each Item.
  let counter = 0;
  const register = () => counter++;
  return (
    <TabListContext.Provider value={{ activeIndex: internal, handleTabChange, register }}>
      <ul
        role="tablist"
        class={mergeClasses(
          "moon-tab-list",
          local.size !== "md" && `moon-tab-list-${local.size}`,
          local.class
        )}
      >
        {local.children}
      </ul>
    </TabListContext.Provider>
  );
};

const TabList = Object.assign(Root, { Item });

export default TabList;
