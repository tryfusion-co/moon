import { render } from "@solidjs/testing-library";
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

  it("applies modifier classes in correct order: size, variant, context", () => {
    const { container } = render(() => (
      <Tag size="2xs" variant="outline" context="error">
        x
      </Tag>
    ));
    const div = container.firstChild as HTMLDivElement;
    expect(div.getAttribute("class")).toBe(
      "moon-tag moon-tag-2xs moon-tag-outline moon-tag-error"
    );
  });

  it("appends local.class last", () => {
    const { container } = render(() => <Tag class="c">x</Tag>);
    const div = container.firstChild as HTMLDivElement;
    expect(div.getAttribute("class")).toBe("moon-tag c");
  });
});
