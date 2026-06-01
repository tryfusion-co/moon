import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Dropdown from "../../components/Dropdown";

describe("Dropdown", () => {
  it("renders root div.moon-dropdown", () => {
    const { container } = render(() => (
      <Dropdown>
        <span>child</span>
      </Dropdown>
    ));
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.className).toBe("moon-dropdown");
  });

  it("appends custom class to root", () => {
    const { container } = render(() => (
      <Dropdown class="extra">
        <span>child</span>
      </Dropdown>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-dropdown extra");
  });

  describe("Dropdown.Trigger", () => {
    it("renders a span with display:contents style, role=button, tabIndex=0", () => {
      const { container } = render(() => (
        <Dropdown.Trigger>
          <button>open</button>
        </Dropdown.Trigger>
      ));
      const span = container.querySelector("span");
      expect(span).not.toBeNull();
      expect(span!.getAttribute("role")).toBe("button");
      expect(span!.tabIndex).toBe(0);
      // style contains display: contents
      expect(span!.style.display).toBe("contents");
    });

    it("renders its child inside the span", () => {
      const { container } = render(() => (
        <Dropdown.Trigger>
          <button>click me</button>
        </Dropdown.Trigger>
      ));
      const btn = container.querySelector("button");
      expect(btn).not.toBeNull();
      expect(btn!.textContent).toBe("click me");
    });
  });

  describe("Dropdown.Content", () => {
    it("renders div.moon-dropdown-content with tabIndex=0", () => {
      const { container } = render(() => (
        <Dropdown.Content>menu</Dropdown.Content>
      ));
      const div = container.querySelector("div");
      expect(div).not.toBeNull();
      expect(div!.className).toBe("moon-dropdown-content");
      expect(div!.tabIndex).toBe(0);
    });

    it("appends custom class", () => {
      const { container } = render(() => (
        <Dropdown.Content class="extra">menu</Dropdown.Content>
      ));
      const div = container.querySelector("div");
      expect(div!.className).toBe("moon-dropdown-content extra");
    });
  });
});
