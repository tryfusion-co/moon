import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import SegmentedControl from "../../components/SegmentedControl";

describe("SegmentedControl", () => {
  it("renders div[role=tablist].moon-segmented-control", () => {
    const { container } = render(() => (
      <SegmentedControl>
        <SegmentedControl.Item>A</SegmentedControl.Item>
      </SegmentedControl>
    ));
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.getAttribute("role")).toBe("tablist");
    expect(div!.className).toBe("moon-segmented-control");
  });

  it("appends caller class", () => {
    const { container } = render(() => (
      <SegmentedControl class="extra">
        <SegmentedControl.Item>A</SegmentedControl.Item>
      </SegmentedControl>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-segmented-control extra");
  });

  it("size=sm adds moon-segmented-control-sm modifier", () => {
    const { container } = render(() => (
      <SegmentedControl size="sm">
        <SegmentedControl.Item>A</SegmentedControl.Item>
      </SegmentedControl>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-segmented-control moon-segmented-control-sm");
  });

  it("size=md (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <SegmentedControl size="md">
        <SegmentedControl.Item>A</SegmentedControl.Item>
      </SegmentedControl>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-segmented-control");
  });

  it("renders Items as button[role=tab]", () => {
    const { container } = render(() => (
      <SegmentedControl>
        <SegmentedControl.Item>A</SegmentedControl.Item>
        <SegmentedControl.Item>B</SegmentedControl.Item>
      </SegmentedControl>
    ));
    const buttons = container.querySelectorAll("button[role=tab]");
    expect(buttons.length).toBe(2);
  });

  describe("uncontrolled", () => {
    it("first Item is active initially: aria-selected=true, active class, tabIndex=0", () => {
      const { container } = render(() => (
        <SegmentedControl>
          <SegmentedControl.Item>A</SegmentedControl.Item>
          <SegmentedControl.Item>B</SegmentedControl.Item>
        </SegmentedControl>
      ));
      const buttons = container.querySelectorAll("button[role=tab]");
      expect(buttons[0].getAttribute("aria-selected")).toBe("true");
      expect(buttons[0].className).toContain("moon-segmented-control-item-active");
      expect((buttons[0] as HTMLButtonElement).tabIndex).toBe(0);

      expect(buttons[1].getAttribute("aria-selected")).toBe("false");
      expect(buttons[1].className).not.toContain("moon-segmented-control-item-active");
      expect((buttons[1] as HTMLButtonElement).tabIndex).toBe(-1);
    });

    it("clicking second Item makes it active, first becomes inactive", () => {
      const { container } = render(() => (
        <SegmentedControl>
          <SegmentedControl.Item>A</SegmentedControl.Item>
          <SegmentedControl.Item>B</SegmentedControl.Item>
        </SegmentedControl>
      ));
      const buttons = container.querySelectorAll("button[role=tab]");
      fireEvent.click(buttons[1]);
      expect(buttons[1].getAttribute("aria-selected")).toBe("true");
      expect(buttons[1].className).toContain("moon-segmented-control-item-active");
      expect(buttons[0].getAttribute("aria-selected")).toBe("false");
      expect(buttons[0].className).not.toContain("moon-segmented-control-item-active");
    });
  });

  describe("controlled", () => {
    it("activeIndex=1 makes second Item active on mount", () => {
      const { container } = render(() => (
        <SegmentedControl activeIndex={1}>
          <SegmentedControl.Item>A</SegmentedControl.Item>
          <SegmentedControl.Item>B</SegmentedControl.Item>
        </SegmentedControl>
      ));
      const buttons = container.querySelectorAll("button[role=tab]");
      expect(buttons[1].getAttribute("aria-selected")).toBe("true");
      expect(buttons[0].getAttribute("aria-selected")).toBe("false");
    });

    it("clicking calls setActiveIndex spy; internal signal does not change active item", () => {
      const spy = vi.fn();
      const { container } = render(() => (
        <SegmentedControl activeIndex={1} setActiveIndex={spy}>
          <SegmentedControl.Item>A</SegmentedControl.Item>
          <SegmentedControl.Item>B</SegmentedControl.Item>
        </SegmentedControl>
      ));
      const buttons = container.querySelectorAll("button[role=tab]");
      fireEvent.click(buttons[0]);
      expect(spy).toHaveBeenCalledWith(0);
      // No re-render since spy doesn't update activeIndex — second stays active
      expect(buttons[1].getAttribute("aria-selected")).toBe("true");
    });
  });

  describe("Item classes", () => {
    it("Item base class is moon-segmented-control-item", () => {
      const { container } = render(() => (
        <SegmentedControl>
          <SegmentedControl.Item>A</SegmentedControl.Item>
        </SegmentedControl>
      ));
      const btn = container.querySelector("button");
      expect(btn!.className).toContain("moon-segmented-control-item");
    });

    it("active Item has moon-segmented-control-item-active", () => {
      const { container } = render(() => (
        <SegmentedControl>
          <SegmentedControl.Item>A</SegmentedControl.Item>
        </SegmentedControl>
      ));
      const btn = container.querySelector("button");
      expect(btn!.className).toContain("moon-segmented-control-item-active");
    });

    it("appends Item caller class", () => {
      const { container } = render(() => (
        <SegmentedControl>
          <SegmentedControl.Item class="extra">A</SegmentedControl.Item>
        </SegmentedControl>
      ));
      const btn = container.querySelector("button");
      expect(btn!.className).toContain("extra");
    });
  });
});
