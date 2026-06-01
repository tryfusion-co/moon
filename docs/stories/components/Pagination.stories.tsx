import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Pagination as PaginationComponent } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof PaginationComponent>;

const meta: Meta<Type> = {
  title: 'Navigation/Pagination',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="Pagination" />
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
  render: ({ ...props }) => {
    const paginationProps = {
      ...props,
    };
    return (
      <PaginationComponent
        {...paginationProps}
        length={5}
      />
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const Pagination: Story = { args: { hasControls: false } };
