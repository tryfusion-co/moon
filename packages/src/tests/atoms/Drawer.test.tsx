import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi, beforeAll } from "vitest";
import Drawer from "../../components/Drawer";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe("Drawer", () => {
  it("Content portals <dialog.moon-drawer> to document.body", () => {
    render(() => (
      <Drawer>
        <Drawer.Content>
          <Drawer.Header>Title</Drawer.Header>
          <Drawer.Close />
        </Drawer.Content>
      </Drawer>
    ));
    const dialog = document.body.querySelector("dialog.moon-drawer");
    expect(dialog).not.toBeNull();
  });

  it("dialog has moon-drawer class", () => {
    render(() => (
      <Drawer>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>
    ));
    const dialog = document.body.querySelector("dialog.moon-drawer");
    expect(dialog).not.toBeNull();
    expect(dialog!.className).toBe("moon-drawer");
  });

  it("Trigger renders a span with display:contents style", () => {
    const { container } = render(() => (
      <Drawer>
        <Drawer.Trigger>
          <button>open</button>
        </Drawer.Trigger>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>
    ));
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.style.display).toBe("contents");
  });

  it("Trigger click calls showModal on the signal-ref", () => {
    const showModalMock = vi.fn();
    HTMLDialogElement.prototype.showModal = showModalMock;

    const { container } = render(() => (
      <Drawer>
        <Drawer.Trigger>
          <button>open</button>
        </Drawer.Trigger>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>
    ));

    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    fireEvent.click(span!);
    expect(showModalMock).toHaveBeenCalledOnce();
  });

  it("Close click calls close() on the signal-ref", () => {
    const closeMock = vi.fn();
    HTMLDialogElement.prototype.close = closeMock;

    render(() => (
      <Drawer>
        <Drawer.Content>
          <Drawer.Close />
        </Drawer.Content>
      </Drawer>
    ));

    const closeBtn = document.body.querySelector("button.moon-drawer-close");
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn!);
    expect(closeMock).toHaveBeenCalledOnce();
  });

  it("Close calls optional onClick handler in addition to close()", () => {
    const closeMock = vi.fn();
    const extraMock = vi.fn();
    HTMLDialogElement.prototype.close = closeMock;

    render(() => (
      <Drawer>
        <Drawer.Content>
          <Drawer.Close onClick={extraMock} />
        </Drawer.Content>
      </Drawer>
    ));

    const closeBtn = document.body.querySelector("button.moon-drawer-close");
    fireEvent.click(closeBtn!);
    expect(closeMock).toHaveBeenCalledOnce();
    expect(extraMock).toHaveBeenCalledOnce();
  });

  it("Header renders as <div class=moon-drawer-header>", () => {
    render(() => (
      <Drawer>
        <Drawer.Content>
          <Drawer.Header>My Header</Drawer.Header>
        </Drawer.Content>
      </Drawer>
    ));
    const header = document.body.querySelector("div.moon-drawer-header");
    expect(header).not.toBeNull();
    expect(header!.textContent).toBe("My Header");
  });

  it("moon-drawer-box wraps children inside dialog", () => {
    render(() => (
      <Drawer>
        <Drawer.Content>inner</Drawer.Content>
      </Drawer>
    ));
    const box = document.body.querySelector("dialog.moon-drawer .moon-drawer-box");
    expect(box).not.toBeNull();
  });

  it("moon-backdrop form is present inside dialog", () => {
    render(() => (
      <Drawer>
        <Drawer.Content>body</Drawer.Content>
      </Drawer>
    ));
    const form = document.body.querySelector("dialog.moon-drawer form.moon-backdrop");
    expect(form).not.toBeNull();
    expect(form!.getAttribute("method")).toBe("dialog");
  });

  it("Content accepts and appends caller class", () => {
    render(() => (
      <Drawer>
        <Drawer.Content class="extra">body</Drawer.Content>
      </Drawer>
    ));
    const dialog = document.body.querySelector("dialog");
    expect(dialog!.className).toBe("moon-drawer extra");
  });
});
