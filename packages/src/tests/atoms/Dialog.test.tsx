import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi, beforeAll } from "vitest";
import Dialog from "../../components/Dialog";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe("Dialog", () => {
  it("Content portals <dialog.moon-dialog> to document.body", () => {
    render(() => (
      <Dialog>
        <Dialog.Content>
          <Dialog.Header>Title</Dialog.Header>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog>
    ));
    const dialog = document.body.querySelector("dialog.moon-dialog");
    expect(dialog).not.toBeNull();
  });

  it("dialog has moon-dialog class", () => {
    render(() => (
      <Dialog>
        <Dialog.Content>body</Dialog.Content>
      </Dialog>
    ));
    const dialog = document.body.querySelector("dialog");
    expect(dialog).not.toBeNull();
    expect(dialog!.className).toBe("moon-dialog");
  });

  it("Trigger click calls showModal on the signal-ref", () => {
    const showModalMock = vi.fn();
    HTMLDialogElement.prototype.showModal = showModalMock;

    render(() => (
      <Dialog>
        <Dialog.Trigger>open</Dialog.Trigger>
        <Dialog.Content>body</Dialog.Content>
      </Dialog>
    ));

    const trigger = document.body.querySelector("p");
    expect(trigger).not.toBeNull();
    fireEvent.click(trigger!);
    expect(showModalMock).toHaveBeenCalledOnce();
  });

  it("Close click calls close() on the signal-ref", () => {
    const closeMock = vi.fn();
    HTMLDialogElement.prototype.close = closeMock;

    render(() => (
      <Dialog>
        <Dialog.Trigger>open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog>
    ));

    const closeBtn = document.body.querySelector("button.moon-dialog-close");
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn!);
    expect(closeMock).toHaveBeenCalledOnce();
  });

  it("Header renders as <header class=moon-dialog-header>", () => {
    render(() => (
      <Dialog>
        <Dialog.Content>
          <Dialog.Header>My Header</Dialog.Header>
        </Dialog.Content>
      </Dialog>
    ));
    const header = document.body.querySelector("header.moon-dialog-header");
    expect(header).not.toBeNull();
    expect(header!.textContent).toBe("My Header");
  });

  it("moon-dialog-box wraps children inside dialog", () => {
    render(() => (
      <Dialog>
        <Dialog.Content>inner</Dialog.Content>
      </Dialog>
    ));
    const box = document.body.querySelector("dialog.moon-dialog .moon-dialog-box");
    expect(box).not.toBeNull();
  });

  it("moon-backdrop form is present inside dialog", () => {
    render(() => (
      <Dialog>
        <Dialog.Content>body</Dialog.Content>
      </Dialog>
    ));
    const form = document.body.querySelector("dialog.moon-dialog form.moon-backdrop");
    expect(form).not.toBeNull();
    expect(form!.getAttribute("method")).toBe("dialog");
  });
});
