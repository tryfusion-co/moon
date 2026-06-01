import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Breadcrumb from "../../components/Breadcrumb";

describe("Breadcrumb", () => {
  it("renders nav > ol with base class moon-breadcrumb and children", () => {
    const { container } = render(() => (
      <Breadcrumb>
        <li>a</li>
      </Breadcrumb>
    ));
    const nav = container.querySelector("nav");
    expect(nav).not.toBeNull();
    const ol = nav!.querySelector("ol");
    expect(ol).not.toBeNull();
    expect(ol!.className).toBe("moon-breadcrumb");
    expect(ol!.querySelector("li")).not.toBeNull();
  });

  it("appends custom class to ol", () => {
    const { container } = render(() => (
      <Breadcrumb class="c">
        <li>a</li>
      </Breadcrumb>
    ));
    const ol = container.querySelector("ol");
    expect(ol!.className).toBe("moon-breadcrumb c");
  });

  describe("Breadcrumb.Item", () => {
    it("renders li with base class moon-breadcrumb-item and children", () => {
      const { container } = render(() => (
        <Breadcrumb.Item>home</Breadcrumb.Item>
      ));
      const li = container.querySelector("li");
      expect(li).not.toBeNull();
      expect(li!.className).toBe("moon-breadcrumb-item");
      expect(li!.textContent).toBe("home");
    });

    it("adds active modifier when isActive is true", () => {
      const { container } = render(() => (
        <Breadcrumb.Item isActive>now</Breadcrumb.Item>
      ));
      const li = container.querySelector("li");
      expect(li!.className).toBe("moon-breadcrumb-item moon-breadcrumb-item-active");
    });

    it("appends custom class after base and active modifier", () => {
      const { container } = render(() => (
        <Breadcrumb.Item class="x">y</Breadcrumb.Item>
      ));
      const li = container.querySelector("li");
      expect(li!.className).toBe("moon-breadcrumb-item x");
    });

    it("spreads rest props onto li element", () => {
      const { container } = render(() => (
        <Breadcrumb.Item aria-label="home">home</Breadcrumb.Item>
      ));
      const li = container.querySelector("li");
      expect(li!.getAttribute("aria-label")).toBe("home");
    });
  });
});
