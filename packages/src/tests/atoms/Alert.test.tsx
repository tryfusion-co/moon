import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import Alert from "../../components/Alert";

describe("Alert", () => {
  it("renders root div with base class moon-alert and children", () => {
    const { container } = render(() => <Alert>body</Alert>);
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.className).toBe("moon-alert");
    expect(div!.textContent).toBe("body");
  });

  it("applies variant and context modifier classes", () => {
    const { container } = render(() => (
      <Alert variant="outline" context="error">
        x
      </Alert>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-alert moon-alert-outline moon-alert-error");
  });

  it("applies soft variant and positive context (legacy coverage)", () => {
    const { container } = render(() => (
      <Alert variant="soft" context="positive">
        Custom Alert
      </Alert>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-alert moon-alert-soft moon-alert-positive");
  });

  it("default variant=fill context=brand: only moon-alert base class", () => {
    const { container } = render(() => <Alert>Default Alert</Alert>);
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-alert");
  });

  it("appends custom class after base", () => {
    const { container } = render(() => <Alert class="c">x</Alert>);
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-alert c");
  });

  describe("Alert.Close", () => {
    it("renders CloseIcon svg when no children provided", () => {
      const { container } = render(() => <Alert.Close />);
      const p = container.querySelector("p");
      expect(p).not.toBeNull();
      expect(p!.className).toBe("moon-alert-close");
      expect(container.querySelector("svg")).not.toBeNull();
    });

    it("renders children text and no svg when children provided", () => {
      const { container } = render(() => <Alert.Close>X</Alert.Close>);
      const p = container.querySelector("p");
      expect(p!.textContent).toBe("X");
      expect(container.querySelector("svg")).toBeNull();
    });

    it("fires onClick handler", () => {
      const spy = vi.fn();
      const { container } = render(() => <Alert.Close onClick={spy} />);
      fireEvent.click(container.querySelector("p")!);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe("Alert.Content", () => {
    it("renders div with class moon-alert-content and children", () => {
      const { container } = render(() => <Alert.Content>c</Alert.Content>);
      const div = container.querySelector("div");
      expect(div!.className).toBe("moon-alert-content");
      expect(div!.textContent).toBe("c");
    });
  });

  describe("Alert.Meta", () => {
    it("renders p with class moon-alert-meta and children", () => {
      const { container } = render(() => <Alert.Meta>m</Alert.Meta>);
      const p = container.querySelector("p");
      expect(p!.className).toBe("moon-alert-meta");
      expect(p!.textContent).toBe("m");
    });
  });

  describe("Alert.Action", () => {
    it("renders button with class moon-alert-action and children", () => {
      const { container } = render(() => <Alert.Action>a</Alert.Action>);
      const btn = container.querySelector("button");
      expect(btn!.className).toBe("moon-alert-action");
      expect(btn!.textContent).toBe("a");
    });

    it("fires onClick handler", () => {
      const spy = vi.fn();
      const { container } = render(() => (
        <Alert.Action onClick={spy}>click</Alert.Action>
      ));
      fireEvent.click(container.querySelector("button")!);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
