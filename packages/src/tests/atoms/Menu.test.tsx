import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
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

  it("renders multiple items", () => {
    const { container } = render(() => (
      <Menu>
        <Menu.Item>Item 1</Menu.Item>
        <Menu.Item>Item 2</Menu.Item>
        <Menu.Item>Item 3</Menu.Item>
      </Menu>
    ));
    const items = container.querySelectorAll("li.moon-menu-item");
    expect(items.length).toBe(3);
    expect(items[0].textContent).toBe("Item 1");
    expect(items[1].textContent).toBe("Item 2");
    expect(items[2].textContent).toBe("Item 3");
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

  it("applies custom class to root", () => {
    const { container } = render(() => (
      <Menu class="custom-class">
        <Menu.Item>item</Menu.Item>
      </Menu>
    ));
    const ul = container.querySelector("ul");
    expect(ul!.className).toContain("custom-class");
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

    it("fires onClick handler when item is clicked", () => {
      const onClick = vi.fn();
      const { container } = render(() => (
        <Menu>
          <Menu.Item onClick={onClick}>Click me</Menu.Item>
        </Menu>
      ));
      const li = container.querySelector("li")!;
      fireEvent.click(li);
      expect(onClick).toHaveBeenCalledTimes(1);
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

    it("renders Meta text content", () => {
      const { container } = render(() => (
        <Menu>
          <Menu.Meta>Meta Info</Menu.Meta>
        </Menu>
      ));
      const div = container.querySelector("div");
      expect(div!.textContent).toBe("Meta Info");
    });
  });
});
