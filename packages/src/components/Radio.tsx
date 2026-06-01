import {
  createContext,
  useContext,
  splitProps,
  Show,
  type Component,
  type JSX,
} from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

type RadioGroupCtx = { name: () => string };
const RadioGroupContext = createContext<RadioGroupCtx>();

type RadioProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: string;
  class?: string;
};

type RadioGroupProps = {
  children?: JSX.Element;
  class?: string;
  name: string;
};

const Root: Component<RadioProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "label", "name"]);
  const group = useContext(RadioGroupContext);
  const name = () => group?.name() ?? (local.name as string | undefined);
  return (
    <Show
      when={local.label}
      fallback={
        <input
          type="radio"
          class={mergeClasses("moon-radio", local.class)}
          name={name()}
          {...rest}
        />
      }
    >
      {(label) => (
        <label class={local.class}>
          <input
            type="radio"
            class="moon-radio"
            name={name()}
            {...rest}
          />
          <span>{label()}</span>
        </label>
      )}
    </Show>
  );
};

const Group: Component<RadioGroupProps> = (props) => {
  const [local] = splitProps(props, ["children", "class", "name"]);
  return (
    <RadioGroupContext.Provider value={{ name: () => local.name }}>
      <div
        role="radiogroup"
        class={mergeClasses("moon-radio-group", local.class)}
      >
        {local.children}
      </div>
    </RadioGroupContext.Provider>
  );
};

const Radio = Object.assign(Root, { Group });

export default Radio;
