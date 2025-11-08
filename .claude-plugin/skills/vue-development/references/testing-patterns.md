# Vue Testing Patterns Reference

## Table of Contents
- [Testing Philosophy](#testing-philosophy)
- [Primary Approach: Testing Library](#primary-approach-testing-library)
- [Async Testing](#async-testing)
- [MSW API Mocking](#msw-api-mocking)
- [Testing Library Queries Priority](#testing-library-queries-priority)
- [User Interactions](#user-interactions)
- [Component Library Testing (Fallback)](#component-library-testing-fallback)
- [Common Testing Mistakes](#common-testing-mistakes)
- [Testing Checklist](#testing-checklist)

## Testing Philosophy

**Gold standard:** Test user behavior, not implementation details.

**Note:** For testing composables in isolation, see @testing-composables.md which covers independent vs dependent composables, withSetup helper, and inject testing.

## Primary Approach: Testing Library

```ts
// ✅ CORRECT: Testing Library - user behavior
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John Doe' }
    ])
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('loads and displays users', async () => {
  render(UserList)

  // Wait for user-visible content
  expect(await screen.findByText('John Doe')).toBeInTheDocument()
})

test('submits form on button click', async () => {
  const user = userEvent.setup()
  render(UserForm)

  await user.type(screen.getByLabelText('Name'), 'Jane')
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  expect(await screen.findByText('Form submitted')).toBeInTheDocument()
})

// ❌ WRONG: Testing implementation details
import { mount } from '@vue/test-utils'

test('sets isLoading to true', () => {
  const wrapper = mount(UserList)
  expect(wrapper.vm.isLoading).toBe(true) // Internal state
})

// ❌ WRONG: Arbitrary timeouts
test('loads users', async () => {
  const wrapper = mount(UserList)
  await new Promise(resolve => setTimeout(resolve, 1000)) // BAD
  expect(wrapper.text()).toContain('John')
})
```

**Rules:**
- PRIMARY: `@testing-library/vue` for user-behavior tests
- NEVER use arbitrary `setTimeout()` in tests
- Use `findBy*` queries for async content (built-in waiting)
- Use MSW (`msw`) for API mocking, not test-utils mocks
- Query by accessibility (role, label) not test IDs
- Fallback to `@vue/test-utils` ONLY for component library testing

## Async Testing

```ts
// ✅ CORRECT: findBy* queries (built-in waiting)
expect(await screen.findByText('Loaded')).toBeInTheDocument()

// ✅ CORRECT: waitFor with condition
import { waitFor } from '@testing-library/vue'
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument()
})

// ✅ CORRECT: flushPromises (when using test-utils)
import { flushPromises } from '@vue/test-utils'
await flushPromises()

// ❌ WRONG: Arbitrary timeout
await new Promise(r => setTimeout(r, 1000))
```

## MSW API Mocking

```ts
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'

// Define handlers
const handlers = [
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: 1, name: 'John' },
      { id: 2, name: 'Jane' }
    ])
  }),

  http.post('/api/users', async ({ request }) => {
    const newUser = await request.json()
    return HttpResponse.json({ id: 3, ...newUser }, { status: 201 })
  }),

  http.delete('/api/users/:id', ({ params }) => {
    return new HttpResponse(null, { status: 204 })
  })
]

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Override handler for specific test
test('handles API error', async () => {
  server.use(
    http.get('/api/users', () => {
      return new HttpResponse(null, { status: 500 })
    })
  )

  render(UserList)
  expect(await screen.findByText('Error loading users')).toBeInTheDocument()
})
```

## Testing Library Queries Priority

Use this priority order:

1. **Accessible queries (best)**
   - `getByRole('button', { name: 'Submit' })`
   - `getByLabelText('Email')`
   - `getByPlaceholderText('Enter email')`
   - `getByText('Welcome')`

2. **Semantic queries**
   - `getByAltText('Profile photo')`
   - `getByTitle('Close')`

3. **Test IDs (last resort)**
   - `getByTestId('submit-btn')` - only when nothing else works

```ts
// ✅ BEST: Accessible queries
const submitBtn = screen.getByRole('button', { name: 'Submit' })
const emailInput = screen.getByLabelText('Email')

// ⚠️ FALLBACK: Test IDs only if accessibility not possible
const modal = screen.getByTestId('user-modal')
```

## User Interactions

```ts
import userEvent from '@testing-library/user-event'

test('user interactions', async () => {
  const user = userEvent.setup()
  render(ContactForm)

  // Type text
  await user.type(screen.getByLabelText('Name'), 'John Doe')

  // Click
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  // Select dropdown
  await user.selectOptions(screen.getByLabelText('Country'), 'USA')

  // Upload file
  const file = new File(['hello'], 'hello.png', { type: 'image/png' })
  const input = screen.getByLabelText('Upload avatar')
  await user.upload(input, file)

  // Keyboard
  await user.keyboard('{Enter}')
  await user.keyboard('{Escape}')
})
```

## Component Library Testing (Fallback)

When testing component libraries (not applications), @vue/test-utils is acceptable:

```ts
import { mount } from '@vue/test-utils'

test('Button component emits click event', async () => {
  const wrapper = mount(Button, {
    props: { label: 'Click me' }
  })

  await wrapper.trigger('click')

  expect(wrapper.emitted('click')).toHaveLength(1)
})
```

**Only use @vue/test-utils when:**
- Testing reusable component libraries
- Need to test component API (props, emits, slots)
- Not testing application behavior

## Common Testing Mistakes

| Mistake | Fix |
|---------|-----|
| `setTimeout(1000)` | Use `findBy*` or `waitFor()` |
| Testing `wrapper.vm.isLoading` | Test visible UI, not internal state |
| `getByTestId` everywhere | Use `getByRole`, `getByLabelText` |
| Mocking with jest.mock | Use MSW for API mocking |
| `wrapper.trigger('click')` | Use `userEvent.click()` for realism |
| Testing implementation | Test user-visible behavior |

## Testing Checklist

- [ ] Import from `@testing-library/vue`, not `@vue/test-utils`
- [ ] Import `userEvent` from `@testing-library/user-event`
- [ ] Use MSW for API mocking
- [ ] Query by `getByRole`, `getByLabelText`, not `getByTestId`
- [ ] Async content? Use `findBy*` queries
- [ ] NEVER use `setTimeout()` for waiting
- [ ] Test what users see, not component internals
