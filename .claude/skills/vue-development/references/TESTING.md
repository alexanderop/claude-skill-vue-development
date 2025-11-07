# Testing Best Practices

> **For Claude Code:**
> - **When to load:** User asks about testing, writing tests, debugging test failures, or mentions test patterns
> - **Quick scan:** Read only "Core Philosophy" and "Query Variants" sections for simple questions
> - **Deep dive:** Load full file when implementing tests or debugging complex test scenarios
> - **Always cite:** Reference "Page Object Pattern" or specific testing pattern when suggesting tests
> - **Quick templates:** For copy-paste code, direct user to [QUICK-LOOKUP.md](QUICK-LOOKUP.md)

Testing-first approach using Vue Testing Library.

## Core Philosophy

**Test user behavior, never implementation details.**

### What to Test

✅ **User-facing behavior**
- What the user sees
- What the user clicks
- What happens after interaction

❌ **Implementation details**
- Component internal state
- Method names
- Component structure
- Props/data values directly

---

## Testing Stack

- **Vitest** - Test runner
- **Vue Testing Library** - Component testing (wraps @vue/test-utils)
- **Playwright** - E2E testing

---

## Component Testing with Testing Library

### Basic Structure with Page Object Pattern

**Use Page Object Pattern to encapsulate component interactions:**

```typescript
// Button.test.ts
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import Button from './Button.vue'

describe('Button', () => {
  it('should display button text', () => {
    const { getButton } = renderButton({ text: 'Click me' })

    expect(getButton()).toBeInTheDocument()
  })

  it('should call onClick handler when clicked', async () => {
    const onClick = vi.fn()
    const { clickButton } = renderButton({ text: 'Click me', onClick })

    await clickButton()

    expect(onClick).toHaveBeenCalledOnce()
  })
})

// ============================================
// PAGE OBJECT
// ============================================
function renderButton(props = {}) {
  const user = userEvent.setup()

  render(Button, { props })

  return {
    // Queries
    getButton: () => screen.getByRole('button'),

    // Actions
    clickButton: async () => {
      await user.click(screen.getByRole('button'))
    }
  }
}
```

### Finding Elements

**Priority order (from best to worst):**

1. **Accessible queries** (best for users and screen readers)
   - `getByRole`
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`

2. **Semantic queries**
   - `getByAltText`
   - `getByTitle`

3. **Test IDs** (last resort)
   - `getByTestId`

**Encapsulate queries in Page Object functions:**

```typescript
// ✅ Good - Uses accessible queries with Page Object Pattern
it('should allow user to submit form', async () => {
  const { fillEmail, fillPassword, submitForm, getWelcomeMessage } = renderLoginForm()

  await fillEmail('test@example.com')
  await fillPassword('password123')
  await submitForm()

  expect(getWelcomeMessage()).toBeInTheDocument()
})

// ============================================
// PAGE OBJECT
// ============================================
function renderLoginForm(props = {}) {
  const user = userEvent.setup()

  render(LoginForm, { props })

  return {
    // Queries
    getEmailInput: () => screen.getByLabelText('Email'),
    getPasswordInput: () => screen.getByLabelText('Password'),
    getSubmitButton: () => screen.getByRole('button', { name: 'Sign In' }),
    getWelcomeMessage: () => screen.getByText('Welcome back!'),

    // Actions
    fillEmail: async (email: string) => {
      await user.type(screen.getByLabelText('Email'), email)
    },
    fillPassword: async (password: string) => {
      await user.type(screen.getByLabelText('Password'), password)
    },
    submitForm: async () => {
      await user.click(screen.getByRole('button', { name: 'Sign In' }))
    }
  }
}

// ❌ Bad - Tests implementation details
it('should update email state', async () => {
  const wrapper = mount(LoginForm)

  await wrapper.find('[data-testid="email"]').setValue('test@example.com')

  expect(wrapper.vm.email).toBe('test@example.com')  // Accessing internals!
})
```

---

## Query Variants

### getBy vs queryBy vs findBy

```typescript
// getBy* - Throws if not found (use for elements that should exist)
const button = screen.getByRole('button')

// queryBy* - Returns null if not found (use for elements that shouldn't exist)
const error = screen.queryByText('Error message')
expect(error).not.toBeInTheDocument()

// findBy* - Returns promise, waits for element (use for async)
const loadedData = await screen.findByText('Data loaded')
```

### getAllBy variants

```typescript
// Get multiple elements
const items = screen.getAllByRole('listitem')
expect(items).toHaveLength(3)
```

---

## Test Naming Convention

**Pattern:** `should [verb] [expected outcome] when [trigger event]`

```typescript
describe('TodoList', () => {
  it('should display todo items when loaded', () => { })
  it('should add new todo when user submits form', () => { })
  it('should mark todo as complete when user clicks checkbox', () => { })
  it('should remove todo when user clicks delete button', () => { })
  it('should show error message when API fails', () => { })
})
```

---

## User Interactions

**Always use `userEvent` over `fireEvent`:**

```typescript
import userEvent from '@testing-library/user-event'

it('should handle user input', async () => {
  const user = userEvent.setup()

  render(SearchForm)

  // ✅ userEvent - Simulates real user behavior
  await user.type(screen.getByRole('textbox'), 'search query')
  await user.click(screen.getByRole('button'))

  // ❌ fireEvent - Synthetic events
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'search query' }
  })
  fireEvent.click(screen.getByRole('button'))
})
```

**Common interactions:**

```typescript
const user = userEvent.setup()

// Type text
await user.type(input, 'Hello world')

// Click
await user.click(button)

// Double click
await user.dblClick(element)

// Select option
await user.selectOptions(select, 'option-value')

// Upload file
await user.upload(fileInput, file)

// Keyboard
await user.keyboard('{Enter}')
await user.keyboard('{Shift>}A{/Shift}')  // Shift+A
```

---

## Async Testing

### Waiting for Elements

```typescript
// ✅ Use findBy* for async elements
it('should display data after loading', async () => {
  render(DataDisplay)

  // Waits up to 1000ms by default
  const data = await screen.findByText('Loaded data')

  expect(data).toBeInTheDocument()
})

// ✅ Use waitFor for complex conditions
it('should update after multiple async operations', async () => {
  render(ComplexComponent)

  await waitFor(() => {
    expect(screen.getByText('Step 1 complete')).toBeInTheDocument()
    expect(screen.getByText('Step 2 complete')).toBeInTheDocument()
  })
})
```

### Waiting for Disappearance

```typescript
it('should hide loading spinner after data loads', async () => {
  render(DataDisplay)

  // Initially loading
  expect(screen.getByText('Loading...')).toBeInTheDocument()

  // Wait for loading to disappear
  await waitForElementToBeRemoved(() => screen.getByText('Loading...'))

  // Data should now be visible
  expect(screen.getByText('Data loaded')).toBeInTheDocument()
})
```

---

## Router Testing

**Prefer real router over mocking:**

```typescript
import { render, screen } from '@testing-library/vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'

it('should navigate to detail page when clicking item', async () => {
  const user = userEvent.setup()

  // Create real router with memory history
  const router = createRouter({
    history: createMemoryHistory(),
    routes
  })

  await router.push('/items')
  await router.isReady()

  render(ItemList, {
    global: {
      plugins: [router]
    }
  })

  await user.click(screen.getByText('Item 1'))

  // Check URL changed
  expect(router.currentRoute.value.path).toBe('/items/1')

  // Check content rendered
  expect(screen.getByText('Item 1 Details')).toBeInTheDocument()
})
```

---

## Pinia Store Testing

### Testing Components with Stores

```typescript
import { createPinia, setActivePinia } from 'pinia'

describe('TodoList', () => {
  beforeEach(() => {
    // Create fresh Pinia instance for each test
    setActivePinia(createPinia())
  })

  it('should display todos from store', () => {
    const store = useTodosStore()

    // Set up store state
    store.dispatch({ type: 'ADD_TODO', text: 'Test todo' })

    render(TodoList)

    expect(screen.getByText('Test todo')).toBeInTheDocument()
  })

  it('should add todo to store when user submits form', async () => {
    const user = userEvent.setup()
    const store = useTodosStore()

    render(TodoList)

    await user.type(screen.getByLabelText('New todo'), 'Buy milk')
    await user.click(screen.getByRole('button', { name: 'Add' }))

    expect(store.todos.todos).toHaveLength(1)
    expect(store.todos.todos[0].text).toBe('Buy milk')
  })
})
```

### Testing Pure Store Logic

```typescript
// For Pinia + Elm pattern, test the pure update function directly
import { update } from '@/stores/todos/todosUpdate'
import { initialModel } from '@/stores/todos/todosModel'

describe('todosUpdate', () => {
  it('should add todo', () => {
    const model = initialModel()

    const result = update(model, {
      type: 'ADD_TODO',
      text: 'Test todo'
    })

    expect(result.todos).toHaveLength(1)
    expect(result.todos[0].text).toBe('Test todo')
  })
})
```

---

## Composable Testing

### Testing Composables in Components

**✅ Recommended:** Test composables through components that use them.

```typescript
// TestComponent.vue (test helper)
<script setup lang="ts">
import { useCounter } from '@/composables/useCounter'

const { count, increment } = useCounter()
</script>

<template>
  <div>
    <span>Count: {{ count }}</span>
    <button @click="increment">Increment</button>
  </div>
</template>

// useCounter.test.ts
import TestComponent from './TestComponent.vue'

it('should increment counter when button clicked', async () => {
  const user = userEvent.setup()

  render(TestComponent)

  expect(screen.getByText('Count: 0')).toBeInTheDocument()

  await user.click(screen.getByRole('button'))

  expect(screen.getByText('Count: 1')).toBeInTheDocument()
})
```

### Testing Composables Directly (when necessary)

```typescript
import { useCounter } from '@/composables/useCounter'

it('should increment count', () => {
  const { count, increment } = useCounter()

  expect(count.value).toBe(0)

  increment()

  expect(count.value).toBe(1)
})
```

**Only test directly when:**
- Pure logic composables with no DOM interaction
- Complex logic that's hard to test through UI
- Library/utility composables

---

## Mocking

### API Mocking with MSW (Recommended)

```typescript
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/todos', () => {
    return HttpResponse.json([
      { id: '1', text: 'Todo 1', completed: false }
    ])
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it('should display todos from API', async () => {
  render(TodoList)

  expect(await screen.findByText('Todo 1')).toBeInTheDocument()
})

it('should handle API error', async () => {
  // Override handler for this test
  server.use(
    http.get('/api/todos', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  render(TodoList)

  expect(await screen.findByText('Failed to load todos')).toBeInTheDocument()
})
```

### Vitest Mocking (when needed)

```typescript
import { vi } from 'vitest'

it('should call API service', async () => {
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => [{ id: '1', text: 'Test' }]
  })

  global.fetch = mockFetch

  render(TodoList)

  await screen.findByText('Test')

  expect(mockFetch).toHaveBeenCalledWith('/api/todos')
})
```

**Minimize mocking:**
- Prefer real implementations when possible
- Mock only external dependencies (API calls, localStorage)
- Never mock Vue internals or component structure

---

## Anti-Patterns

### ❌ Testing Implementation Details

```typescript
// ❌ Bad - Accessing component internals
it('should update data property', async () => {
  const wrapper = mount(Component)
  await wrapper.vm.updateData()
  expect(wrapper.vm.data).toBe('updated')
})

// ✅ Good - Testing user-visible behavior
it('should display updated message after clicking update', async () => {
  const user = userEvent.setup()
  render(Component)

  await user.click(screen.getByRole('button', { name: 'Update' }))

  expect(screen.getByText('Data updated')).toBeInTheDocument()
})
```

### ❌ Testing Component Structure

```typescript
// ❌ Bad - Testing component structure
it('should have three child components', () => {
  const wrapper = mount(Parent)
  expect(wrapper.findAllComponents(Child)).toHaveLength(3)
})

// ✅ Good - Testing rendered output
it('should display three items', () => {
  render(Parent)
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
})
```

### ❌ Overusing Test IDs

```typescript
// ❌ Bad - Using test IDs when semantic queries work
await user.click(screen.getByTestId('submit-button'))

// ✅ Good - Using accessible query
await user.click(screen.getByRole('button', { name: 'Submit' }))
```

---

## Test Organization

### File Structure

```
src/
├── components/
│   ├── Button.vue
│   └── Button.test.ts
├── composables/
│   ├── useCounter.ts
│   └── useCounter.test.ts
└── stores/
    └── todos/
        ├── todosUpdate.ts
        └── todosUpdate.test.ts
```

### Test Suite Organization with Page Object Pattern

**Structure tests with Page Object functions at the bottom:**

```typescript
describe('TodoList', () => {
  // Group related tests
  describe('Rendering', () => {
    it('should display empty state when no todos', () => {
      const { getEmptyState } = renderTodoList({ todos: [] })

      expect(getEmptyState()).toBeInTheDocument()
    })

    it('should display todo items when loaded', () => {
      const todos = [{ id: '1', text: 'Buy milk' }]
      const { getTodoItem } = renderTodoList({ todos })

      expect(getTodoItem('Buy milk')).toBeInTheDocument()
    })
  })

  describe('User Interactions', () => {
    it('should add todo when user submits form', async () => {
      const { fillNewTodo, submitTodo, getTodoItem } = renderTodoList()

      await fillNewTodo('Buy milk')
      await submitTodo()

      expect(getTodoItem('Buy milk')).toBeInTheDocument()
    })

    it('should toggle todo when user clicks checkbox', async () => {
      const todos = [{ id: '1', text: 'Buy milk', completed: false }]
      const { toggleTodo, getTodoCheckbox } = renderTodoList({ todos })

      await toggleTodo('Buy milk')

      expect(getTodoCheckbox('Buy milk')).toBeChecked()
    })
  })

  describe('Error Handling', () => {
    it('should show error message when API fails', async () => {
      const { getErrorMessage } = renderTodoList({ error: 'API failed' })

      expect(getErrorMessage()).toBeInTheDocument()
    })
  })
})

// ============================================
// PAGE OBJECT
// ============================================
function renderTodoList(props = {}) {
  const user = userEvent.setup()

  render(TodoList, { props })

  return {
    // Queries
    getEmptyState: () => screen.getByText('No todos yet'),
    getTodoItem: (text: string) => screen.getByText(text),
    getTodoCheckbox: (text: string) => screen.getByRole('checkbox', { name: text }),
    getNewTodoInput: () => screen.getByLabelText('New todo'),
    getSubmitButton: () => screen.getByRole('button', { name: 'Add' }),
    getErrorMessage: () => screen.getByRole('alert'),

    // Actions
    fillNewTodo: async (text: string) => {
      await user.type(screen.getByLabelText('New todo'), text)
    },
    submitTodo: async () => {
      await user.click(screen.getByRole('button', { name: 'Add' }))
    },
    toggleTodo: async (text: string) => {
      await user.click(screen.getByRole('checkbox', { name: text }))
    },
    deleteTodo: async (text: string) => {
      await user.click(screen.getByRole('button', { name: `Delete ${text}` }))
    }
  }
}
```

---

## E2E Testing with Playwright

**For critical user flows:**

```typescript
// tests/e2e/todo.spec.ts
import { test, expect } from '@playwright/test'

test('should complete todo flow', async ({ page }) => {
  await page.goto('/todos')

  // Add todo
  await page.getByLabel('New todo').fill('Buy groceries')
  await page.getByRole('button', { name: 'Add' }).click()

  // Verify todo appears
  await expect(page.getByText('Buy groceries')).toBeVisible()

  // Mark complete
  await page.getByRole('checkbox', { name: 'Buy groceries' }).check()

  // Verify completed
  await expect(page.getByText('Buy groceries')).toHaveClass(/completed/)

  // Delete todo
  await page.getByRole('button', { name: 'Delete Buy groceries' }).click()

  // Verify removed
  await expect(page.getByText('Buy groceries')).not.toBeVisible()
})
```

---

## Coverage Guidelines

**Don't chase 100% coverage. Focus on:**

1. **Critical user flows** - Authentication, checkout, data submission
2. **Complex business logic** - Calculations, validations, state transitions
3. **Error handling** - API failures, validation errors
4. **Edge cases** - Empty states, boundary conditions

**Skip testing:**
- Trivial getters/setters
- Third-party library code
- Simple render-only components

---

## Summary

### Key Principles

1. **Test user behavior, not implementation**
2. **Use Page Object Pattern** - Encapsulate queries and actions in functions at end of file
3. **Use accessible queries** (getByRole, getByLabelText)
4. **Prefer real integrations** over mocks (router, stores)
5. **Test through the UI** when possible
6. **Keep tests maintainable** - they should survive refactoring

### Testing Pyramid

```
     E2E (Playwright)
    Few critical flows
         ▲
         │
    Integration (Vitest + Testing Library)
   Component + composable + store
         ▲
         │
     Unit (Vitest)
  Pure functions, complex logic
```

### Quick Reference

| What to Test | How to Test |
|--------------|-------------|
| Component rendering | render() + screen queries |
| User interactions | userEvent |
| Async behavior | findBy* queries, waitFor() |
| Store logic | Test pure update functions |
| Composables | Test through components (usually) |
| Critical flows | Playwright E2E |

**The more your tests resemble user behavior, the more confidence they provide.**
