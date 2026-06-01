import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Checkbox from "../../components/Checkbox";

describe("Checkbox", () => {
  it("bare: renders input[type=checkbox] with class moon-checkbox", () => {
    const { container } = render(() => <Checkbox />);
    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input!.type).toBe("checkbox");
    expect(input!.className).toBe("moon-checkbox");
  });

  it("bare: appends caller class after base class", () => {
    const { container } = render(() => <Checkbox class="extra" />);
    const input = container.querySelector("input");
    expect(input!.className).toBe("moon-checkbox extra");
  });

  it("bare: forwards rest props onto the input", () => {
    const { container } = render(() => <Checkbox name="agree" aria-label="agree" />);
    const input = container.querySelector("input");
    expect(input!.getAttribute("name")).toBe("agree");
    expect(input!.getAttribute("aria-label")).toBe("agree");
  });

  it("label branch: renders label > input.moon-checkbox + span with label text", () => {
    const { container } = render(() => <Checkbox label="Accept" />);
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    const input = label!.querySelector("input");
    expect(input).not.toBeNull();
    expect(input!.type).toBe("checkbox");
    expect(input!.className).toBe("moon-checkbox");
    const span = label!.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe("Accept");
  });

  it("label branch: caller class goes on the label, not the input", () => {
    const { container } = render(() => <Checkbox label="L" class="outer" />);
    const label = container.querySelector("label");
    expect(label!.className).toBe("outer");
    const input = label!.querySelector("input");
    expect(input!.className).toBe("moon-checkbox");
  });

  it("label branch: forwards rest props onto the input", () => {
    const { container } = render(() => <Checkbox label="L" name="cb" />);
    const input = container.querySelector("input");
    expect(input!.getAttribute("name")).toBe("cb");
  });
});
