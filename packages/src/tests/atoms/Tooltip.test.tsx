import { render, screen } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Tooltip from "../../components/Tooltip";

describe("Tooltip", () => {
  it("renders div.moon-tooltip", () => {
    const { container } = render(() => (
      <Tooltip>
        <Tooltip.Content>tip</Tooltip.Content>
      </Tooltip>
    ));
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.className).toBe("moon-tooltip");
  });

  it("position=top (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <Tooltip position="top">
        <Tooltip.Content>tip</Tooltip.Content>
      </Tooltip>
    ));
    const div = container.querySelector("div.moon-tooltip");
    expect(div!.className).toBe("moon-tooltip");
  });

  it("position=bottom adds moon-tooltip-bottom modifier", () => {
    const { container } = render(() => (
      <Tooltip position="bottom">
        <Tooltip.Content>tip</Tooltip.Content>
      </Tooltip>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-tooltip moon-tooltip-bottom");
  });

  it("hasPointer=true adds moon-tooltip-pointer modifier", () => {
    const { container } = render(() => (
      <Tooltip hasPointer>
        <Tooltip.Content>tip</Tooltip.Content>
      </Tooltip>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toContain("moon-tooltip-pointer");
  });

  describe("Tooltip.Trigger", () => {
    it("renders a p element with children", () => {
      const { container } = render(() => (
        <Tooltip.Trigger>hover me</Tooltip.Trigger>
      ));
      const p = container.querySelector("p");
      expect(p).not.toBeNull();
      expect(p!.textContent).toBe("hover me");
    });

    it("appends custom class", () => {
      const { container } = render(() => (
        <Tooltip.Trigger class="trigger-cls">x</Tooltip.Trigger>
      ));
      const p = container.querySelector("p");
      expect(p!.className).toBe("trigger-cls");
    });
  });

  describe("Tooltip.Content", () => {
    it("renders div.moon-tooltip-content", () => {
      const { container } = render(() => (
        <Tooltip.Content>tooltip text</Tooltip.Content>
      ));
      const div = container.querySelector("div");
      expect(div).not.toBeNull();
      expect(div!.className).toBe("moon-tooltip-content");
      expect(div!.textContent).toBe("tooltip text");
    });

    it("appends custom class", () => {
      const { container } = render(() => (
        <Tooltip.Content class="extra">x</Tooltip.Content>
      ));
      const div = container.querySelector("div");
      expect(div!.className).toBe("moon-tooltip-content extra");
    });

    it("renders nested children with base and custom classes visible", () => {
      render(() => (
        <Tooltip>
          <Tooltip.Content class="extra-class">Content text</Tooltip.Content>
        </Tooltip>
      ));
      const content = screen.getByText("Content text");
      expect(content).toHaveClass("moon-tooltip-content");
      expect(content).toHaveClass("extra-class");
    });
  });

  it("renders nested Trigger and Content children", () => {
    render(() => (
      <Tooltip>
        <Tooltip.Trigger>Trigger here</Tooltip.Trigger>
        <Tooltip.Content>Content here</Tooltip.Content>
      </Tooltip>
    ));
    expect(screen.getByText("Trigger here")).toBeInTheDocument();
    expect(screen.getByText("Content here")).toBeInTheDocument();
  });
});
