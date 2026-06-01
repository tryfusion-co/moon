import { render, fireEvent } from "@solidjs/testing-library";
import { describe, it, expect, vi, beforeAll } from "vitest";
import BottomSheet from "../../components/BottomSheet";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe("BottomSheet", () => {
  it("Content portals <dialog.moon-bottom-sheet> to document.body", () => {
    render(() => (
      <BottomSheet>
        <BottomSheet.Content>
          <BottomSheet.Header>Title</BottomSheet.Header>
          <BottomSheet.Close />
        </BottomSheet.Content>
      </BottomSheet>
    ));
    const dialog = document.body.querySelector("dialog.moon-bottom-sheet");
    expect(dialog).not.toBeNull();
  });

  it("dialog has moon-bottom-sheet class", () => {
    render(() => (
      <BottomSheet>
        <BottomSheet.Content>body</BottomSheet.Content>
      </BottomSheet>
    ));
    const dialog = document.body.querySelector("dialog.moon-bottom-sheet");
    expect(dialog).not.toBeNull();
    expect(dialog!.className).toBe("moon-bottom-sheet");
  });

  it("Trigger renders a span with display:contents style", () => {
    const { container } = render(() => (
      <BottomSheet>
        <BottomSheet.Trigger>
          <button>open</button>
        </BottomSheet.Trigger>
        <BottomSheet.Content>body</BottomSheet.Content>
      </BottomSheet>
    ));
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span!.style.display).toBe("contents");
  });

  it("Trigger click calls showModal on the signal-ref", () => {
    const showModalMock = vi.fn();
    HTMLDialogElement.prototype.showModal = showModalMock;

    const { container } = render(() => (
      <BottomSheet>
        <BottomSheet.Trigger>
          <button>open</button>
        </BottomSheet.Trigger>
        <BottomSheet.Content>body</BottomSheet.Content>
      </BottomSheet>
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
      <BottomSheet>
        <BottomSheet.Content>
          <BottomSheet.Close />
        </BottomSheet.Content>
      </BottomSheet>
    ));

    const closeBtn = document.body.querySelector("button.moon-bottom-sheet-close");
    expect(closeBtn).not.toBeNull();
    fireEvent.click(closeBtn!);
    expect(closeMock).toHaveBeenCalledOnce();
  });

  it("Close calls optional onClick handler in addition to close()", () => {
    const closeMock = vi.fn();
    const extraMock = vi.fn();
    HTMLDialogElement.prototype.close = closeMock;

    render(() => (
      <BottomSheet>
        <BottomSheet.Content>
          <BottomSheet.Close onClick={extraMock} />
        </BottomSheet.Content>
      </BottomSheet>
    ));

    const closeBtn = document.body.querySelector("button.moon-bottom-sheet-close");
    fireEvent.click(closeBtn!);
    expect(closeMock).toHaveBeenCalledOnce();
    expect(extraMock).toHaveBeenCalledOnce();
  });

  it("Header renders as <header class=moon-bottom-sheet-header>", () => {
    render(() => (
      <BottomSheet>
        <BottomSheet.Content>
          <BottomSheet.Header>My Header</BottomSheet.Header>
        </BottomSheet.Content>
      </BottomSheet>
    ));
    const header = document.body.querySelector("header.moon-bottom-sheet-header");
    expect(header).not.toBeNull();
    expect(header!.textContent).toBe("My Header");
  });

  it("hasHandle=false (default) does NOT render moon-bottom-sheet-handle", () => {
    render(() => (
      <BottomSheet>
        <BottomSheet.Content>body</BottomSheet.Content>
      </BottomSheet>
    ));
    const handle = document.body.querySelector(".moon-bottom-sheet-handle");
    expect(handle).toBeNull();
  });

  it("hasHandle=true renders moon-bottom-sheet-handle inside moon-bottom-sheet-box", () => {
    render(() => (
      <BottomSheet hasHandle={true}>
        <BottomSheet.Content>body</BottomSheet.Content>
      </BottomSheet>
    ));
    const handle = document.body.querySelector(
      ".moon-bottom-sheet-box .moon-bottom-sheet-handle"
    );
    expect(handle).not.toBeNull();
  });

  it("moon-bottom-sheet-box wraps children inside dialog", () => {
    render(() => (
      <BottomSheet>
        <BottomSheet.Content>inner</BottomSheet.Content>
      </BottomSheet>
    ));
    const box = document.body.querySelector("dialog.moon-bottom-sheet .moon-bottom-sheet-box");
    expect(box).not.toBeNull();
  });

  it("moon-backdrop form is present inside dialog", () => {
    render(() => (
      <BottomSheet>
        <BottomSheet.Content>body</BottomSheet.Content>
      </BottomSheet>
    ));
    const form = document.body.querySelector("dialog.moon-bottom-sheet form.moon-backdrop");
    expect(form).not.toBeNull();
    expect(form!.getAttribute("method")).toBe("dialog");
  });

  it("Content accepts and appends caller class", () => {
    render(() => (
      <BottomSheet>
        <BottomSheet.Content class="extra">body</BottomSheet.Content>
      </BottomSheet>
    ));
    const dialog = document.body.querySelector("dialog");
    expect(dialog!.className).toBe("moon-bottom-sheet extra");
  });
});
