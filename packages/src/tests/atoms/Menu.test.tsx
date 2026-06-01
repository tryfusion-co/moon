import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Menu from "../../components/Menu";

describe("Menu", () => {
  it("renders ul.moon-menu", () => {
    const { container } = render(() => (
      <Menu>
        <Menu.Item>item</Menu.Item>
      </Menu>
    ));
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    expect(ul!.className).toBe("moon-menu");
  });

  it("size=md (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <Menu size="md">
        <Menu.Item>item</Menu.Item>
      </Menu>
    ));
    const ul = container.querySelector("ul");
    expect(ul!.className).toBe("moon-menu");
  });

  it("size=sm adds moon-menu-sm modifier", () => {
    const { container } = render(() => (
      <Menu size="sm">
        <Menu.Item>item</Menu.Item>
      </Menu>
    ));
    const ul = container.querySelector("ul");
    expect(ul!.className).toBe("moon-menu moon-menu-sm");
  });

  it("size=lg adds moon-menu-lg modifier", () => {
    const { container } = render(() => (
      <Menu size="lg">
        <Menu.Item>item</Menu.Item>
      </Menu>
    ));
    const ul = container.querySelector("ul");
    expect(ul!.className).toBe("moon-menu moon-menu-lg");
  });

  describe("Menu.Item", () => {
    it("renders li.moon-menu-item", () => {
      const { container } = render(() => (
        <Menu>
          <Menu.Item>hello</Menu.Item>
        </Menu>
      ));
      const li = container.querySelector("li");
      expect(li).not.toBeNull();
      expect(li!.className).toBe("moon-menu-item");
      expect(li!.textContent).toBe("hello");
    });

    it("appends custom class to Item", () => {
      const { container } = render(() => (
        <Menu>
          <Menu.Item class="extra">x</Menu.Item>
        </Menu>
      ));
      const li = container.querySelector("li");
      expect(li!.className).toBe("moon-menu-item extra");
    });
  });

  describe("Menu.Meta", () => {
    it("renders div.moon-menu-item-meta", () => {
      const { container } = render(() => (
        <Menu>
          <Menu.Meta>meta</Menu.Meta>
        </Menu>
      ));
      const div = container.querySelector("div");
      expect(div).not.toBeNull();
      expect(div!.className).toBe("moon-menu-item-meta");
    });
  });
});
