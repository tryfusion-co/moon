import type { Meta, StoryObj } from 'storybook-solidjs-vite';
import { Table as TableComponent } from '@moondesignsystem/solid';
import type { ComponentProps } from 'solid-js';
import { createSignal, For } from 'solid-js';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  createSolidTable,
} from '@tanstack/solid-table';
import LinksBlock from '../shared/LinksBlock';

type Type = ComponentProps<typeof TableComponent>;

const meta: Meta<Type> = {
  title: 'Content display/Table',
  parameters: {
    docs: {
      container: ({ context }: any) => (
        <LinksBlock context={context} component="Table" />
      ),
    },
  },
  argTypes: {
    size: {
      description: 'Defines Table row size',
      options: ['sm', 'md', 'lg', 'xl'],
      control: 'select',
      table: {
        defaultValue: { summary: 'md' },
      },
    },
  },
  render: ({ size, ...props }) => {
    const tableProps = {
      ...props,
      ...(size !== 'md' && { size }),
    };
    const rows = new Array(5).fill('');
    const cols = new Array(3).fill('');
    return (
      <TableComponent {...tableProps}>
        <TableComponent.Head>
          <TableComponent.Row>
            <For each={cols}>
              {(_, index) => (
                <TableComponent.HeadCell>Title</TableComponent.HeadCell>
              )}
            </For>
          </TableComponent.Row>
        </TableComponent.Head>
        <TableComponent.Body>
          <For each={rows}>
            {(_, rowIndex) => (
              <TableComponent.Row>
                <For each={cols}>
                  {(_, colIndex) => (
                    <TableComponent.Cell>Cell</TableComponent.Cell>
                  )}
                </For>
              </TableComponent.Row>
            )}
          </For>
        </TableComponent.Body>
      </TableComponent>
    );
  },
};

export default meta;

type Story = StoryObj<Type>;

export const Table: Story = {
  args: { size: 'md' },
  parameters: {
    docs: {
      description: {
        story:
          'Basic Table example with simple rows and columns. This shows the default Table structure with header and data cells.',
      },
    },
  },
};

// -------- TanStack Table example --------

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor((row) => row.firstName, {
    id: 'firstName',
    cell: (info) => info.getValue(),
    header: () => <span>First Name</span>,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
  }),
  columnHelper.accessor('age', {
    header: () => 'Age',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('visits', {
    header: () => <span>Visits</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
  }),
  columnHelper.accessor('progress', {
    header: 'Profile Progress',
  }),
];

const TanstackTableExample = (props: Type) => {
  const { size, ...rest } = props;
  const tableProps = { ...rest, ...(size !== 'md' && { size }) };

  const [data] = createSignal([...defaultData]);

  const table = createSolidTable({
    get data() {
      return data();
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <TableComponent {...tableProps}>
      <TableComponent.Head>
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <TableComponent.Row>
              <For each={headerGroup.headers}>
                {(header) => (
                  <TableComponent.HeadCell>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableComponent.HeadCell>
                )}
              </For>
            </TableComponent.Row>
          )}
        </For>
      </TableComponent.Head>
      <TableComponent.Body>
        <For each={table.getRowModel().rows}>
          {(row) => (
            <TableComponent.Row>
              <For each={row.getVisibleCells()}>
                {(cell) => (
                  <TableComponent.Cell>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableComponent.Cell>
                )}
              </For>
            </TableComponent.Row>
          )}
        </For>
      </TableComponent.Body>
    </TableComponent>
  );
};

export const TableWithTanstackTable: Story = {
  args: { size: 'md' },
  parameters: {
    docs: {
      description: {
        story: `Advanced Table example integrating with <a href="https://tanstack.com/table/latest" target="_blank">TanStack Table</a>. This story demonstrates how to use Moon Table component with TanStack Table for features like sorting, filtering, and advanced data management.`,
      },
      source: {
        code: `import { createSignal, For } from 'solid-js';
import { Table } from '@moondesignsystem/solid';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  createSolidTable,
} from '@tanstack/solid-table';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  { firstName: 'tanner', lastName: 'linsley', age: 24, visits: 100, status: 'In Relationship', progress: 50 },
  { firstName: 'tandy',  lastName: 'miller',  age: 40, visits: 40,  status: 'Single',          progress: 80 },
  { firstName: 'joe',    lastName: 'dirte',   age: 45, visits: 20,  status: 'Complicated',     progress: 10 },
];

const columnHelper = createColumnHelper<Person>();

const columns = [
  columnHelper.accessor((row) => row.firstName, {
    id: 'firstName',
    cell: (info) => info.getValue(),
    header: () => <span>First Name</span>,
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    cell: (info) => <i>{info.getValue()}</i>,
    header: () => <span>Last Name</span>,
  }),
  columnHelper.accessor('age', {
    header: () => 'Age',
    cell: (info) => info.renderValue(),
  }),
  columnHelper.accessor('visits', {
    header: () => <span>Visits</span>,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
  }),
  columnHelper.accessor('progress', {
    header: 'Profile Progress',
  }),
];

export const TableWithTanstackTable = (props) => {
  const { size, ...rest } = props;
  const tableProps = { ...rest, ...(size !== 'md' && { size }) };

  const [data] = createSignal([...defaultData]);

  const table = createSolidTable({
    get data() { return data(); },
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Table {...tableProps}>
      <Table.Head>
        <For each={table.getHeaderGroups()}>
          {(headerGroup) => (
            <Table.Row>
              <For each={headerGroup.headers}>
                {(header) => (
                  <Table.HeadCell>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.HeadCell>
                )}
              </For>
            </Table.Row>
          )}
        </For>
      </Table.Head>
      <Table.Body>
        <For each={table.getRowModel().rows}>
          {(row) => (
            <Table.Row>
              <For each={row.getVisibleCells()}>
                {(cell) => (
                  <Table.Cell>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                )}
              </For>
            </Table.Row>
          )}
        </For>
      </Table.Body>
    </Table>
  );
};`,
      },
    },
  },
  render: (args) => <TanstackTableExample {...args} />,
};
