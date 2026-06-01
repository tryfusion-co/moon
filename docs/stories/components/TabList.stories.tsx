import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { TabList as TabListComponent } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import { For } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof TabListComponent>;

const meta: Meta<Type> = {
  title: 'Navigation/Tab List',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="TabList" />
      ),
    },
  },
  argTypes: {
    size: {
      description: 'Defines TabList size',
      options: ['sm', 'md'],
      control: 'select',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
  },
  render: ({ size, ...props }) => {
    const tabListProps = {
      ...props,
      ...(size !== 'md' && { size }),
    };
    const items = new Array(3).fill('');
    return (
      <TabListComponent {...tabListProps}>
        <For each={items}>
          {(_, index) => (
            <TabListComponent.Item index={index()}>
              Item {index() + 1}
            </TabListComponent.Item>
          )}
        </For>
      </TabListComponent>
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const TabList: Story = { args: { size: 'md' } };
