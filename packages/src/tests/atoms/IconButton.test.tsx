import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
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

  it("applies variant, size, context modifier classes (outline/lg/info)", () => {
    const { container } = render(() => (
      <IconButton variant="outline" size="lg" context="info" />
    ));
    const button = container.firstChild as HTMLButtonElement;
    expect(button.className).toContain("moon-icon-button-outline");
    expect(button.className).toContain("moon-icon-button-lg");
    expect(button.className).toContain("moon-icon-button-info");
  });

  it("appends local.class last", () => {
    const { container } = render(() => <IconButton class="x" />);
    const button = container.firstChild as HTMLButtonElement;
    expect(button.getAttribute("class")).toBe("moon-icon-button x");
  });

  it("calls onClick handler when clicked", () => {
    const handleClick = vi.fn();
    const { container } = render(() => (
      <IconButton onClick={handleClick} />
    ));
    const button = container.firstChild as HTMLButtonElement;
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("forwards rest props (disabled)", () => {
    const { container } = render(() => <IconButton disabled />);
    const button = container.firstChild as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it("forwards data-testid", () => {
    const { getByTestId } = render(() => (
      <IconButton data-testid="icon-btn" />
    ));
    expect(getByTestId("icon-btn")).not.toBeNull();
  });
});
