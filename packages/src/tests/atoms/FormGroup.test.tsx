import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import FormGroup from "../../components/FormGroup";

describe("FormGroup", () => {
  it("renders root div with base class moon-form-group and children", () => {
    const { container } = render(() => <FormGroup>body</FormGroup>);
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.className).toBe("moon-form-group");
    expect(div!.textContent).toBe("body");
  });

  it("adds moon-form-group-error when error prop is true", () => {
    const { container } = render(() => <FormGroup error>err</FormGroup>);
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-form-group moon-form-group-error");
  });

  it("appends caller class after base classes", () => {
    const { container } = render(() => (
      <FormGroup class="my-class">x</FormGroup>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-form-group my-class");
  });

  it("appends caller class after error modifier", () => {
    const { container } = render(() => (
      <FormGroup error class="extra">
        x
      </FormGroup>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-form-group moon-form-group-error extra");
  });

  it("forwards rest props onto the root div", () => {
    const { container } = render(() => (
      <FormGroup data-testid="fg">x</FormGroup>
    ));
    const div = container.querySelector("div");
    expect(div!.getAttribute("data-testid")).toBe("fg");
  });

  describe("FormGroup.Label", () => {
    it("renders a label element with the passed class verbatim", () => {
      const { container } = render(() => (
        <FormGroup.Label class="lbl-class">My Label</FormGroup.Label>
      ));
      const label = container.querySelector("label");
      expect(label).not.toBeNull();
      expect(label!.className).toBe("lbl-class");
      expect(label!.textContent).toBe("My Label");
    });

    it("renders label with no class when none provided", () => {
      const { container } = render(() => (
        <FormGroup.Label>No class</FormGroup.Label>
      ));
      const label = container.querySelector("label");
      expect(label!.className).toBe("");
    });

    it("forwards rest props onto the label", () => {
      const { container } = render(() => (
        <FormGroup.Label data-testid="lbl">x</FormGroup.Label>
      ));
      const label = container.querySelector("label");
      expect(label!.getAttribute("data-testid")).toBe("lbl");
    });
  });

  describe("FormGroup.Hint", () => {
    it("renders a p element with base class moon-form-hint and children", () => {
      const { container } = render(() => (
        <FormGroup.Hint>Hint text</FormGroup.Hint>
      ));
      const p = container.querySelector("p");
      expect(p).not.toBeNull();
      expect(p!.className).toBe("moon-form-hint");
      expect(p!.textContent).toBe("Hint text");
    });

    it("appends caller class after moon-form-hint", () => {
      const { container } = render(() => (
        <FormGroup.Hint class="extra-hint">x</FormGroup.Hint>
      ));
      const p = container.querySelector("p");
      expect(p!.className).toBe("moon-form-hint extra-hint");
    });
  });
});
