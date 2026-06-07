/**
 * SSR safety smoke test.
 *
 * The Solid compiler hoists `delegateEvents(["eventName"])` to module level
 * for every `onClick={...}`, `onInput={...}`, etc. in JSX. `delegateEvents`
 * calls `document` to register global event delegation, so any component
 * compiled that way crashes the moment the barrel is imported in an SSR
 * environment (SolidStart, Vinxi, etc.) where `document` is undefined.
 *
 * This test deletes `document` from the global scope and dynamically
 * imports the barrel. If any component still has `onClick`/`onInput`/`...`
 * in its source, the import will throw `ReferenceError: document is not
 * defined`. Pass = the barrel is SSR-safe.
 *
 * Regression for: tryfusion-co/moon-solid SSR fix (onClick → onMount + addEventListener).
 */
import { describe, it, expect, afterEach } from "vitest";

const ORIGINAL_DOCUMENT = globalThis.document;

describe("SSR safety (barrel import with no document)", () => {
  afterEach(() => {
    if (ORIGINAL_DOCUMENT === undefined) {
      // @ts-expect-error - restoring test environment
      delete globalThis.document;
    } else {
      globalThis.document = ORIGINAL_DOCUMENT;
    }
  });

  it("importing @tryfusion-co/moon-solid barrel does not access document at module level", async () => {
    // @ts-expect-error - intentionally stripping document to simulate SSR
    delete globalThis.document;

    await expect(import("../../dist/index.js")).resolves.toBeDefined();
  });
});
