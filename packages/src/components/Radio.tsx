import {
  createContext,
  useContext,
  splitProps,
  type Component,
  type JSX,
} from "solid-js";
import mergeClasses from "../helpers/mergeClasses";

type RadioGroupCtx = { name: string };
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
  const name = () => group?.name ?? (local.name as string | undefined);
  if (local.label) {
    return (
      <label class={local.class}>
        <input
          type="radio"
          class="moon-radio"
          name={name()}
          {...rest}
        />
        <span>{local.label}</span>
      </label>
    );
  }
  return (
    <input
      type="radio"
      class={mergeClasses("moon-radio", local.class)}
      name={name()}
      {...rest}
    />
  );
};

const Group: Component<RadioGroupProps> = (props) => {
  const [local] = splitProps(props, ["children", "class", "name"]);
  return (
    <RadioGroupContext.Provider value={{ name: local.name }}>
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
