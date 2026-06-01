import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Input from "../../components/Input";

describe("Input", () => {
  it("renders an <input> with base class moon-input by default", () => {
    const { container } = render(() => <Input />);
    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input!.className).toBe("moon-input");
  });

  it("applies size modifier when size != md", () => {
    const { container } = render(() => <Input size="lg" />);
    const input = container.querySelector("input")!;
    expect(input.className).toBe("moon-input moon-input-lg");
  });

  it("applies variant modifier when variant != fill", () => {
    const { container } = render(() => <Input variant="outline" />);
    const input = container.querySelector("input")!;
    expect(input.className).toBe("moon-input moon-input-outline");
  });

  it("applies error modifier when error=true", () => {
    const { container } = render(() => <Input error />);
    const input = container.querySelector("input")!;
    expect(input.className).toBe("moon-input moon-input-error");
  });

  it("applies all modifiers in order: base size variant error caller", () => {
    const { container } = render(() => (
      <Input size="lg" variant="outline" error class="extra" />
    ));
    const input = container.querySelector("input")!;
    expect(input.className).toBe(
      "moon-input moon-input-lg moon-input-outline moon-input-error extra"
    );
  });

  it("appends caller class last", () => {
    const { container } = render(() => <Input class="my-input" />);
    const input = container.querySelector("input")!;
    expect(input.className).toBe("moon-input my-input");
  });

  it("forwards type prop", () => {
    const { container } = render(() => <Input type="email" />);
    const input = container.querySelector("input")!;
    expect(input.type).toBe("email");
  });

  it("forwards rest props via spread", () => {
    const { container } = render(() => (
      <Input name="email-field" placeholder="Enter email" />
    ));
    const input = container.querySelector("input")!;
    expect(input.getAttribute("name")).toBe("email-field");
    expect(input.getAttribute("placeholder")).toBe("Enter email");
  });
});
