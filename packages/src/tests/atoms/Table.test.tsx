import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Table from "../../components/Table";

describe("Table", () => {
  it("renders table.moon-table with full compound structure", () => {
    const { container } = render(() => (
      <Table>
        <Table.Caption>Caption</Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeadCell>Header</Table.HeadCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Data</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Foot>
          <Table.Row>
            <Table.Cell>Footer</Table.Cell>
          </Table.Row>
        </Table.Foot>
      </Table>
    ));
    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(table!.className).toBe("moon-table");
    expect(container.querySelector("caption")).not.toBeNull();
    expect(container.querySelector("thead")).not.toBeNull();
    expect(container.querySelector("tbody")).not.toBeNull();
    expect(container.querySelector("tfoot")).not.toBeNull();
    expect(container.querySelector("tr")).not.toBeNull();
    expect(container.querySelector("th")).not.toBeNull();
    expect(container.querySelector("td")).not.toBeNull();
  });

  it("does NOT add size modifier for default size md", () => {
    const { container } = render(() => <Table />);
    const table = container.querySelector("table")!;
    expect(table.className).toBe("moon-table");
    expect(table.className).not.toContain("moon-table-md");
  });

  it("applies size modifier moon-table-sm for size=sm", () => {
    const { container } = render(() => <Table size="sm" />);
    const table = container.querySelector("table")!;
    expect(table.className).toBe("moon-table moon-table-sm");
  });

  it("applies size modifier moon-table-lg for size=lg", () => {
    const { container } = render(() => <Table size="lg" />);
    const table = container.querySelector("table")!;
    expect(table.className).toBe("moon-table moon-table-lg");
  });

  it("applies size modifier moon-table-xl for size=xl", () => {
    const { container } = render(() => <Table size="xl" />);
    const table = container.querySelector("table")!;
    expect(table.className).toBe("moon-table moon-table-xl");
  });

  it("sub-components forward class and rest props", () => {
    const { container } = render(() => (
      <Table>
        <Table.Head class="custom-head" data-testid="head">
          <Table.Row class="custom-row">
            <Table.HeadCell class="custom-hcell">H</Table.HeadCell>
          </Table.Row>
        </Table.Head>
        <Table.Body class="custom-body">
          <Table.Row>
            <Table.Cell class="custom-cell">D</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Foot class="custom-foot">
          <Table.Row>
            <Table.Cell>F</Table.Cell>
          </Table.Row>
        </Table.Foot>
        <Table.Caption class="custom-caption">Cap</Table.Caption>
      </Table>
    ));
    expect(container.querySelector("thead")!.className).toBe("custom-head");
    expect(container.querySelector("tbody")!.className).toBe("custom-body");
    expect(container.querySelector("tfoot")!.className).toBe("custom-foot");
    expect(container.querySelector("caption")!.className).toBe("custom-caption");
    expect(container.querySelector("th")!.className).toBe("custom-hcell");
    expect(container.querySelector("td")!.className).toBe("custom-cell");
  });

  it("forwards rest props (aria-label) on Root", () => {
    const { container } = render(() => <Table aria-label="data-table" />);
    const table = container.querySelector("table")!;
    expect(table.getAttribute("aria-label")).toBe("data-table");
  });
});
