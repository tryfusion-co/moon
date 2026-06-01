import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Loader from "../../components/Loader";

describe("Loader", () => {
  it("renders a div with class moon-loader (default)", () => {
    const { container } = render(() => <Loader />);
    const el = container.firstChild as HTMLElement;
    expect(el.tagName.toLowerCase()).toBe("div");
    expect(el.className).toBe("moon-loader");
  });

  it("appends size modifier when size !== md", () => {
    const { container } = render(() => <Loader size="lg" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe("moon-loader moon-loader-lg");
  });

  it("does not append size modifier when size is md (default)", () => {
    const { container } = render(() => <Loader size="md" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe("moon-loader");
  });

  it("appends custom class", () => {
    const { container } = render(() => <Loader class="c" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe("moon-loader c");
  });

  it("appends size modifier and custom class", () => {
    const { container } = render(() => <Loader size="xs" class="extra" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toBe("moon-loader moon-loader-xs extra");
  });
});
