import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Snackbar from "../../components/Snackbar";

describe("Snackbar", () => {
  it("isOpen=true renders div.moon-snackbar", () => {
    const { container } = render(() => (
      <Snackbar isOpen={true}>content</Snackbar>
    ));
    const div = container.querySelector("div.moon-snackbar");
    expect(div).not.toBeNull();
    expect(div!.className).toBe("moon-snackbar");
  });

  it("isOpen=false renders nothing (Show gate)", () => {
    const { container } = render(() => (
      <Snackbar isOpen={false}>content</Snackbar>
    ));
    const div = container.querySelector(".moon-snackbar");
    expect(div).toBeNull();
  });

  it("variant=fill (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <Snackbar isOpen={true} variant="fill">
        x
      </Snackbar>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-snackbar");
  });

  it("variant=soft adds moon-snackbar-soft modifier", () => {
    const { container } = render(() => (
      <Snackbar isOpen={true} variant="soft">
        x
      </Snackbar>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toContain("moon-snackbar-soft");
  });

  it("context=error adds moon-snackbar-error modifier", () => {
    const { container } = render(() => (
      <Snackbar isOpen={true} context="error">
        x
      </Snackbar>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toContain("moon-snackbar-error");
  });

  describe("Snackbar.Action", () => {
    it("renders div.moon-snackbar-action", () => {
      const { container } = render(() => (
        <Snackbar.Action>act</Snackbar.Action>
      ));
      const div = container.querySelector("div");
      expect(div).not.toBeNull();
      expect(div!.className).toBe("moon-snackbar-action");
    });
  });

  describe("Snackbar.Meta", () => {
    it("renders div.moon-snackbar-meta", () => {
      const { container } = render(() => (
        <Snackbar.Meta>meta</Snackbar.Meta>
      ));
      const div = container.querySelector("div");
      expect(div!.className).toBe("moon-snackbar-meta");
    });
  });

  describe("Snackbar.Group", () => {
    it("renders div.moon-snackbar-group", () => {
      const { container } = render(() => (
        <Snackbar.Group>group</Snackbar.Group>
      ));
      const div = container.querySelector("div");
      expect(div!.className).toBe("moon-snackbar-group");
    });
  });
});
