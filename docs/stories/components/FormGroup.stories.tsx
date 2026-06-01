import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import {
  FormGroup as FormGroupComponent,
  Input,
} from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof FormGroupComponent>;

const meta: Meta<Type> = {
  title: 'Forms & selection controls/FormGroup',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="FormGroup" />
      ),
    },
  },
  argTypes: {
    error: {
      description: 'Applies the error state to the form group',
      control: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
  render: ({ error, ...props }) => (
    <FormGroupComponent error={error} {...props}>
      <FormGroupComponent.Label>Email</FormGroupComponent.Label>
      <Input placeholder="you@example.com" error={error} />
      <FormGroupComponent.Hint>
        We'll never share your email.
      </FormGroupComponent.Hint>
    </FormGroupComponent>
  ),
};

export default meta;

type Story = StoryObj<Type>;

export const FormGroup: Story = {
  args: {
    error: false,
  },
};
