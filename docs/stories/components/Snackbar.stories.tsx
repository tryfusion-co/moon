import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Snackbar as SnackbarComponent, Button } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import { createSignal, For } from 'solid-js';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof SnackbarComponent>;

const meta: Meta<Type> = {
  title: 'Messaging & feedback/Snackbar',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="Snackbar" />
      ),
    },
  },
  argTypes: {
    variant: {
      description: 'Defines Snackbar variant',
      options: ['fill', 'soft'],
      control: 'select',
      table: {
        defaultValue: { summary: 'fill' },
      },
    },
    context: {
      description: 'Defines Snackbar context',
      options: ['brand', 'neutral', 'positive', 'negative', 'caution', 'info'],
      control: 'select',
      table: {
        defaultValue: { summary: 'brand' },
      },
    },
    isOpen: {
      description: 'Controls if Snackbar is open',
      control: 'boolean',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
  render: ({ variant, context, isOpen, ...props }) => {
    const snackbarProps = {
      ...props,
      ...(variant !== 'fill' && { variant }),
      ...(context !== 'brand' && { context }),
    };
    const [localIsOpen, setLocalIsOpen] = createSignal(false);
    const shouldShowSnackbar = () => isOpen || localIsOpen();
    return (
      <>
        <Button onClick={() => setLocalIsOpen(!localIsOpen())}>
          Open Snackbar
        </Button>
        <SnackbarComponent.Group>
          <SnackbarComponent {...snackbarProps} isOpen={shouldShowSnackbar()}>
            Content
          </SnackbarComponent>
        </SnackbarComponent.Group>
      </>
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const Snackbar: Story = {
  args: { variant: 'fill', context: 'brand', isOpen: false },
  play: async ({ canvasElement, userEvent }) => {
    const button = canvasElement.querySelector('button');
    await userEvent.click(button);
  },
};

export const SnackbarWithMeta: Story = {
  args: { variant: 'fill', context: 'brand', isOpen: false },
  render: ({ variant, context, isOpen, ...props }) => {
    const snackbarProps = {
      ...props,
      ...(variant !== 'fill' && { variant }),
      ...(context !== 'brand' && { context }),
    };
    const [localIsOpen, setLocalIsOpen] = createSignal(false);
    const shouldShowSnackbar = () => isOpen || localIsOpen();
    return (
      <>
        <Button onClick={() => setLocalIsOpen(!localIsOpen())}>
          Open Snackbar
        </Button>
        <SnackbarComponent.Group>
          <SnackbarComponent {...snackbarProps} isOpen={shouldShowSnackbar()}>
            Content
            <SnackbarComponent.Meta>
              <SnackbarComponent.Action>Action</SnackbarComponent.Action>
            </SnackbarComponent.Meta>
          </SnackbarComponent>
        </SnackbarComponent.Group>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const button = canvasElement.querySelector('button');
    await userEvent.click(button);
  },
};

export const MultipleSnackbars: Story = {
  args: { variant: 'fill', context: 'brand' },
  render: ({ variant, context, ...props }) => {
    const snackbarProps = {
      ...props,
      ...(variant !== 'fill' && { variant }),
      ...(context !== 'brand' && { context }),
    };
    const [snackbars, setSnackbars] = createSignal<
      Array<{ id: number; message: string }>
    >([]);
    const [nextId, setNextId] = createSignal(1);
    const addSnackbar = () => {
      const newSnackbar = {
        id: nextId(),
        message: `Notification ${nextId()}`,
      };
      setSnackbars((prev) => [...prev, newSnackbar]);
      setNextId((prev) => prev + 1);
      setTimeout(() => {
        setSnackbars((current) =>
          current.filter((s) => s.id !== newSnackbar.id)
        );
      }, 5000);
    };

    return (
      <>
        <Button onClick={addSnackbar}>Open Snackbar</Button>
        <SnackbarComponent.Group>
          <For each={snackbars()}>
            {(snackbar) => (
              <SnackbarComponent
                {...snackbarProps}
                isOpen={true}
              >
                {snackbar.message}
              </SnackbarComponent>
            )}
          </For>
        </SnackbarComponent.Group>
      </>
    );
  },
  play: async ({ canvasElement, userEvent }) => {
    const button = canvasElement.querySelector('button');
    await userEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await userEvent.click(button);
    await new Promise((resolve) => setTimeout(resolve, 500));
    await userEvent.click(button);
  },
};
