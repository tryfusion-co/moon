import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { SegmentedControl as SegmentedControlComponent } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import { createSignal, For } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof SegmentedControlComponent>;

const meta: Meta<Type> = {
  title: 'Forms & selection controls/Segmented Control',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="SegmentedControl" />
      ),
    },
  },
  argTypes: {
    size: {
      description: 'Defines Segmented Control size',
      options: ['sm', 'md'],
      control: 'select',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
  },
  render: ({ size, activeIndex: controlledActiveIndex, ...props }) => {
    const [localActiveIndex, setLocalActiveIndex] = createSignal(0);
    const segmentedControlProps = {
      ...props,
      ...(size !== 'md' && { size }),
      ...(controlledActiveIndex !== undefined && {
        activeIndex: controlledActiveIndex,
        setActiveIndex: setLocalActiveIndex,
      }),
    };
    const items = new Array(3).fill('');
    return (
      <SegmentedControlComponent {...segmentedControlProps}>
        <For each={items}>
          {(_, index) => (
            <SegmentedControlComponent.Item>
              Item {index() + 1}
            </SegmentedControlComponent.Item>
          )}
        </For>
      </SegmentedControlComponent>
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const SegmentedControl: Story = {
  args: { size: 'md' },
};
