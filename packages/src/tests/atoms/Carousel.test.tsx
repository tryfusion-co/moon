import { render } from "@solidjs/testing-library";
import { describe, it, expect, vi, afterEach } from "vitest";
import Carousel from "../../components/Carousel";

describe("Carousel", () => {
  it("renders div.moon-carousel with reel and two controls", () => {
    const { container } = render(() => (
      <Carousel hasControls>
        <Carousel.Item>a</Carousel.Item>
        <Carousel.Item>b</Carousel.Item>
      </Carousel>
    ));
    expect(container.querySelector(".moon-carousel")).not.toBeNull();
    expect(container.querySelector(".moon-carousel-reel")).not.toBeNull();
    expect(container.querySelectorAll(".moon-carousel-control").length).toBe(2);
    expect(container.querySelectorAll(".moon-carousel-item").length).toBe(2);
  });

  it("renders reel with items inside it", () => {
    const { container } = render(() => (
      <Carousel hasControls>
        <Carousel.Item>first</Carousel.Item>
        <Carousel.Item>second</Carousel.Item>
      </Carousel>
    ));
    const reel = container.querySelector(".moon-carousel-reel")!;
    expect(reel).not.toBeNull();
    const items = reel.querySelectorAll(".moon-carousel-item");
    expect(items.length).toBe(2);
    expect(items[0].textContent).toBe("first");
    expect(items[1].textContent).toBe("second");
  });

  it("does not render controls when hasControls is false", () => {
    const { container } = render(() => (
      <Carousel>
        <Carousel.Item>a</Carousel.Item>
      </Carousel>
    ));
    expect(container.querySelectorAll(".moon-carousel-control").length).toBe(0);
  });

  it("previous control is disabled (canScrollStart signal drives disabled prop)", () => {
    const { container } = render(() => (
      <Carousel hasControls>
        <Carousel.Item>a</Carousel.Item>
      </Carousel>
    ));
    const prevBtn = container.querySelector<HTMLButtonElement>(
      '[aria-label="Previous"]'
    )!;
    const nextBtn = container.querySelector<HTMLButtonElement>(
      '[aria-label="Next"]'
    )!;
    expect(prevBtn).not.toBeNull();
    expect(nextBtn).not.toBeNull();
    // canScrollStart initial value is false → disabled={!canScrollStart()} = disabled
    // After onMount runs in jsdom (scrollWidth=clientWidth=0, scrollLeft=0):
    //   updateScrollState: setCanScrollStart(0 > 0) = false → previous stays disabled
    expect(prevBtn.disabled).toBe(true);
    // canScrollEnd after jsdom onMount: setCanScrollEnd(0 < 0) = false → next also disabled
    // Both buttons reflect signal-driven disabled state (the signals work correctly)
    expect(nextBtn.disabled).toBe(true);
  });

  it("controls have correct aria-labels", () => {
    const { container } = render(() => (
      <Carousel hasControls>
        <Carousel.Item>a</Carousel.Item>
      </Carousel>
    ));
    expect(
      container.querySelector('[aria-label="Previous"]')
    ).not.toBeNull();
    expect(
      container.querySelector('[aria-label="Next"]')
    ).not.toBeNull();
  });

  describe("Carousel.Item", () => {
    it("renders div.moon-carousel-item with children", () => {
      const { container } = render(() => <Carousel.Item>c</Carousel.Item>);
      const div = container.querySelector("div");
      expect(div).not.toBeNull();
      expect(div!.className).toBe("moon-carousel-item");
      expect(div!.textContent).toBe("c");
    });

    it("appends caller class after base", () => {
      const { container } = render(() => (
        <Carousel.Item class="x">c</Carousel.Item>
      ));
      const div = container.querySelector("div");
      expect(div!.className).toBe("moon-carousel-item x");
    });
  });

  describe("listener cleanup on unmount", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("removes scroll and resize listeners when unmounted (onCleanup fires)", () => {
      const windowRemoveSpy = vi.spyOn(window, "removeEventListener");
      const reelRemoveSpy = vi.spyOn(
        HTMLDivElement.prototype,
        "removeEventListener"
      );

      const result = render(() => (
        <Carousel hasControls>
          <Carousel.Item>a</Carousel.Item>
        </Carousel>
      ));

      result.unmount();

      expect(
        reelRemoveSpy.mock.calls.some((args) => args[0] === "scroll")
      ).toBe(true);
      expect(
        windowRemoveSpy.mock.calls.some((args) => args[0] === "resize")
      ).toBe(true);
    });
  });
});
