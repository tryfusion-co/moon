import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { Placeholder as PlaceholderComponent } from "@moondesignsystem/solid";
import type { ComponentProps } from "solid-js";
import LinksBlock from "../shared/LinksBlock";

type Type = ComponentProps<typeof PlaceholderComponent>;

const meta: Meta<Type> = {
  title: "Indicators & status/Placeholder",
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="Placeholder" />
      ),
    },
  },
  render: ({ ...props }) => {
    const placeholderProps = {
      ...props,
    };
    return (
      <div class="w-40 h-20">
        <PlaceholderComponent {...placeholderProps} />
      </div>
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const Placeholder: Story = { args: {} };
