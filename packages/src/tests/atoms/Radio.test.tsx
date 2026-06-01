import { render } from "@solidjs/testing-library";
import { describe, it, expect } from "vitest";
import Radio from "../../components/Radio";

describe("Radio", () => {
  it("bare: renders input[type=radio] with class moon-radio", () => {
    const { container } = render(() => <Radio />);
    const input = container.querySelector("input");
    expect(input).not.toBeNull();
    expect(input!.type).toBe("radio");
    expect(input!.className).toBe("moon-radio");
  });

  it("bare: appends caller class to moon-radio", () => {
    const { container } = render(() => <Radio class="extra" />);
    const input = container.querySelector("input");
    expect(input!.className).toBe("moon-radio extra");
  });

  it("with label: renders label > input.moon-radio + span", () => {
    const { container } = render(() => <Radio label="L" />);
    const label = container.querySelector("label");
    expect(label).not.toBeNull();
    const input = label!.querySelector("input");
    expect(input).not.toBeNull();
    expect(input!.className).toBe("moon-radio");
    const span = label!.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.textContent).toBe("L");
  });

  it("with label + class: caller class goes on the label element, not the input", () => {
    const { container } = render(() => <Radio label="X" class="outer" />);
    const label = container.querySelector("label");
    expect(label!.className).toBe("outer");
    const input = label!.querySelector("input");
    expect(input!.className).toBe("moon-radio");
  });

  describe("Radio.Group", () => {
    it("renders div[role=radiogroup].moon-radio-group", () => {
      const { container } = render(() => (
        <Radio.Group name="g">
          <Radio />
        </Radio.Group>
      ));
      const div = container.querySelector("div");
      expect(div).not.toBeNull();
      expect(div!.getAttribute("role")).toBe("radiogroup");
      expect(div!.className).toBe("moon-radio-group");
    });

    it("appends caller class to moon-radio-group", () => {
      const { container } = render(() => (
        <Radio.Group name="g" class="extra">
          <Radio />
        </Radio.Group>
      ));
      const div = container.querySelector("div");
      expect(div!.className).toBe("moon-radio-group extra");
    });

    it("injects group name onto all child Radio inputs (context replaces cloneElement)", () => {
      const { container } = render(() => (
        <Radio.Group name="groupName">
          <Radio />
          <Radio />
        </Radio.Group>
      ));
      const inputs = container.querySelectorAll("input[type=radio]");
      expect(inputs.length).toBe(2);
      expect(inputs[0].getAttribute("name")).toBe("groupName");
      expect(inputs[1].getAttribute("name")).toBe("groupName");
    });

    it("group name overrides a Radio's own name prop", () => {
      const { container } = render(() => (
        <Radio.Group name="groupWins">
          <Radio name="ownName" />
        </Radio.Group>
      ));
      const input = container.querySelector("input[type=radio]");
      expect(input!.getAttribute("name")).toBe("groupWins");
    });
  });
});
