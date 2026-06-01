import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import TabList from "../../components/TabList";

describe("TabList", () => {
  it("renders ul[role=tablist].moon-tab-list", () => {
    const { container } = render(() => (
      <TabList>
        <TabList.Item>A</TabList.Item>
      </TabList>
    ));
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    expect(ul!.getAttribute("role")).toBe("tablist");
    expect(ul!.className).toBe("moon-tab-list");
  });

  it("size=sm adds moon-tab-list-sm modifier", () => {
    const { container } = render(() => (
      <TabList size="sm">
        <TabList.Item>A</TabList.Item>
      </TabList>
    ));
    const ul = container.querySelector("ul");
    expect(ul!.className).toBe("moon-tab-list moon-tab-list-sm");
  });

  it("size=md (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <TabList size="md">
        <TabList.Item>A</TabList.Item>
      </TabList>
    ));
    const ul = container.querySelector("ul");
    expect(ul!.className).toBe("moon-tab-list");
  });

  it("renders Items as button[role=tab] inside li", () => {
    const { container } = render(() => (
      <TabList>
        <TabList.Item>A</TabList.Item>
        <TabList.Item>B</TabList.Item>
      </TabList>
    ));
    const buttons = container.querySelectorAll("button[role=tab]");
    expect(buttons.length).toBe(2);
    const lis = container.querySelectorAll("li");
    expect(lis.length).toBe(2);
  });

  describe("active state", () => {
    it("first Item is active by default: aria-selected=true, active class, tabIndex=0", () => {
      const { container } = render(() => (
        <TabList>
          <TabList.Item>A</TabList.Item>
          <TabList.Item>B</TabList.Item>
        </TabList>
      ));
      const buttons = container.querySelectorAll("button[role=tab]");
      expect(buttons[0].getAttribute("aria-selected")).toBe("true");
      expect(buttons[0].className).toContain("moon-tab-list-item-active");
      expect((buttons[0] as HTMLButtonElement).tabIndex).toBe(0);

      expect(buttons[1].getAttribute("aria-selected")).toBe("false");
      expect(buttons[1].className).not.toContain("moon-tab-list-item-active");
      expect((buttons[1] as HTMLButtonElement).tabIndex).toBe(-1);
    });

    it("clicking second Item makes it active, first becomes inactive", () => {
      const { container } = render(() => (
        <TabList>
          <TabList.Item>A</TabList.Item>
          <TabList.Item>B</TabList.Item>
        </TabList>
      ));
      const buttons = container.querySelectorAll("button[role=tab]");
      fireEvent.click(buttons[1]);
      expect(buttons[1].getAttribute("aria-selected")).toBe("true");
      expect(buttons[1].className).toContain("moon-tab-list-item-active");
      expect(buttons[0].getAttribute("aria-selected")).toBe("false");
      expect(buttons[0].className).not.toContain("moon-tab-list-item-active");
    });

    it("clicking second Item fires onTabChange(1)", () => {
      const spy = vi.fn();
      const { container } = render(() => (
        <TabList onTabChange={spy}>
          <TabList.Item>A</TabList.Item>
          <TabList.Item>B</TabList.Item>
        </TabList>
      ));
      const buttons = container.querySelectorAll("button[role=tab]");
      fireEvent.click(buttons[1]);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it("defaultActiveIndex=1 starts with second Item active", () => {
      const { container } = render(() => (
        <TabList defaultActiveIndex={1}>
          <TabList.Item>A</TabList.Item>
          <TabList.Item>B</TabList.Item>
        </TabList>
      ));
      const buttons = container.querySelectorAll("button[role=tab]");
      expect(buttons[1].getAttribute("aria-selected")).toBe("true");
      expect(buttons[0].getAttribute("aria-selected")).toBe("false");
    });
  });

  describe("Item classes", () => {
    it("Item base class is moon-tab-list-item", () => {
      const { container } = render(() => (
        <TabList>
          <TabList.Item>A</TabList.Item>
        </TabList>
      ));
      const btn = container.querySelector("button");
      expect(btn!.className).toContain("moon-tab-list-item");
    });

    it("active Item has moon-tab-list-item-active", () => {
      const { container } = render(() => (
        <TabList>
          <TabList.Item>A</TabList.Item>
        </TabList>
      ));
      const btn = container.querySelector("button");
      expect(btn!.className).toContain("moon-tab-list-item-active");
    });

    it("appends Item caller class", () => {
      const { container } = render(() => (
        <TabList>
          <TabList.Item class="extra">A</TabList.Item>
        </TabList>
      ));
      const btn = container.querySelector("button");
      expect(btn!.className).toContain("extra");
    });
  });
});
