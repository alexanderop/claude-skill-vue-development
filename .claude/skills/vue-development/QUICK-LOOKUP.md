# Quick Lookup

> **For Claude Code:** Copy-paste ready code templates, common commands, and API quick reference. Load this when you need working code fast.

---

## Code Templates (Copy-Paste Ready)

### Component with Inline Composable

```vue
<script setup lang="ts">
import { ref, computed, readonly } from 'vue'

// ============================================
// INLINE COMPOSABLE (component-specific logic)
// ============================================
function useFeatureLogic() {
  const state = ref<string>('')
  const isValid = computed(() => state.value.length > 0)

  function updateState(newValue: string) {
    state.value = newValue
  }

  function resetState() {
    state.value = ''
  }

  return {
    state: readonly(state),
    isValid,
    updateState,
    resetState
  }
}

// ============================================
// COMPONENT LOGIC
// ============================================
const { state, isValid, updateState, resetState } = useFeatureLogic()
</script>

<template>
  <div>
    <input :value="state" @input="updateState($event.target.value)" />
    <button :disabled="!isValid" @click="resetState">Reset</button>
  </div>
</template>
```

### Pinia Store (Composition API)

```typescript
// stores/todos.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

type Todo = {
  id: string
  text: string
  completed: boolean
}

export const useTodosStore = defineStore('todos', () => {
  // State
  const todos = ref<Todo[]>([])
  const isLoading = ref(false)

  // Getters
  const activeTodos = computed(() =>
    todos.value.filter(t => !t.completed)
  )

  // Actions - always return { data, error }
  async function fetchTodos() {
    isLoading.value = true

    try {
      const response = await fetch('/api/todos')

      if (!response.ok) {
        return {
          data: null,
          error: `Failed to fetch: ${response.statusText}`
        }
      }

      const data = await response.json()
      todos.value = data
      return { data, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      isLoading.value = false
    }
  }

  async function addTodo(text: string) {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        return { data: null, error: 'Failed to create todo' }
      }

      const newTodo = await response.json()
      todos.value.push(newTodo)
      return { data: newTodo, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  function toggleTodo(id: string) {
    const todo = todos.value.find(t => t.id === id)

    if (!todo) {
      return { data: null, error: 'Todo not found' }
    }

    todo.completed = !todo.completed
    return { data: todo, error: null }
  }

  // Return readonly state + actions
  return {
    todos: readonly(todos),
    activeTodos,
    isLoading: readonly(isLoading),
    fetchTodos,
    addTodo,
    toggleTodo
  }
})
```

### Component Test with Page Object Pattern

```typescript
// Button.test.ts
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import Button from './Button.vue'

describe('Button', () => {
  it('should display button text', () => {
    const { getButton } = renderButton({ text: 'Click me' })

    expect(getButton()).toBeInTheDocument()
    expect(getButton()).toHaveTextContent('Click me')
  })

  it('should call onClick handler when clicked', async () => {
    const onClick = vi.fn()
    const { clickButton } = renderButton({
      text: 'Click me',
      onClick
    })

    await clickButton()

    expect(onClick).toHaveBeenCalledOnce()
  })

  it('should be disabled when disabled prop is true', () => {
    const { getButton } = renderButton({
      text: 'Click me',
      disabled: true
    })

    expect(getButton()).toBeDisabled()
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
    queryButton: () => screen.queryByRole('button'),

    // Actions
    clickButton: async () => {
      await user.click(screen.getByRole('button'))
    }
  }
}
```

### Functional Core + Imperative Shell

```typescript
// features/game/core/gameLogic.ts
// ============================================
// PURE BUSINESS LOGIC (no Vue dependencies)
// ============================================
export type Position = { x: number; y: number }
export type GameState = {
  score: number
  isGameOver: boolean
}

export function initializeGame(): GameState {
  return {
    score: 0,
    isGameOver: false
  }
}

export function updateScore(state: GameState, points: number): GameState {
  return {
    ...state,
    score: state.score + points
  }
}

export function endGame(state: GameState): GameState {
  return {
    ...state,
    isGameOver: true
  }
}

// features/game/composables/useGame.ts
// ============================================
// REACTIVE WRAPPER (imperative shell)
// ============================================
import { ref, readonly } from 'vue'
import * as GameLogic from '../core/gameLogic'

export function useGame() {
  const gameState = ref(GameLogic.initializeGame())

  function addPoints(points: number) {
    gameState.value = GameLogic.updateScore(gameState.value, points)
  }

  function endGame() {
    gameState.value = GameLogic.endGame(gameState.value)
  }

  function reset() {
    gameState.value = GameLogic.initializeGame()
  }

  return {
    gameState: readonly(gameState),
    addPoints,
    endGame,
    reset
  }
}
```

### Reusable Composable

```typescript
// composables/useFetch.ts
import { ref, readonly } from 'vue'

interface UseFetchReturn<T> {
  data: Readonly<Ref<T | null>>
  error: Readonly<Ref<Error | null>>
  isLoading: Readonly<Ref<boolean>>
  execute: () => Promise<void>
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function execute() {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      data.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      data.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    data: readonly(data),
    error: readonly(error),
    isLoading: readonly(isLoading),
    execute
  }
}
```

### Discriminated Union Props

```vue
<script setup lang="ts">
// ============================================
// DISCRIMINATED UNION FOR VARIANT PROPS
// ============================================
type BaseProps = {
  title: string
}

type SuccessProps = BaseProps & {
  variant: 'success'
  message: string
  errorCode?: never
}

type ErrorProps = BaseProps & {
  variant: 'error'
  errorCode: string
  message?: never
}

type Props = SuccessProps | ErrorProps

const props = defineProps<Props>()

// TypeScript narrows type based on variant
function getDisplayMessage() {
  if (props.variant === 'success') {
    return props.message  // ✓ TypeScript knows message exists
  } else {
    return `Error ${props.errorCode}`  // ✓ TypeScript knows errorCode exists
  }
}
</script>

<template>
  <div :class="`alert alert-${variant}`">
    <h3>{{ title }}</h3>
    <p>{{ getDisplayMessage() }}</p>
  </div>
</template>
```

### Type Guard

```typescript
// types/guards.ts
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

// Usage
const value: string | null = getUserInput()

if (isDefined(value)) {
  console.log(value.toUpperCase())  // TypeScript knows it's string
}

// Filter with type guard
const values: (string | null)[] = ['a', null, 'b']
const strings: string[] = values.filter(isDefined)
```

---

## Common Commands

### Project Setup

```bash
# Create new Vue project
npm create vue@latest

# Select these options:
# ✓ TypeScript
# ✓ Vitest
# ✓ Playwright E2E Testing
# ✓ ESLint
# ✓ Prettier

# Install dependencies
cd your-project
npm install

# Install VueUse
npm install @vueuse/core

# Install Pinia (if not selected)
npm install pinia
```

### Testing

```bash
# Run unit/component tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Run tests with coverage
npm run test:unit -- --coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run specific test file
npm run test:unit src/components/Button.test.ts
```

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npm run type-check

# Lint
npm run lint

# Format
npm run format
```

---

## Key APIs

### VueUse (Always Check First!)

```typescript
// Storage
import { useLocalStorage, useSessionStorage } from '@vueuse/core'
const theme = useLocalStorage('theme', 'light')  // Auto-synced with localStorage

// DOM Events
import { useEventListener, onClickOutside } from '@vueuse/core'
useEventListener('scroll', () => console.log('scrolling'))
onClickOutside(target, () => console.log('clicked outside'))

// Browser APIs
import { useClipboard, useGeolocation } from '@vueuse/core'
const { copy, copied } = useClipboard()
const { coords } = useGeolocation()

// State
import { useToggle, useCounter, useDebounce } from '@vueuse/core'
const [value, toggle] = useToggle()
const { count, inc, dec } = useCounter()
const debouncedValue = useDebounce(inputValue, 300)

// Component
import { useVModel, useTemplateRef } from '@vueuse/core'
const modelValue = useVModel(props, 'modelValue', emit)
const inputRef = useTemplateRef('input')

// Observers
import { useIntersectionObserver, useResizeObserver } from '@vueuse/core'
useIntersectionObserver(target, ([{ isIntersecting }]) => {
  console.log(isIntersecting)
})
```

### Testing Library Queries (Priority Order)

```typescript
import { screen } from '@testing-library/vue'

// 1. Accessible queries (BEST)
screen.getByRole('button', { name: 'Submit' })
screen.getByRole('textbox', { name: 'Email' })
screen.getByRole('checkbox', { name: 'Accept terms' })
screen.getByLabelText('Email')
screen.getByPlaceholderText('Enter email...')

// 2. Semantic queries
screen.getByText('Welcome back!')
screen.getByAltText('Profile picture')
screen.getByTitle('Close')

// 3. Test IDs (LAST RESORT)
screen.getByTestId('custom-element')

// Query variants
screen.getByRole(...)     // Throws if not found
screen.queryByRole(...)   // Returns null if not found
screen.findByRole(...)    // Returns promise, waits for element
screen.getAllByRole(...)  // Returns array
```

### User Event (Always Use Over fireEvent)

```typescript
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()

// Type text
await user.type(input, 'Hello world')
await user.clear(input)

// Click
await user.click(button)
await user.dblClick(button)

// Select
await user.selectOptions(select, 'option1')
await user.selectOptions(select, ['option1', 'option2'])

// Upload
const file = new File(['content'], 'file.txt', { type: 'text/plain' })
await user.upload(input, file)

// Keyboard
await user.keyboard('{Enter}')
await user.keyboard('{Shift>}A{/Shift}')  // Shift+A
await user.tab()
```

### Pinia Store Usage

```typescript
import { useTodosStore } from '@/stores/todos'

// In component
const store = useTodosStore()

// Access state
console.log(store.todos)
console.log(store.isLoading)

// Call actions (handle returned errors)
const { data, error } = await store.fetchTodos()
if (error) {
  toast.error(error)  // Consumer decides how to show error
}

// Subscribe to changes
store.$subscribe((mutation, state) => {
  console.log('State changed', state)
})

// Reset store
store.$reset()
```

### Vue Router Testing

```typescript
import { createRouter, createMemoryHistory } from 'vue-router'
import { routes } from '@/router'

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

await router.push('/home')
await router.isReady()

render(Component, {
  global: {
    plugins: [router]
  }
})

// Check current route
expect(router.currentRoute.value.path).toBe('/home')
```

---

## File Structure Reference

```
src/
├── features/                    # Feature-based organization
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.vue
│   │   │   └── RegisterForm.vue
│   │   ├── composables/
│   │   │   └── useAuth.ts
│   │   ├── core/               # Pure business logic (optional)
│   │   │   └── authLogic.ts
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── tests/
│   │       ├── LoginForm.test.ts
│   │       └── authLogic.test.ts
│   │
│   ├── todos/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── stores/
│   │   └── tests/
│   │
│   └── profile/
│       └── ...
│
├── shared/                      # Shared across features
│   ├── components/
│   │   ├── BaseButton.vue
│   │   ├── BaseInput.vue
│   │   └── BaseModal.vue
│   ├── composables/
│   │   ├── useToast.ts
│   │   └── useApi.ts
│   ├── utils/
│   │   ├── format.ts
│   │   └── validation.ts
│   └── types/
│       └── common.types.ts
│
├── router/
│   └── index.ts
│
├── stores/                      # Global stores (if not feature-specific)
│   └── app.ts
│
├── assets/
│   ├── styles/
│   └── images/
│
├── App.vue
└── main.ts
```

---

## Common Patterns Quick Reference

### When to Extract Code

| Location | When to Use |
|----------|-------------|
| Inline in `<script setup>` | < 10 lines, single use |
| Inline function in component | 10-50 lines, used in one component |
| Separate composable file | Reused in 2+ components, OR exists in VueUse |
| Core logic file | Complex business logic (functional core/shell) |
| Shared directory | Generic utility used app-wide |

### State Management Decision

| Scenario | Solution |
|----------|----------|
| Component-local | `ref()` or `reactive()` |
| Shared between 2-3 components | Composable with module-level state |
| Server data (API) | pinia-colada or TanStack Query |
| Global client state (simple) | Composable with module-level state |
| Global client state (complex) | Pinia with Composition API |

### Testing Decision

| What to Test | Tool |
|--------------|------|
| Pure functions | Vitest (no mounting) |
| Components | Vitest + Vue Testing Library |
| Composables | Usually test through components |
| Critical flows | Playwright E2E |

---

## Quick Debugging

### Component Not Rendering?

```typescript
// 1. Check props are defined
defineProps<{ text: string }>()  // ✓
defineProps()  // ✗ TypeScript needs type

// 2. Check ref is accessed with .value
const count = ref(0)
console.log(count.value)  // ✓
console.log(count)        // ✗ Logs ref object

// 3. Check reactive objects are unwrapped
const state = reactive({ count: 0 })
console.log(state.count)  // ✓
```

### Test Not Finding Element?

```typescript
// 1. Use correct query variant
screen.getByRole(...)    // Throws if not found (good for assertions)
screen.queryByRole(...)  // Returns null (good for checking absence)
screen.findByRole(...)   // Async, waits for element

// 2. Check element is accessible
// Add accessible labels:
<button aria-label="Close">X</button>
<input aria-label="Email" />

// 3. Use screen.debug() to see rendered HTML
screen.debug()
```

### Store Action Not Working?

```typescript
// 1. Check you're handling the returned error
const { data, error } = await store.fetchData()
if (error) {
  console.error(error)  // Don't ignore errors!
}

// 2. Check action returns { data, error }
async function fetchData() {
  try {
    // ...
    return { data, error: null }  // ✓
  } catch (error) {
    return { data: null, error }  // ✓
  }
  // Don't: throw error  // ✗
}
```

---

For more detailed patterns and explanations, see:
- [SKILL.md](SKILL.md) - Quick Reference + Pattern Catalog
- [COMPONENT-PATTERNS.md](COMPONENT-PATTERNS.md) - 13+ component design patterns
- [TESTING.md](TESTING.md) - Testing Library practices
- [STATE-MANAGEMENT.md](STATE-MANAGEMENT.md) - Pinia patterns
- [COMPOSITION-EXCELLENCE.md](COMPOSITION-EXCELLENCE.md) - Gold standard component structure
