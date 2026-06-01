import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Avatar from "../../components/Avatar";

describe("Avatar", () => {
  it("renders a div with base class moon-avatar and User icon fallback when no children", () => {
    const { container } = render(() => <Avatar />);
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.className).toBe("moon-avatar");
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("applies size and variant modifier classes", () => {
    const { container } = render(() => <Avatar size="xl" variant="soft" />);
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-avatar moon-avatar-xl moon-avatar-soft");
  });

  it("renders children and no svg fallback when children provided", () => {
    const { container } = render(() => (
      <Avatar>
        <span>JD</span>
      </Avatar>
    ));
    const div = container.querySelector("div");
    expect(div!.querySelector("span")!.textContent).toBe("JD");
    expect(container.querySelector("svg")).toBeNull();
  });

  it("appends custom class after base class", () => {
    const { container } = render(() => <Avatar class="c" />);
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-avatar c");
  });
});
