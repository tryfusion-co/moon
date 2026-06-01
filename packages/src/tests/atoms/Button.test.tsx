import { fireEvent, render } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import Button from "../../components/Button";

describe("Button", () => {
  it("renders a <button> with base class moon-button by default", () => {
    const { container } = render(() => <Button />);
    const button = container.firstChild as HTMLButtonElement;
    expect(button.tagName).toBe("BUTTON");
    expect(button.getAttribute("class")).toBe("moon-button");
  });

  it("applies modifier classes in correct order: variant, size, context, fullWidth", () => {
    const { container } = render(() => (
      <Button variant="outline" size="lg" context="error" isFullWidth />
    ));
    const button = container.firstChild as HTMLButtonElement;
    expect(button.getAttribute("class")).toBe(
      "moon-button moon-button-outline moon-button-lg moon-button-error moon-button-full-width"
    );
  });

  it("appends local.class last", () => {
    const { container } = render(() => <Button class="extra" />);
    const button = container.firstChild as HTMLButtonElement;
    expect(button.getAttribute("class")).toBe("moon-button extra");
  });

  it("forwards rest props (disabled) via spread", () => {
    const { container } = render(() => <Button disabled />);
    const button = container.firstChild as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    const { container } = render(() => <Button onClick={handleClick}>Click</Button>);
    const button = container.firstChild as HTMLButtonElement;
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
