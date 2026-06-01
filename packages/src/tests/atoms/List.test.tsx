import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import List from "../../components/List";

describe("List", () => {
  it("renders ul.moon-list with default size md", () => {
    const { container } = render(() => (
      <List>
        <List.Item>Item 1</List.Item>
        <List.Item>Item 2</List.Item>
      </List>
    ));
    const ul = container.querySelector("ul");
    expect(ul).not.toBeNull();
    expect(ul!.className).toBe("moon-list");
    expect(ul!.className).not.toContain("moon-list-md");
  });

  it("renders children text content", () => {
    const { container } = render(() => (
      <List>
        <List.Item>Item 1</List.Item>
        <List.Item>Item 2</List.Item>
      </List>
    ));
    const items = container.querySelectorAll("li");
    expect(items[0].textContent).toBe("Item 1");
    expect(items[1].textContent).toBe("Item 2");
  });

  it("applies size modifier moon-list-sm for size=sm", () => {
    const { container } = render(() => (
      <List size="sm">
        <List.Item>A</List.Item>
      </List>
    ));
    const ul = container.querySelector("ul")!;
    expect(ul.className).toBe("moon-list moon-list-sm");
  });

  it("applies size modifier moon-list-lg for size=lg", () => {
    const { container } = render(() => (
      <List size="lg">
        <List.Item>A</List.Item>
      </List>
    ));
    const ul = container.querySelector("ul")!;
    expect(ul.className).toBe("moon-list moon-list-lg");
  });

  it("appends caller class after size modifier", () => {
    const { container } = render(() => (
      <List class="extra">
        <List.Item>A</List.Item>
      </List>
    ));
    const ul = container.querySelector("ul")!;
    expect(ul.className).toBe("moon-list extra");
  });

  it("renders List.Item as li.moon-list-item", () => {
    const { container } = render(() => (
      <List>
        <List.Item>Content</List.Item>
      </List>
    ));
    const li = container.querySelector("li");
    expect(li).not.toBeNull();
    expect(li!.className).toBe("moon-list-item");
    expect(li!.textContent).toBe("Content");
  });

  it("List.Item appends caller class after base class", () => {
    const { container } = render(() => (
      <List>
        <List.Item class="custom-item">X</List.Item>
      </List>
    ));
    const li = container.querySelector("li")!;
    expect(li.className).toBe("moon-list-item custom-item");
  });

  it("List.Item onClick handler fires on click", () => {
    const onClick = vi.fn();
    const { container } = render(() => (
      <List>
        <List.Item data-testid="item" onClick={onClick}>Click me</List.Item>
      </List>
    ));
    const li = container.querySelector("li")!;
    fireEvent.click(li);
    expect(onClick).toHaveBeenCalled();
  });

  it("renders List.Meta as div.moon-list-item-meta", () => {
    const { container } = render(() => (
      <List>
        <List.Meta>Meta</List.Meta>
      </List>
    ));
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.className).toBe("moon-list-item-meta");
    expect(div!.textContent).toBe("Meta");
  });

  it("forwards rest props (aria-label) on Root", () => {
    const { container } = render(() => (
      <List aria-label="my-list">
        <List.Item>A</List.Item>
      </List>
    ));
    const ul = container.querySelector("ul")!;
    expect(ul.getAttribute("aria-label")).toBe("my-list");
  });
});
