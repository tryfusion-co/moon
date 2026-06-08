import {
  createContext,
  createSignal,
  mergeProps,
  useContext,
  splitProps,
  Show,
  type Accessor,
  type Component,
  type JSX,
} from "solid-js";
import { Portal } from "solid-js/web";
import CloseIcon from "../assets/icons/Close";
import mergeClasses from "../helpers/mergeClasses";

type BottomSheetContextType = {
  bottomSheetRef: Accessor<HTMLDialogElement | undefined>;
  setBottomSheetRef: (_el: HTMLDialogElement) => void;
  hasHandle: () => boolean;
};

const BottomSheetContext = createContext<BottomSheetContextType>();

function useBottomSheetContext() {
  const c = useContext(BottomSheetContext);
  if (!c)
    throw new Error("BottomSheet components must be inside <BottomSheet>");
  return c;
}

type BottomSheetProps = {
  children?: JSX.Element;
  class?: string;
  hasHandle?: boolean;
};

type ComponentProps = {
  children?: JSX.Element;
  class?: string;
};

type CloseProps = {
  onClick?: () => void;
  class?: string;
};

const Trigger: Component<{ children?: JSX.Element }> = (props) => {
  const { bottomSheetRef } = useBottomSheetContext();
  const [local] = splitProps(props, ["children"]);
  return (
    <span style={{ display: "contents" }} on:click={() => bottomSheetRef()?.showModal()}>
      {local.children}
    </span>
  );
};

const Header: Component<ComponentProps> = (props) => {
  const [local] = splitProps(props, ["children", "class"]);
  return (
    <header class={mergeClasses("moon-bottom-sheet-header", local.class)}>
      {local.children}
    </header>
  );
};

const Content: Component<ComponentProps> = (props) => {
  const { setBottomSheetRef, hasHandle } = useBottomSheetContext();
  const [local] = splitProps(props, ["children", "class"]);
  return (
    <Portal mount={document.body}>
      <dialog
        class={mergeClasses("moon-bottom-sheet", local.class)}
        ref={setBottomSheetRef}
      >
        <div class="moon-bottom-sheet-box">
          <Show when={hasHandle()}>
            <div class="moon-bottom-sheet-handle" />
          </Show>
          {local.children}
        </div>
        <form method="dialog" class="moon-backdrop">
          <button />
        </form>
      </dialog>
    </Portal>
  );
};

const Close: Component<CloseProps> = (props) => {
  const { bottomSheetRef } = useBottomSheetContext();
  const [local] = splitProps(props, ["onClick", "class"]);
  return (
    <button
      class={mergeClasses("moon-bottom-sheet-close", local.class)}
      aria-label="Close"
      on:click={() => {
        bottomSheetRef()?.close();
        local.onClick?.();
      }}
    >
      <CloseIcon />
    </button>
  );
};

const Root: Component<BottomSheetProps> = (props) => {
  const merged = mergeProps({ hasHandle: false }, props);
  const [local] = splitProps(merged, ["children", "hasHandle"]);
  const [bottomSheetRef, setBottomSheetRef] = createSignal<HTMLDialogElement>();
  return (
    <BottomSheetContext.Provider
      value={{ bottomSheetRef, setBottomSheetRef, hasHandle: () => local.hasHandle }}
    >
      {local.children}
    </BottomSheetContext.Provider>
  );
};

const BottomSheet = Object.assign(Root, { Trigger, Content, Close, Header });

export default BottomSheet;
