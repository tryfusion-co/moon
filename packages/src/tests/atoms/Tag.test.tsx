import { render, screen } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Tag from "../../components/Tag";

describe("Tag", () => {
  it("renders a <div> with base class moon-tag and correct textContent", () => {
    const { container } = render(() => <Tag>hi</Tag>);
    const div = container.firstChild as HTMLDivElement;
    expect(div.tagName).toBe("DIV");
    expect(div.getAttribute("class")).toBe("moon-tag");
    expect(div.textContent).toBe("hi");
  });

  it("renders children as visible text", () => {
    render(() => <Tag>Test Tag</Tag>);
    expect(screen.getByText("Test Tag")).toBeInTheDocument();
  });

  it("applies modifier classes in correct order: size, variant, context (negative)", () => {
    const { container } = render(() => (
      <Tag size="2xs" variant="outline" context="negative">
        x
      </Tag>
    ));
    const div = container.firstChild as HTMLDivElement;
    expect(div.getAttribute("class")).toBe(
      "moon-tag moon-tag-2xs moon-tag-outline moon-tag-negative"
    );
  });

  it("applies size, variant, and context classes (info)", () => {
    const { container } = render(() => (
      <Tag size="2xs" variant="outline" context="info">
        Styled Tag
      </Tag>
    ));
    const div = container.firstChild as HTMLDivElement;
    expect(div).toHaveClass("moon-tag-2xs");
    expect(div).toHaveClass("moon-tag-outline");
    expect(div).toHaveClass("moon-tag-info");
  });

  it("appends local.class last", () => {
    const { container } = render(() => <Tag class="c">x</Tag>);
    const div = container.firstChild as HTMLDivElement;
    expect(div.getAttribute("class")).toBe("moon-tag c");
  });

  it("appends custom class", () => {
    const { container } = render(() => <Tag class="custom-class">Custom Tag</Tag>);
    const div = container.firstChild as HTMLDivElement;
    expect(div).toHaveClass("custom-class");
  });
});
