import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi } from "vitest";
import Authenticator from "../../components/Authenticator";

describe("Authenticator", () => {
  it("renders div[role=group].moon-authenticator with 6 inputs by default", () => {
    const { container } = render(() => <Authenticator />);
    const div = container.querySelector("div");
    expect(div).not.toBeNull();
    expect(div!.getAttribute("role")).toBe("group");
    expect(div!.className).toContain("moon-authenticator");
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBe(6);
  });

  it("renders length=4 inputs when length prop is 4", () => {
    const { container } = render(() => <Authenticator length={4} />);
    const inputs = container.querySelectorAll("input");
    expect(inputs.length).toBe(4);
  });

  it("applies size modifier moon-authenticator-lg when size=lg", () => {
    const { container } = render(() => <Authenticator size="lg" />);
    const div = container.querySelector("div")!;
    expect(div.className).toContain("moon-authenticator-lg");
  });

  it("applies variant modifier moon-authenticator-outline when variant=outline", () => {
    const { container } = render(() => <Authenticator variant="outline" />);
    const div = container.querySelector("div")!;
    expect(div.className).toContain("moon-authenticator-outline");
  });

  it("does NOT apply size/variant modifier for defaults (md/fill)", () => {
    const { container } = render(() => <Authenticator size="md" variant="fill" />);
    const div = container.querySelector("div")!;
    expect(div.className).not.toContain("moon-authenticator-md");
    expect(div.className).not.toContain("moon-authenticator-fill");
  });

  it("applies error modifier moon-authenticator-error when error=true", () => {
    const { container } = render(() => <Authenticator error />);
    const div = container.querySelector("div")!;
    expect(div.className).toContain("moon-authenticator-error");
  });

  it("fires onChange with the typed char via onInput on first input", () => {
    const spy = vi.fn();
    const { container } = render(() => <Authenticator onChange={spy} />);
    const inputs = container.querySelectorAll<HTMLInputElement>("input");
    fireEvent.input(inputs[0], { target: { value: "5" } });
    expect(spy).toHaveBeenCalledTimes(1);
    const calledWith: string = spy.mock.calls[0][0];
    expect(calledWith).toContain("5");
  });

  it("disables all inputs when disabled=true", () => {
    const { container } = render(() => <Authenticator disabled />);
    const inputs = container.querySelectorAll<HTMLInputElement>("input");
    inputs.forEach((input) => {
      expect(input.disabled).toBe(true);
    });
  });
});
