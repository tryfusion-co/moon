# Testing Patterns

**Analysis Date:** 2026-06-01

## Test Framework

**Runner:**
- Jest 30.3.0
- Config: `packages/jest.config.js`
- Test environment: jsdom (for DOM testing in Node)
- Preset: ts-jest (TypeScript transpilation)

**Assertion Library:**
- Jest's built-in `expect` API
- @testing-library/jest-dom (^6.9.1) for extended matchers like `.toBeInTheDocument()`, `.toHaveClass()`, `.toBeDisabled()`

**Run Commands:**
```bash
npm run test                    # Run all tests (executes: jest --config jest.config.js)
npm run test -- --watch        # Watch mode for development
npm run test -- --coverage     # Generate coverage report
```

## Test File Organization

**Location:**
- Tests co-located in `packages/src/tests/` directory
- Separate from component implementation files
- Each component has corresponding test file in same directory

**Naming:**
- Component tests: Match component name with `.test.tsx` suffix
  - `Button.tsx` → `Button.test.tsx`
  - `Alert.tsx` → `Alert.test.tsx`
  - `Accordion.tsx` → `accordion.test.tsx` (note: lowercase for this file only)
- All test files use `.tsx` extension (JSX syntax in tests)

**Structure:**
```
packages/src/
├── components/
│   ├── Button.tsx
│   ├── Alert.tsx
│   ├── Accordion.tsx
│   └── ... (more components)
└── tests/
    ├── Button.test.tsx
    ├── Alert.test.tsx
    ├── accordion.test.tsx
    ├── Tag.test.tsx
    ├── ... (19 test files total)
    └── setupTests.ts
```

## Test Setup

**Setup File:**
- Location: `packages/src/tests/setupTests.ts`
- Jest config references: `setupFilesAfterEnv: ["<rootDir>/src/tests/setupTests.ts"]`
- Content: Imports `@testing-library/jest-dom` to enable DOM matchers

**Global Mocks:**
Some tests implement global mocks for HTMLDialogElement methods (example from `Dropdown.test.tsx:6-24`):
```typescript
beforeAll(() => {
  HTMLDialogElement.prototype.show = jest.fn(function mock(
    this: HTMLDialogElement
  ) {
    this.open = true;
  });

  HTMLDialogElement.prototype.showModal = jest.fn(function mock(
    this: HTMLDialogElement
  ) {
    this.open = true;
  });

  HTMLDialogElement.prototype.close = jest.fn(function mock(
    this: HTMLDialogElement
  ) {
    this.open = false;
  });
});
```

## Test Structure

**Suite Organization:**
```typescript
describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass("moon-button");
  });

  it("applies variant, size, and context classes", () => {
    render(
      <Button variant="outline" size="lg" context="caution">
        Test
      </Button>
    );
    const button = screen.getByRole("button", { name: /test/i });
    expect(button).toHaveClass("moon-button-outline");
    expect(button).toHaveClass("moon-button-lg");
    expect(button).toHaveClass("moon-button-caution");
  });

  describe("Alert.Content", () => {
    it("renders children correctly", () => {
      render(
        <Alert>
          <Alert.Content>Alert body</Alert.Content>
        </Alert>
      );
      expect(screen.getByText("Alert body")).toBeInTheDocument();
    });
  });
});
```

**Patterns:**
- Top-level `describe` per component
- Nested `describe` blocks for sub-components (e.g., `describe("Alert.Content", {...})`)
- One assertion focus per test (single responsibility)
- Test names describe the behavior being validated: "renders with default props", "applies variant, size, and context classes"

**Setup:**
- No explicit beforeEach or afterEach hooks used (tests are stateless)
- `beforeAll` used only when global mocks needed (HTMLDialogElement in modal tests)
- Component instances created fresh per test via `render()`

**Teardown:**
- Handled automatically by RTL's cleanup (runs after each test)
- No manual cleanup required

**Assertions:**
- Primary pattern: `expect(element).toHaveClass("class-name")`
- Common assertions:
  - `.toBeInTheDocument()` - element exists in DOM
  - `.toHaveClass()` - CSS class is applied
  - `.toBeDisabled()` - element has disabled attribute
  - `.toHaveAttribute()` - element has specific attribute
  - `.toHaveTextContent()` - element contains text
  - `.toHaveBeenCalledTimes(n)` - mock function call count

## Mocking

**Framework:** Jest's built-in mocking

**Patterns:**
```typescript
// Mock functions for handlers
const handleClick = jest.fn();
render(<Button onClick={handleClick}>Click</Button>);
fireEvent.click(screen.getByRole("button", { name: /click/i }));
expect(handleClick).toHaveBeenCalledTimes(1);
```

**What to Mock:**
- Event handlers: onClick, onToggle, etc.
- HTMLDialogElement methods in tests that use <dialog>: show(), showModal(), close()
- Component callbacks and function props

**What NOT to Mock:**
- React internals
- Testing library functions (render, screen, fireEvent)
- Component implementations (test the actual behavior)
- Native HTML elements unless they have incomplete jsdom support

## Testing Queries

**Primary Query Methods:**
- `screen.getByRole()` - Query by semantic HTML role (preferred for accessibility)
  - Example: `screen.getByRole("button", { name: /click me/i })`
  - Example: `screen.getByRole("button")` for multiple buttons
- `screen.getByText()` - Query by text content
  - Example: `screen.getByText("Alert body")`
  - Used with regex patterns for case-insensitive matching: `/click me/i`
- `screen.getByTestId()` - Query by data-testid attribute (when role/text insufficient)
  - Example: `screen.getByTestId("table")`
  - Example: `screen.getByTestId("item")`
- `screen.queryByText()` - Non-throwing query (returns null if not found)
  - Example: `expect(screen.queryByText("Option 1")).not.toBeInTheDocument()`
- `container.firstChild` - Direct DOM access via render return
  - Example: `const { container } = render(...); const snackbar = container.firstChild;`

## User Interactions

**Event Firing:**
```typescript
import { fireEvent } from "@testing-library/react";

fireEvent.click(element);
fireEvent.click(screen.getByText("Open Dropdown"));
```

**User Event (preferred for real user simulation):**
```typescript
import userEvent from "@testing-library/user-event";

await userEvent.click(item);
```

**DOM Manipulation:**
```typescript
// For controlled components with dialog elements
const details = summary.closest("details") as HTMLDetailsElement;
expect(details.open).toBe(false);
fireEvent.click(summary);
expect(details.open).toBe(true);
```

## Testing Common Component Patterns

**Simple Components (Button, Badge, Tag):**
```typescript
it("renders with default props", () => {
  render(<Button>Click me</Button>);
  const button = screen.getByRole("button", { name: /click me/i });
  expect(button).toBeInTheDocument();
  expect(button).toHaveClass("moon-button");
});

it("applies variant, size, and context classes", () => {
  render(
    <Button variant="outline" size="lg" context="caution">
      Test
    </Button>
  );
  const button = screen.getByRole("button", { name: /test/i });
  expect(button).toHaveClass("moon-button-outline");
  expect(button).toHaveClass("moon-button-lg");
  expect(button).toHaveClass("moon-button-caution");
});
```

**Stateful Components (Accordion, Dialog, Drawer):**
```typescript
it("toggles open state when clicking the title", () => {
  render(
    <Accordion>
      <Accordion.Item>
        <Accordion.Header>Toggle</Accordion.Header>
        <Accordion.Content>Hidden content</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );

  const summary = screen.getByText("Toggle");
  const details = summary.closest("details") as HTMLDetailsElement;
  expect(details.open).toBe(false);

  fireEvent.click(summary);
  expect(details.open).toBe(true);
});

it("respects initiallyOpen prop", () => {
  render(
    <Accordion>
      <Accordion.Item initiallyOpen>
        <Accordion.Header>Open</Accordion.Header>
        <Accordion.Content>Visible</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );

  const summary = screen.getByText("Open");
  const details = summary.closest("details") as HTMLDetailsElement;
  expect(details.open).toBe(true);
});
```

**Compound Components (Alert, Snackbar, List):**
```typescript
describe("Alert.Content", () => {
  it("renders children correctly", () => {
    render(
      <Alert>
        <Alert.Content>Alert body</Alert.Content>
      </Alert>
    );
    expect(screen.getByText("Alert body")).toBeInTheDocument();
  });
});

describe("Alert.Action", () => {
  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(
      <Alert>
        <Alert.Action onClick={handleClick}>Click Me</Alert.Action>
      </Alert>
    );
    fireEvent.click(screen.getByText("Click Me"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

**Table Component (Complex Structure):**
```typescript
it("renders with default size (md)", () => {
  render(
    <Table data-testid="table">
      <Table.Head>
        <Table.Row>
          <Table.HeadCell>Header</Table.HeadCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        <Table.Row>
          <Table.Cell>Data</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table>
  );

  const table = screen.getByTestId("table");
  expect(table.tagName).toBe("TABLE");
  expect(table).toHaveClass("moon-table");
  expect(screen.getByText("Header")).toBeInTheDocument();
  expect(screen.getByText("Data")).toBeInTheDocument();
});
```

## Async Testing

**Async Pattern:**
```typescript
import userEvent from "@testing-library/user-event";

it("renders List.Item with custom className and props", async () => {
  const onClick = jest.fn();
  render(
    <List>
      <List.Item className="custom-item" data-testid="item" onClick={onClick}>
        Click me
      </List.Item>
    </List>
  );

  const item = screen.getByTestId("item");
  await userEvent.click(item);
  expect(onClick).toHaveBeenCalled();
});
```

**Conditional Rendering (Snackbar):**
```typescript
it("should not render when isOpen is false", () => {
  const { container } = render(
    <Snackbar isOpen={false}>Hidden Snackbar</Snackbar>
  );
  expect(container.firstChild).toBeNull();
});

it("should render when isOpen is true", () => {
  render(<Snackbar isOpen>Visible Snackbar</Snackbar>);
  expect(screen.getByText("Visible Snackbar")).toBeInTheDocument();
});
```

## Error Testing

**Not explicitly demonstrated in existing tests** - No error boundary or error state testing observed. Error handling relies on component prop validation at JSX usage level.

## Coverage

**Requirements:** None enforced - no coverage threshold configured

**View Coverage:**
```bash
npm run test -- --coverage
```

**Current Status:**
- 19 test files covering 30+ components
- 131+ test cases across entire suite
- Focus on prop application and user interaction

## Test Types

**Unit Tests:**
- Scope: Individual component rendering and prop behavior
- Approach: Test component in isolation with different prop combinations
- Example: Button with variant, size, context props applied correctly
- Assertion: CSS classes match expected values

**Integration Tests:**
- Scope: Compound components with multiple sub-components
- Approach: Test component hierarchy and communication between parts
- Example: Alert with Alert.Content, Alert.Action, Alert.Meta working together
- Assertion: Each sub-component renders with correct class names and event handlers

**E2E Tests:**
- Framework: Not used
- Approach: Component library uses Storybook for manual E2E testing (docs/stories/)
- No automated E2E test suite for component interactions

---

*Testing analysis: 2026-06-01*
