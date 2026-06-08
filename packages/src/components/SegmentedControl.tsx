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

export type SegmentedControlSizes = Extract<Sizes, "sm" | "md">;

type SegmentedControlContextType = {
  activeIndex: () => number;
  setActiveIndex: (_idx: number) => void;
  size: SegmentedControlSizes;
  register: () => number;
};

const SegmentedControlContext = createContext<SegmentedControlContextType>();

function useSegmentedControlContext() {
  const c = useContext(SegmentedControlContext);
  if (!c)
    throw new Error(
      "SegmentedControl components must be used within <SegmentedControl> wrapper"
    );
  return c;
}

type SegmentedControlProps = {
  children?: JSX.Element;
  size?: SegmentedControlSizes;
  activeIndex?: number;
  setActiveIndex?: (_idx: number) => void;
  class?: string;
};

type SegmentProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  children?: JSX.Element;
  class?: string;
  index?: number;
};

const Item: Component<SegmentProps> = (props) => {
  const ctx = useSegmentedControlContext();
  const [local, rest] = splitProps(props, ["children", "class", "index"]);
  const index = untrack(() => local.index !== undefined ? local.index : ctx.register());
  const isActive = () => ctx.activeIndex() === index;
  return (
    <button
      role="tab"
      aria-selected={isActive()}
      class={mergeClasses(
        "moon-segmented-control-item",
        isActive() && "moon-segmented-control-item-active",
        local.class
      )}
      on:click={() => ctx.setActiveIndex(index)}
      tabIndex={isActive() ? 0 : -1}
      {...rest}
    >
      {local.children}
    </button>
  );
};

const Root: Component<SegmentedControlProps> = (props) => {
  const merged = mergeProps({ size: "md" as SegmentedControlSizes }, props);
  const [local] = splitProps(merged, [
    "children",
    "size",
    "activeIndex",
    "setActiveIndex",
    "class",
  ]);
  const [internal, setInternal] = createSignal(0);
  const activeIndex = () => local.activeIndex ?? internal();
  const setActiveIndex = (idx: number) => {
    if (local.setActiveIndex) {
      local.setActiveIndex(idx);
    } else {
      setInternal(idx);
    }
  };
  // NOTE: register() assumes static children only (counter is never reset).
  // Matches React original which also used static Children.map at render time.
  // For dynamic children use explicit `index` props on each Item.
  let counter = 0;
  const register = () => counter++;
  return (
    <SegmentedControlContext.Provider
      value={{ activeIndex, setActiveIndex, size: untrack(() => local.size), register }}
    >
      <div
        role="tablist"
        class={mergeClasses(
          "moon-segmented-control",
          local.size !== "md" && `moon-segmented-control-${local.size}`,
          local.class
        )}
      >
        {local.children}
      </div>
    </SegmentedControlContext.Provider>
  );
};

const SegmentedControl = Object.assign(Root, { Item });

export default SegmentedControl;
