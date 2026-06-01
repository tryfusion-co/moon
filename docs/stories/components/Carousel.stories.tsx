import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Carousel as CarouselComponent } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import { For } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof CarouselComponent> & {
  hasControls?: boolean;
};

const meta: Meta<Type> = {
  title: 'Content display/Carousel',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="Carousel" />
      ),
    },
  },
  argTypes: {
    hasControls: {
      description: 'Has controls or not',
      control: { type: 'boolean' },
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
  render: ({ hasControls, ...props }) => {
    const carouselProps = {
      ...props,
    };
    const items = new Array(5).fill('');
    return (
      <CarouselComponent {...carouselProps} hasControls={hasControls}>
        <For each={items}>
          {(_, index) => (
            <CarouselComponent.Item>
              <div class="flex items-center justify-center h-40 w-2xs bg-brand-subtle text-brand">
                Item {index() + 1}
              </div>
            </CarouselComponent.Item>
          )}
        </For>
      </CarouselComponent>
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const Carousel: Story = {
  args: {
    hasControls: false,
  },
};
