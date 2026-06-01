import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import LinearProgress from "../../components/LinearProgress";

describe("LinearProgress", () => {
  it("no-label: renders bare progress with class moon-linear-progress", () => {
    const { container } = render(() => <LinearProgress value={30} />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("progress");
    expect(el.className).toBe("moon-linear-progress");
    expect(el.getAttribute("value")).toBe("30");
    expect(el.getAttribute("max")).toBe("100");
  });

  it("no-label: appends size modifier when size !== 2xs (default)", () => {
    const { container } = render(() => <LinearProgress value={30} size="3xs" />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("progress");
    expect(el.className).toBe("moon-linear-progress moon-linear-progress-3xs");
  });

  it("no-label: appends class to progress element", () => {
    const { container } = render(() => <LinearProgress value={30} class="c" />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("progress");
    expect(el.className).toBe("moon-linear-progress c");
  });

  it("with-label: root is label with class=c; progress inside has no class c; span has label text", () => {
    const { container } = render(() => (
      <LinearProgress value={30} label="Done" class="c" />
    ));
    const label = container.firstChild as HTMLElement;
    expect(label.tagName.toLowerCase()).toBe("label");
    expect(label.className).toBe("c");

    const progress = label.querySelector("progress") as HTMLElement;
    expect(progress).not.toBeNull();
    expect(progress.className).toBe("moon-linear-progress");
    expect(progress.getAttribute("value")).toBe("30");
    expect(progress.getAttribute("max")).toBe("100");

    const span = label.querySelector("span") as HTMLElement;
    expect(span).not.toBeNull();
    expect(span.textContent).toBe("Done");
  });

  it("with-label: label has no class when class is undefined", () => {
    const { container } = render(() => (
      <LinearProgress value={50} label="Loading" />
    ));
    const label = container.firstChild as HTMLElement;
    expect(label.tagName.toLowerCase()).toBe("label");
    // className should be empty string or absent when no class passed
    expect(label.className).toBe("");
  });
});
