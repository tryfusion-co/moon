import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import type { Component } from "solid-js";

const Probe: Component = () => <div data-testid="probe">ok</div>;

describe("toolchain", () => {
  it("renders a Solid component in jsdom without server-build errors", () => {
    const { getByTestId } = render(() => <Probe />);
    expect(getByTestId("probe").textContent).toBe("ok");
  });
});
