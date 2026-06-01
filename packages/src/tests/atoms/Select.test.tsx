import { fireEvent, render } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import Select from "../../components/Select";

describe("Select", () => {
  it("renders select.moon-select", () => {
    const { container } = render(() => (
      <Select>
        <Select.Option value="a">A</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select");
    expect(sel).not.toBeNull();
    expect(sel!.className).toBe("moon-select");
  });

  it("size=md (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <Select size="md">
        <Select.Option value="a">A</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select");
    expect(sel!.className).toBe("moon-select");
  });

  it("size=sm adds moon-select-sm modifier", () => {
    const { container } = render(() => (
      <Select size="sm">
        <Select.Option value="a">A</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select");
    expect(sel!.className).toBe("moon-select moon-select-sm");
  });

  it("variant=outline adds moon-select-outline modifier", () => {
    const { container } = render(() => (
      <Select variant="outline">
        <Select.Option value="a">A</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select");
    expect(sel!.className).toBe("moon-select moon-select-outline");
  });

  it("variant=fill (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <Select variant="fill">
        <Select.Option value="a">A</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select");
    expect(sel!.className).toBe("moon-select");
  });

  it("error=true adds moon-select-error modifier", () => {
    const { container } = render(() => (
      <Select error={true}>
        <Select.Option value="a">A</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select");
    expect(sel!.className).toContain("moon-select-error");
  });

  it("passes {...rest} attrs (name) onto the select element", () => {
    const { container } = render(() => (
      <Select name="my-select">
        <Select.Option value="a">A</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select");
    expect(sel!.getAttribute("name")).toBe("my-select");
  });

  it("calls onChange callback when input event fires on the select (onInput bridge)", () => {
    const spy = vi.fn();
    const { container } = render(() => (
      <Select onChange={spy}>
        <Select.Option value="a">A</Select.Option>
        <Select.Option value="b">B</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select")!;
    fireEvent.input(sel);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onChange is not provided and input event fires", () => {
    const { container } = render(() => (
      <Select>
        <Select.Option value="a">A</Select.Option>
      </Select>
    ));
    const sel = container.querySelector("select")!;
    expect(() => fireEvent.input(sel)).not.toThrow();
  });

  describe("Select.Option", () => {
    it("renders an option element with children", () => {
      const { container } = render(() => (
        <Select>
          <Select.Option value="x">Label</Select.Option>
        </Select>
      ));
      const opt = container.querySelector("option");
      expect(opt).not.toBeNull();
      expect(opt!.textContent).toBe("Label");
      expect(opt!.value).toBe("x");
    });
  });

  describe("Select.OptionGroup", () => {
    it("renders an optgroup with label", () => {
      const { container } = render(() => (
        <Select>
          <Select.OptionGroup label="Group A">
            <Select.Option value="a">A</Select.Option>
          </Select.OptionGroup>
        </Select>
      ));
      const grp = container.querySelector("optgroup");
      expect(grp).not.toBeNull();
      expect(grp!.getAttribute("label")).toBe("Group A");
    });
  });
});
