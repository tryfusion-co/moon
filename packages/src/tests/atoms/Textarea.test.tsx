import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Textarea from "../../components/Textarea";

describe("Textarea", () => {
  it("renders a <textarea> with base class moon-textarea by default", () => {
    const { container } = render(() => <Textarea />);
    const ta = container.querySelector("textarea");
    expect(ta).not.toBeNull();
    expect(ta!.className).toBe("moon-textarea");
  });

  it("applies size modifier when size != md", () => {
    const { container } = render(() => <Textarea size="lg" />);
    const ta = container.querySelector("textarea")!;
    expect(ta.className).toBe("moon-textarea moon-textarea-lg");
  });

  it("applies variant modifier when variant != fill", () => {
    const { container } = render(() => <Textarea variant="outline" />);
    const ta = container.querySelector("textarea")!;
    expect(ta.className).toBe("moon-textarea moon-textarea-outline");
  });

  it("applies error modifier when error=true", () => {
    const { container } = render(() => <Textarea error />);
    const ta = container.querySelector("textarea")!;
    expect(ta.className).toBe("moon-textarea moon-textarea-error");
  });

  it("applies all modifiers in order: base size variant error caller", () => {
    const { container } = render(() => (
      <Textarea size="lg" variant="outline" error class="extra" />
    ));
    const ta = container.querySelector("textarea")!;
    expect(ta.className).toBe(
      "moon-textarea moon-textarea-lg moon-textarea-outline moon-textarea-error extra"
    );
  });

  it("appends caller class last", () => {
    const { container } = render(() => <Textarea class="my-ta" />);
    const ta = container.querySelector("textarea")!;
    expect(ta.className).toBe("moon-textarea my-ta");
  });

  it("forwards rest props via spread", () => {
    const { container } = render(() => (
      <Textarea name="bio" placeholder="Enter bio" rows={4} />
    ));
    const ta = container.querySelector("textarea")!;
    expect(ta.getAttribute("name")).toBe("bio");
    expect(ta.getAttribute("placeholder")).toBe("Enter bio");
    expect(ta.getAttribute("rows")).toBe("4");
  });
});
