import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import CircularProgress from "../../components/CircularProgress";

describe("CircularProgress", () => {
  it("renders a div with class moon-circular-progress and data-value=0 (defaults)", () => {
    const { container } = render(() => <CircularProgress />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el.className).toBe("moon-circular-progress");
    expect(el.getAttribute("data-value")).toBe("0");
  });

  it("appends size modifier and sets data-value when size and value provided", () => {
    const { container } = render(() => <CircularProgress size="xl" value={42} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe("moon-circular-progress moon-circular-progress-xl");
    expect(el.getAttribute("data-value")).toBe("42");
  });

  it("does not append size modifier when size is md (default)", () => {
    const { container } = render(() => <CircularProgress size="md" value={10} />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe("moon-circular-progress");
  });

  it("appends custom class", () => {
    const { container } = render(() => <CircularProgress class="c" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe("moon-circular-progress c");
  });

  it("passes rest props to the div", () => {
    const { container } = render(() => <CircularProgress data-testid="cp" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("data-testid")).toBe("cp");
  });
});
