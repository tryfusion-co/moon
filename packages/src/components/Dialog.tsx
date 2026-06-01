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

type DialogContextType = {
  dialogRef: Accessor<HTMLDialogElement | undefined>;
  setDialogRef: (el: HTMLDialogElement) => void;
};

const DialogContext = createContext<DialogContextType>();

function useDialogContext() {
  const c = useContext(DialogContext);
  if (!c) throw new Error("Dialog components must be used within <Dialog>");
  return c;
}

type DialogProps = {
  children?: JSX.Element;
};

const Trigger: Component<DialogProps> = (props) => {
  const { dialogRef } = useDialogContext();
  const [local] = splitProps(props, ["children"]);
  return (
    <p onClick={() => dialogRef()?.showModal()}>{local.children}</p>
  );
};

const Content: Component<DialogProps> = (props) => {
  const { setDialogRef } = useDialogContext();
  const [local] = splitProps(props, ["children"]);
  return (
    <Portal mount={document.body}>
      <dialog class={mergeClasses("moon-dialog")} ref={setDialogRef}>
        <div class="moon-dialog-box">{local.children}</div>
        <form method="dialog" class="moon-backdrop">
          <button></button>
        </form>
      </dialog>
    </Portal>
  );
};

const Header: Component<DialogProps> = (props) => {
  const [local] = splitProps(props, ["children"]);
  return <header class="moon-dialog-header">{local.children}</header>;
};

const Close: Component = () => {
  const { dialogRef } = useDialogContext();
  return (
    <button
      class="moon-dialog-close"
      aria-label="Close"
      onClick={() => dialogRef()?.close()}
    >
      <CloseIcon />
    </button>
  );
};

const Root: Component<DialogProps> = (props) => {
  const [local] = splitProps(props, ["children"]);
  const [dialogRef, setDialogRef] = createSignal<HTMLDialogElement>();
  return (
    <DialogContext.Provider value={{ dialogRef, setDialogRef }}>
      {local.children}
    </DialogContext.Provider>
  );
};

const Dialog = Object.assign(Root, { Trigger, Content, Close, Header });

export default Dialog;
