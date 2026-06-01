import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Badge from "../../components/Badge";

describe("Badge", () => {
  it("renders a span with base class moon-badge and children", () => {
    const { container } = render(() => <Badge>5</Badge>);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.className).toBe("moon-badge");
    expect(span!.textContent).toBe("5");
  });

  it("applies variant and context modifier classes", () => {
    const { container } = render(() => (
      <Badge variant="outline" context="negative">
        x
      </Badge>
    ));
    const span = container.querySelector("span");
    expect(span!.className).toBe("moon-badge moon-badge-outline moon-badge-negative");
  });

  it("appends custom class after base class", () => {
    const { container } = render(() => <Badge class="c">x</Badge>);
    const span = container.querySelector("span");
    expect(span!.className).toBe("moon-badge c");
  });
});
