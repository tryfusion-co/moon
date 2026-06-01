import { fireEvent, render } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import Chip from "../../components/Chip";

describe("Chip", () => {
  it("renders a button with base class moon-chip and children", () => {
    const { container } = render(() => <Chip>c</Chip>);
    const btn = container.querySelector("button");
    expect(btn).not.toBeNull();
    expect(btn!.className).toBe("moon-chip");
    expect(btn!.textContent).toBe("c");
  });

  it("applies size and variant modifier classes", () => {
    const { container } = render(() => (
      <Chip size="sm" variant="outline">
        x
      </Chip>
    ));
    const btn = container.querySelector("button");
    expect(btn!.className).toBe("moon-chip moon-chip-sm moon-chip-outline");
  });

  it("toggles moon-chip-active on click when uncontrolled", () => {
    const { container } = render(() => <Chip>x</Chip>);
    const btn = container.querySelector("button")!;
    expect(btn.className).not.toContain("moon-chip-active");
    fireEvent.click(btn);
    expect(btn.className).toContain("moon-chip-active");
    fireEvent.click(btn);
    expect(btn.className).not.toContain("moon-chip-active");
  });

  it("shows moon-chip-active when controlled isActive=true; click does NOT remove it", () => {
    const { container } = render(() => <Chip isActive>x</Chip>);
    const btn = container.querySelector("button")!;
    expect(btn.className).toContain("moon-chip-active");
    fireEvent.click(btn);
    expect(btn.className).toContain("moon-chip-active");
  });

  it("calls provided onClick on click", () => {
    const spy = vi.fn();
    const { container } = render(() => <Chip onClick={spy}>x</Chip>);
    const btn = container.querySelector("button")!;
    fireEvent.click(btn);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("appends caller class prop as last segment", () => {
    const { container } = render(() => <Chip class="extra">x</Chip>);
    const btn = container.querySelector("button")!;
    expect(btn.className).toBe("moon-chip extra");
  });

  it("calls tuple-form onClick handler with bound data and event", () => {
    const handler = vi.fn();
    const data = { id: 1 };
    const { container } = render(() => (
      <Chip onClick={[handler, data]}>x</Chip>
    ));
    const btn = container.querySelector("button")!;
    fireEvent.click(btn);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0]).toBe(data);
  });
});
