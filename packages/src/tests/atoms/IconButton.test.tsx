import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import IconButton from "../../components/IconButton";

describe("IconButton", () => {
  it("renders a <button> with base class moon-icon-button by default", () => {
    const { container } = render(() => <IconButton />);
    const button = container.firstChild as HTMLButtonElement;
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("class")).toBe("moon-icon-button");
  });

  it("applies modifier classes in correct order: variant, size, context, rounded", () => {
    const { container } = render(() => (
      <IconButton variant="ghost" size="xl" context="error" isRounded />
    ));
    const button = container.firstChild as HTMLButtonElement;
    expect(button.getAttribute("class")).toBe(
      "moon-icon-button moon-icon-button-ghost moon-icon-button-xl moon-icon-button-error moon-icon-button-rounded"
    );
  });

  it("appends local.class last", () => {
    const { container } = render(() => <IconButton class="x" />);
    const button = container.firstChild as HTMLButtonElement;
    expect(button.getAttribute("class")).toBe("moon-icon-button x");
  });
});
