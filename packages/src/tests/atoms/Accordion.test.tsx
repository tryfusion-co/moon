import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Accordion from "../../components/Accordion";

describe("Accordion", () => {
  it("renders div.moon-accordion", () => {
    const { container } = render(() => (
      <Accordion>
        <Accordion.Item>
          <Accordion.Header>Title</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    ));
    const div = container.querySelector("div.moon-accordion");
    expect(div).not.toBeNull();
  });

  it("size=sm adds moon-accordion-sm modifier", () => {
    const { container } = render(() => (
      <Accordion size="sm">
        <Accordion.Item>
          <Accordion.Header>T</Accordion.Header>
        </Accordion.Item>
      </Accordion>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toContain("moon-accordion-sm");
  });

  it("size=md (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <Accordion size="md">
        <Accordion.Item>
          <Accordion.Header>T</Accordion.Header>
        </Accordion.Item>
      </Accordion>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-accordion");
  });

  it("variant=ghost adds moon-accordion-ghost modifier", () => {
    const { container } = render(() => (
      <Accordion variant="ghost">
        <Accordion.Item>
          <Accordion.Header>T</Accordion.Header>
        </Accordion.Item>
      </Accordion>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toContain("moon-accordion-ghost");
  });

  it("variant=fill (default) does NOT add modifier class", () => {
    const { container } = render(() => (
      <Accordion variant="fill">
        <Accordion.Item>
          <Accordion.Header>T</Accordion.Header>
        </Accordion.Item>
      </Accordion>
    ));
    const div = container.querySelector("div");
    expect(div!.className).toBe("moon-accordion");
  });

  describe("Accordion.Item", () => {
    it("renders details.moon-accordion-item", () => {
      const { container } = render(() => (
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>T</Accordion.Header>
          </Accordion.Item>
        </Accordion>
      ));
      const details = container.querySelector("details");
      expect(details).not.toBeNull();
      expect(details!.className).toContain("moon-accordion-item");
    });

    it("initiallyOpen renders details[open].moon-accordion-open", () => {
      const { container } = render(() => (
        <Accordion>
          <Accordion.Item initiallyOpen>
            <Accordion.Header>T</Accordion.Header>
            <Accordion.Content>C</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      ));
      const details = container.querySelector("details");
      expect(details).not.toBeNull();
      expect(details!.open).toBe(true);
      expect(details!.className).toContain("moon-accordion-open");
    });

    it("closed by default — no moon-accordion-open class", () => {
      const { container } = render(() => (
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>T</Accordion.Header>
          </Accordion.Item>
        </Accordion>
      ));
      const details = container.querySelector("details");
      expect(details!.className).not.toContain("moon-accordion-open");
      expect(details!.open).toBe(false);
    });
  });

  describe("Accordion.Header", () => {
    it("renders summary.moon-accordion-item-header", () => {
      const { container } = render(() => (
        <Accordion>
          <Accordion.Item>
            <Accordion.Header>Title</Accordion.Header>
          </Accordion.Item>
        </Accordion>
      ));
      const summary = container.querySelector("summary");
      expect(summary).not.toBeNull();
      expect(summary!.className).toBe("moon-accordion-item-header");
      expect(summary!.textContent).toBe("Title");
    });
  });

  describe("Accordion.Content", () => {
    it("renders div.moon-accordion-item-content", () => {
      const { container } = render(() => (
        <Accordion>
          <Accordion.Item>
            <Accordion.Content>Body</Accordion.Content>
          </Accordion.Item>
        </Accordion>
      ));
      const div = container.querySelector(".moon-accordion-item-content");
      expect(div).not.toBeNull();
      expect(div!.textContent).toBe("Body");
    });
  });

  describe("Accordion.Meta", () => {
    it("renders div.moon-accordion-item-meta", () => {
      const { container } = render(() => (
        <Accordion>
          <Accordion.Item>
            <Accordion.Meta>Meta</Accordion.Meta>
          </Accordion.Item>
        </Accordion>
      ));
      const div = container.querySelector(".moon-accordion-item-meta");
      expect(div).not.toBeNull();
    });
  });
});
