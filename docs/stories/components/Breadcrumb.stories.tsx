import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Breadcrumb as BreadcrumbComponent } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import { For } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof BreadcrumbComponent>;

const meta: Meta<Type> = {
  title: 'Navigation/Breadcrumb',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="Breadcrumb" />
      ),
    },
  },
  render: ({ ...props }) => {
    const breadcrumbProps = {
      ...props,
    };
    const items = new Array(5).fill('');
    return (
      <BreadcrumbComponent {...breadcrumbProps}>
        <For each={items}>
          {(_, index) => (
            <BreadcrumbComponent.Item isActive={index() === items.length - 1}>
              {index() === items.length - 1 ? (
                `Page ${index() + 1}`
              ) : (
                <a href="#">Page {index() + 1}</a>
              )}
            </BreadcrumbComponent.Item>
          )}
        </For>
      </BreadcrumbComponent>
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const Breadcrumb: Story = { args: {} };
