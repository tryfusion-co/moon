import {
  createContext,
  createSignal,
  useContext,
  splitProps,
  type Accessor,
  type Component,
  type JSX,
} from "solid-js";
import { Portal } from "solid-js/web";
import CloseIcon from "../assets/icons/Close";
import mergeClasses from "../helpers/mergeClasses";

type DrawerContextType = {
  drawerRef: Accessor<HTMLDialogElement | undefined>;
  setDrawerRef: (_el: HTMLDialogElement) => void;
};

const DrawerContext = createContext<DrawerContextType>();

function useDrawerContext() {
  const c = useContext(DrawerContext);
  if (!c) throw new Error("Drawer components must be used within <Drawer>");
  return c;
}

type DrawerProps = {
  children?: JSX.Element;
};

type DrawerContentProps = {
  children?: JSX.Element;
  class?: string;
};

type DrawerHeaderProps = {
  children?: JSX.Element;
  class?: string;
};

type DrawerCloseProps = {
  onClick?: () => void;
  class?: string;
};

const Trigger: Component<DrawerProps> = (props) => {
  const { drawerRef } = useDrawerContext();
  const [local] = splitProps(props, ["children"]);
  return (
    <span style={{ display: "contents" }} onClick={() => drawerRef()?.showModal()}>
      {local.children}
    </span>
  );
};

const Header: Component<DrawerHeaderProps> = (props) => {
  const [local] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-drawer-header", local.class)}>
      {local.children}
    </div>
  );
};

const Content: Component<DrawerContentProps> = (props) => {
  const { setDrawerRef } = useDrawerContext();
  const [local] = splitProps(props, ["children", "class"]);
  return (
    <Portal mount={document.body}>
      <dialog class={mergeClasses("moon-drawer", local.class)} ref={setDrawerRef}>
        <div class="moon-drawer-box">{local.children}</div>
        <form method="dialog" class="moon-backdrop">
          <button />
        </form>
      </dialog>
    </Portal>
  );
};

const Close: Component<DrawerCloseProps> = (props) => {
  const { drawerRef } = useDrawerContext();
  const [local] = splitProps(props, ["onClick", "class"]);
  return (
    <button
      class={mergeClasses("moon-drawer-close", local.class)}
      aria-label="Close"
      onClick={() => {
        drawerRef()?.close();
        local.onClick?.();
      }}
    >
      <CloseIcon />
    </button>
  );
};

const Root: Component<DrawerProps> = (props) => {
  const [local] = splitProps(props, ["children"]);
  const [drawerRef, setDrawerRef] = createSignal<HTMLDialogElement>();
  return (
    <DrawerContext.Provider value={{ drawerRef, setDrawerRef }}>
      {local.children}
    </DrawerContext.Provider>
  );
};

const Drawer = Object.assign(Root, { Trigger, Content, Close, Header });

export default Drawer;
