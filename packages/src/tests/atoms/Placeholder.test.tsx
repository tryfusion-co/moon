import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Placeholder from "../../components/Placeholder";

describe("Placeholder", () => {
  it("renders a div with class moon-placeholder", () => {
    const { container } = render(() => <Placeholder />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el.className).toBe("moon-placeholder");
  });

  it("appends custom class", () => {
    const { container } = render(() => <Placeholder class="c" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe("moon-placeholder c");
  });
});
