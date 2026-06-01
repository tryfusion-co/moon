# Codebase Concerns

**Analysis Date:** 2026-06-01

## Tech Debt

### Unsafe Type Assertions in Compound Components

**Issue:** Multiple components use `as any` type assertions to work around TypeScript constraints in compound component patterns.

**Files:**
- `packages/src/components/Radio.tsx:17` - `React.cloneElement(child as React.ReactElement<any>, { name })`
- `packages/src/components/TabList.tsx:74-79` - `...(child.props as any)` and `} as any)` assertions

**Impact:** These assertions bypass TypeScript's type safety system, making it impossible to detect type mismatches at compile time. This creates maintenance risk when component APIs change and can hide bugs in component prop spreading.

**Fix approach:**
- Create generic typed helper functions for safely cloning elements with specific props
- Use discriminated unions or type-safe guards instead of `as any`
- Example: Create a `safeCloneElement<T extends {}>()` helper with explicit prop typing

---

### useMemo Usage in Non-Memoized Component

**Issue:** `Pagination.tsx:57` uses `React.useMemo(() => {...}, [])` to check RTL direction, but the computation runs once and never updates.

**Files:** `packages/src/components/Pagination.tsx:57-63`

**Impact:** The RTL check is performed only at initial render and will not respond to dynamic direction changes (e.g., document language switch or runtime CSS changes). The empty dependency array `[]` is correct but confusing in this context since useMemo is not actually preventing re-computation—the DOM query is expensive and should happen once.

**Fix approach:**
- Replace `useMemo` with a regular variable initialized at component render level (not in hook)
- If RTL check must update dynamically, move to useEffect with proper dependencies
- Document why the check exists and is static

---

### Event Listener Memory Leaks Risk

**Issue:** `Carousel.tsx:94-110` uses manual event listener setup with cleanup, but the pattern is fragile.

**Files:** `packages/src/components/Carousel.tsx:94-110`

**Impact:** While cleanup is present, the pattern relies on manual ref management. If `reelRef` becomes null or changes unexpectedly, listeners won't be removed, causing memory leaks. The `updateScrollState` callback is included in the dependency array (`[updateScrollState]`) but `updateScrollState` itself has an empty dependency array, creating a tight coupling.

**Fix approach:**
- Consider using a custom hook like `useEventListener()` to encapsulate the listener lifecycle
- Verify `reelRef` is never mutated during component lifetime
- Add integration tests that verify listeners are cleaned up after unmount

---

## Known Issues

### Portal Rendering Without SSR Guard

**Issue:** Multiple components use `createPortal(node, document.body)` without checking if `document` exists.

**Files:**
- `packages/src/components/Dialog.tsx:36`
- `packages/src/components/BottomSheet.tsx:54`
- `packages/src/components/Drawer.tsx:61`

**Impact:** These components will crash during server-side rendering (SSR) because `document` is not defined in Node.js environments. This breaks any Next.js or SSR usage of the library.

**Trigger:** Rendering Dialog, BottomSheet, or Drawer on the server side.

**Workaround:** Use dynamic imports with `{ ssr: false }` (Next.js) or check `typeof document !== 'undefined'` before rendering.

**Fix approach:**
- Add runtime check: `if (typeof document === 'undefined') return null;` in Content components
- Document SSR limitations explicitly in README
- Consider lazy-loading portal components only in useEffect

---

### Unguarded DOM Query in Pagination

**Issue:** `Pagination.tsx:59` queries `.moon-pagination` element every render cycle, but the element might not exist yet or might be cached.

**Files:** `packages/src/components/Pagination.tsx:57-63`

**Impact:** The selector `.moon-pagination` is hardcoded and queries the DOM directly. If multiple Pagination components exist or if the class name changes in CSS, the query returns unexpected results. The `document.querySelector` is wrapped in a useMemo check, but only runs once.

**Fix approach:**
- Pass RTL state as a prop instead of querying the DOM
- If RTL detection is needed, use `useEffect` with a proper dependency on the pagination element ref
- Add a prop like `isRTL?: boolean` to avoid DOM queries altogether

---

## Security Considerations

### Unescaped HTML in Portal Content

**Issue:** While Dialog/BottomSheet/Drawer components themselves are safe, the pattern of rendering portal content without validation could allow XSS if children contain unsanitized content.

**Files:**
- `packages/src/components/Dialog.tsx:29-37`
- `packages/src/components/BottomSheet.tsx:41-54`
- `packages/src/components/Drawer.tsx:54-61`

**Current mitigation:** React's JSX escapes text content by default. Props and event handlers are controlled by the parent component.

**Recommendations:**
- Document that component children should not include raw HTML from untrusted sources
- Consider adding a `dangerouslySetInnerHTML` prop example in Storybook showing the security implications
- Add a security note to README about XSS prevention

---

## Performance Bottlenecks

### Carousel Scroll State Updates on Resize

**Issue:** `Carousel.tsx:100-101` attaches a `resize` listener to the `window` that calls `updateScrollState()` on every resize event.

**Files:** `packages/src/workspace/moon/packages/src/components/Carousel.tsx:100-101`

**Impact:** On browsers with frequent resize events (e.g., during viewport transitions or DevTools toggle), this can trigger multiple re-renders. The scroll state updates are throttled by React's batching, but the DOM query in `updateScrollState` runs on every event.

**Improvement path:**
- Add debounce or throttle to the resize listener (e.g., `lodash.debounce` or custom implementation)
- Consider using ResizeObserver instead of window resize event for observing the reel element specifically

---

### Repeated DOM Selectors in Carousel Scroll

**Issue:** `Carousel.tsx:74` queries for `.moon-carousel-item` on every scroll event.

**Files:** `packages/src/components/Carousel.tsx:70-92`

**Impact:** The selector `reel.querySelector(".moon-carousel-item")` runs synchronously on every scroll, causing layout thrashing. If the carousel has many items, this DOM query is expensive.

**Improvement path:**
- Cache the first carousel item element in a useRef during initial setup
- Use optional chaining and early returns if the item is not found
- Add a comment explaining why the query is necessary

---

## Fragile Areas

### Compound Component Pattern Relies on Children Type Checking

**Issue:** Components like Accordion, Dialog, and TabList use `React.isValidElement(child)` and type checks (`child.type === Item`) to identify compound components.

**Files:**
- `packages/src/components/Accordion.tsx:35`
- `packages/src/components/TabList.tsx:72`
- `packages/src/components/Radio.tsx:16`

**Why fragile:** If a parent passes wrapped children (e.g., `<Fragment>{children}</Fragment>`), the component type check fails and props are not injected. This breaks the compound pattern silently—no error, just lost functionality.

**Safe modification:**
- Add prop spreading with explicit name injection instead of relying on cloneElement
- Use context to pass required props instead of DOM-based props cloning
- Test with wrapped children scenarios

**Test coverage:** Missing test cases for:
- Wrapped children with Fragment
- Conditional rendering of compound children
- Children inside arrays

---

### Ref Management in Dialog Component

**Issue:** `Dialog.tsx:59` creates a ref that is shared across all compound sub-components via context.

**Files:** `packages/src/components/Dialog.tsx:1-76`

**Why fragile:** The `dialogRef` is initialized to `null` in the default context (`DEFAULT_DIALOG_CONTEXT`), and sub-components (`Trigger`, `Content`, `Close`) assume it is always populated. If someone renders a sub-component outside the Root provider, it will silently fail to work.

**Safe modification:**
- Add TypeScript NonNullable or required checks
- Create a custom hook `useDialogContext()` that throws if context is not found
- Document the compound component order requirement

---

## Missing Critical Features

### No Accessibility Testing

**Issue:** Components are marked with ARIA attributes (`aria-label`, `aria-selected`, `role`), but no automated accessibility tests exist.

**Files:** All components with ARIA attributes lack corresponding a11y test suites.

**Problem:** The ARIA attributes are hardcoded (e.g., Dialog.Trigger uses no role, TabList.Item has `role="tab"` only sometimes). Without tests, ARIA mismatches and accessibility regressions go undetected.

**Fix:** Add `jest-axe` or similar a11y testing tool to the test suite and create a11y snapshots for critical components (Dialog, Dropdown, TabList, Menu).

---

## Test Coverage Gaps

### Dialog Component SSR Not Tested

**Issue:** Dialog uses `createPortal(node, document.body)` but no test verifies SSR behavior.

**Files:** `packages/src/components/Dialog.tsx`, `packages/src/tests/Dialog.test.tsx`

**What's not tested:** Rendering on the server side (Node.js), hydration mismatch scenarios.

**Risk:** SSR users will encounter crashes at runtime with no early warning.

**Priority:** High

---

### Carousel Resize Listener Cleanup Not Verified

**Issue:** Carousel attaches window resize listeners but tests don't verify listener cleanup.

**Files:** `packages/src/components/Carousel.tsx`, `packages/src/tests/` (no dedicated Carousel test found)

**What's not tested:** Unmounting carousel verifies listeners are removed, multiple carousel instances don't leak listeners, resize handler is debounced correctly.

**Risk:** Memory leaks in apps with dynamic carousel creation/destruction.

**Priority:** Medium

---

### Pagination RTL Logic Not Tested

**Issue:** `Pagination.tsx:57-63` includes RTL detection logic but tests don't verify RTL rendering.

**Files:** `packages/src/components/Pagination.tsx`, `packages/src/tests/Pagination.test.tsx`

**What's not tested:** RTL direction reversal, chevron direction flip, DOM direction attribute changes.

**Risk:** RTL users encounter broken pagination controls in production.

**Priority:** Medium

---

### Radio Group Name Injection Not Tested Thoroughly

**Issue:** `Radio.tsx:15-20` injects `name` prop into children via cloneElement, but tests may not cover all edge cases.

**Files:** `packages/src/components/Radio.tsx`, radio tests

**What's not tested:** Multiple radio groups on the same page, nested radio groups, wrapped children.

**Risk:** Form submission sends unexpected radio values.

**Priority:** High

---

## Scaling Limits

### No Lazy Loading for Portal Components

**Issue:** Dialog, BottomSheet, and Drawer all render to document.body immediately, even if never opened.

**Files:**
- `packages/src/components/Dialog.tsx`
- `packages/src/components/BottomSheet.tsx`
- `packages/src/components/Drawer.tsx`

**Current capacity:** Small app pages work fine. Large apps with 20+ modals will have DOM overhead.

**Limit:** Performance degrades with many unmounted modal components in the DOM.

**Scaling path:**
- Lazy-load portal content with `<Suspense>` or conditional rendering
- Render portal only when needed (on first open) using `useLayoutEffect`
- Provide opt-in lazy loading mode

---

## Dependencies at Risk

### React 19 Peer Dependency Without Major Tests

**Issue:** Package specifies `react@^19.2.4` as peer dependency, but the codebase was originally built for an older React version.

**Files:** `packages/package.json:63`

**Risk:** Breaking changes in React 19 (e.g., ref forwarding, Suspense boundaries, concurrent rendering) could silently break component behavior. No major version React tests exist.

**Migration plan:**
- Add React 18 and React 19 to test matrix (if not already present)
- Run full integration test suite against both versions
- Document React version compatibility in README

---

### Testing Library Version Mismatch Risk

**Issue:** `@testing-library/react@^16.3.2` is pinned but the library evolves frequently. Tests may not reflect best practices.

**Files:** `packages/package.json:69`

**Risk:** New versions may deprecate testing patterns used in this codebase. Stale patterns reduce test reliability.

**Improvement:**
- Run `npm audit` regularly to catch deprecated patterns
- Update testing-library docs links in test comments if patterns change

---

## Code Quality Issues

### Inconsistent Component Export Pattern

**Issue:** Some components export compound sub-components via `Object.assign()`, but the barrel file auto-generation may not catch all exported types.

**Files:** 
- `packages/src/components/Dialog.tsx:74`
- `packages/scripts/generate-barrel.js` (barrel generation logic)

**Impact:** Exported types like `DialogSizes` or `DialogVariants` may not be included in the generated `index.ts`, breaking tree-shaking and causing larger bundle sizes.

**Fix approach:**
- Validate barrel file exports match actual component exports
- Add CI check to ensure barrel file is up-to-date after component changes

---

---

*Concerns audit: 2026-06-01*
