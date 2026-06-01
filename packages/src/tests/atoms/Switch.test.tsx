import { fireEvent, render } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import Switch from "../../components/Switch";

describe("Switch", () => {
  it("renders input[type=checkbox] with base class moon-switch (default size sm)", () => {
    const { container } = render(() => <Switch checked={false} onChange={() => {}} />);
    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input!.type).toBe("checkbox");
    expect(input!.className).toBe("moon-switch");
  });

  it("applies size modifier class for xs", () => {
    const { container } = render(() => (
      <Switch checked={false} onChange={() => {}} size="xs" />
    ));
    const input = container.querySelector("input");
    expect(input!.className).toBe("moon-switch moon-switch-xs");
  });

  it("applies size modifier class for 2xs", () => {
    const { container } = render(() => (
      <Switch checked={false} onChange={() => {}} size="2xs" />
    ));
    const input = container.querySelector("input");
    expect(input!.className).toBe("moon-switch moon-switch-2xs");
  });

  it("appends caller class after base and size modifier", () => {
    const { container } = render(() => (
      <Switch checked={false} onChange={() => {}} size="xs" class="extra" />
    ));
    const input = container.querySelector("input");
    expect(input!.className).toBe("moon-switch moon-switch-xs extra");
  });

  it("renders label text inside the wrapping label element when label prop is set", () => {
    const { container } = render(() => (
      <Switch checked={false} onChange={() => {}} label="Toggle me" />
    ));
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    expect(label!.textContent).toContain("Toggle me");
  });

  it("wraps input in a label element even without label prop", () => {
    const { container } = render(() => (
      <Switch checked={false} onChange={() => {}} />
    ));
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    const input = label!.querySelector("input");
    expect(input).not.toBeNull();
  });

  it("calls onChange prop callback when input event fires on the checkbox", () => {
    const spy = vi.fn();
    const { container } = render(() => (
      <Switch checked={false} onChange={spy} />
    ));
    const input = container.querySelector("input")!;
    fireEvent.input(input);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onChange is not provided and input event fires", () => {
    const { container } = render(() => <Switch checked={false} onChange={() => {}} />);
    const input = container.querySelector("input")!;
    expect(() => fireEvent.input(input)).not.toThrow();
  });
});
