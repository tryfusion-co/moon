import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { CircularProgress as CircularProgressComponent } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof CircularProgressComponent> & {
  value?: number;
};

const meta: Meta<Type> = {
  title: 'Indicators & status/Circular Progress',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="CircularProgress" />
      ),
    },
  },
  argTypes: {
    size: {
      description: 'Defines CircularProgress size',
      options: ['xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      control: 'select',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
    value: {
      description: 'Current value of CircularProgress',
      control: { type: 'range', min: 0, max: 100, step: 1 },
      table: {
        defaultValue: { summary: '0' },
      },
    },
  },
  render: ({ size, value, ...props }) => {
    const circularProgressProps = {
      ...props,
      ...(size !== 'md' && { size }),
    };
    return (
      <CircularProgressComponent
        style={{ '--value': value } as any}
        {...circularProgressProps}
      />
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const CircularProgress: Story = {
  args: { size: 'md', value: 25 },
};
