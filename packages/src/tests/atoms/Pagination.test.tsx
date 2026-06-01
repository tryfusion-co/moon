import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import Pagination from "../../components/Pagination";

describe("Pagination", () => {
  it("renders nav[role=navigation] > ul.moon-pagination", () => {
    const { container } = render(() => <Pagination length={3} />);
    const nav = container.querySelector("nav[role=navigation]");
    expect(nav).not.toBeNull();
    const ul = container.querySelector("ul.moon-pagination");
    expect(ul).not.toBeNull();
  });

  it("renders length=3 items as li.moon-pagination-item", () => {
    const { container } = render(() => <Pagination length={3} />);
    const items = container.querySelectorAll(".moon-pagination-item");
    expect(items.length).toBe(3);
  });

  it("activePage=0 (default) — first item has moon-pagination-item-active + aria-current", () => {
    const { container } = render(() => <Pagination length={3} activePage={0} />);
    const items = container.querySelectorAll(".moon-pagination-item");
    expect(items[0].className).toContain("moon-pagination-item-active");
    expect(items[0].getAttribute("aria-current")).toBe("page");
    expect(items[1].className).not.toContain("moon-pagination-item-active");
    expect(items[2].className).not.toContain("moon-pagination-item-active");
  });

  it("activePage=1 — second item is active on mount", () => {
    const { container } = render(() => <Pagination length={3} activePage={1} />);
    const items = container.querySelectorAll(".moon-pagination-item");
    expect(items[1].className).toContain("moon-pagination-item-active");
    expect(items[0].className).not.toContain("moon-pagination-item-active");
  });

  it("clicking second item makes it active and fires onPageChange(1)", () => {
    const spy = vi.fn();
    const { container } = render(() => (
      <Pagination length={3} activePage={0} onPageChange={spy} />
    ));
    const items = container.querySelectorAll(".moon-pagination-item");
    fireEvent.click(items[1]);
    expect(spy).toHaveBeenCalledWith(1);
    expect(items[1].className).toContain("moon-pagination-item-active");
    expect(items[0].className).not.toContain("moon-pagination-item-active");
  });

  it("items render default text content (index + 1)", () => {
    const { container } = render(() => <Pagination length={3} />);
    const items = container.querySelectorAll(".moon-pagination-item");
    expect(items[0].textContent).toBe("1");
    expect(items[1].textContent).toBe("2");
    expect(items[2].textContent).toBe("3");
  });

  it("renderItem callback used when provided", () => {
    const { container } = render(() => (
      <Pagination length={3} renderItem={(i) => <span>page-{i}</span>} />
    ));
    const items = container.querySelectorAll(".moon-pagination-item");
    expect(items[0].textContent).toBe("page-0");
    expect(items[1].textContent).toBe("page-1");
  });

  describe("controls", () => {
    it("hasControls renders prev/next moon-pagination-control elements", () => {
      const { container } = render(() => <Pagination length={3} hasControls />);
      const controls = container.querySelectorAll(".moon-pagination-control");
      expect(controls.length).toBe(2);
    });

    it("previous control is disabled when on first page", () => {
      const { container } = render(() => (
        <Pagination length={3} activePage={0} hasControls />
      ));
      const prev = container.querySelector('[aria-label="Previous"]');
      expect(prev).not.toBeNull();
      expect(prev!.className).toContain("moon-pagination-control-disabled");
      expect(prev!.getAttribute("aria-disabled")).toBe("true");
    });

    it("next control is disabled when on last page", () => {
      const { container } = render(() => (
        <Pagination length={3} activePage={2} hasControls />
      ));
      const next = container.querySelector('[aria-label="Next"]');
      expect(next!.className).toContain("moon-pagination-control-disabled");
    });

    it("clicking next control advances page", () => {
      const spy = vi.fn();
      const { container } = render(() => (
        <Pagination length={3} activePage={0} hasControls onPageChange={spy} />
      ));
      const next = container.querySelector('[aria-label="Next"]');
      fireEvent.click(next!);
      expect(spy).toHaveBeenCalledWith(1);
    });

    it("no controls rendered by default", () => {
      const { container } = render(() => <Pagination length={3} />);
      expect(container.querySelectorAll(".moon-pagination-control").length).toBe(0);
    });
  });
});
