import { createSignal, onMount, onCleanup, splitProps, type Component, type JSX } from "solid-js";
import mergeClasses from "../helpers/mergeClasses";
import ChevronLeft from "../assets/icons/ChevronLeft";
import ChevronRight from "../assets/icons/ChevronRight";
import type { Directions } from "../types";

export type ScrollDirections = Directions;

const Item: Component<{ children?: JSX.Element; class?: string }> = (props) => {
  const [local] = splitProps(props, ["children", "class"]);
  return (
    <div class={mergeClasses("moon-carousel-item", local.class)}>
      {local.children}
    </div>
  );
};

type ControlProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  direction: ScrollDirections;
  disabled?: boolean;
  onScrollDirection: (direction: ScrollDirections) => void;
  class?: string;
};

const Control: Component<ControlProps> = (props) => {
  const [local, rest] = splitProps(props, ["class", "direction", "disabled", "onScrollDirection"]);
  return (
    <button
      class={mergeClasses("moon-carousel-control", local.class)}
      disabled={local.disabled}
      onClick={() => local.onScrollDirection(local.direction)}
      aria-label={local.direction === "previous" ? "Previous" : "Next"}
      {...rest}
    >
      {local.direction === "next" ? <ChevronRight /> : <ChevronLeft />}
    </button>
  );
};

const Root: Component<{ children?: JSX.Element; hasControls?: boolean }> = (props) => {
  const [local] = splitProps(props, ["children", "hasControls"]);

  let reelRef!: HTMLDivElement;
  const [canScrollStart, setCanScrollStart] = createSignal(false);
  const [canScrollEnd, setCanScrollEnd] = createSignal(true);

  const updateScrollState = () => {
    const reel = reelRef;
    if (!reel) return;

    const isRTL = getComputedStyle(reel).direction === "rtl";
    const maxScrollLeft = reel.scrollWidth - reel.clientWidth;

    if (isRTL) {
      setCanScrollStart(reel.scrollLeft < 0);
      setCanScrollEnd(reel.scrollLeft > -maxScrollLeft);
    } else {
      setCanScrollStart(reel.scrollLeft > 0);
      setCanScrollEnd(reel.scrollLeft < maxScrollLeft);
    }
  };

  const handleScroll = (direction: ScrollDirections) => {
    const reel = reelRef;
    if (!reel) return;

    const item = reel.querySelector(".moon-carousel-item") as HTMLElement;
    if (!item) return;

    const gap = parseInt(getComputedStyle(reel).gap || "0", 10);
    const scrollAmount = item.offsetWidth + gap;
    const isRTL = getComputedStyle(reel).direction === "rtl";

    let scrollValue: number;
    if (isRTL) {
      scrollValue = direction === "previous" ? scrollAmount : -scrollAmount;
    } else {
      scrollValue = direction === "previous" ? -scrollAmount : scrollAmount;
    }

    reel.scrollBy({
      left: scrollValue,
      behavior: "smooth",
    });
  };

  onMount(() => {
    const reel = reelRef;
    if (!reel) return;

    updateScrollState();

    const handleScrollEvent = () => updateScrollState();
    const handleResize = () => updateScrollState();

    reel.addEventListener("scroll", handleScrollEvent);
    window.addEventListener("resize", handleResize);

    onCleanup(() => {
      reel.removeEventListener("scroll", handleScrollEvent);
      window.removeEventListener("resize", handleResize);
    });
  });

  return (
    <div class="moon-carousel">
      {local.hasControls && (
        <Control
          direction="previous"
          disabled={!canScrollStart()}
          onScrollDirection={handleScroll}
        />
      )}
      <div class="moon-carousel-reel" ref={reelRef}>
        {local.children}
      </div>
      {local.hasControls && (
        <Control
          direction="next"
          disabled={!canScrollEnd()}
          onScrollDirection={handleScroll}
        />
      )}
    </div>
  );
};

const Carousel = Object.assign(Root, { Item });

export default Carousel;
