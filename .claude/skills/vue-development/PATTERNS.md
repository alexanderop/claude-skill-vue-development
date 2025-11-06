# Architectural Patterns

> **For Claude Code:**
> - **When to load:** User asks about architecture, functional core/shell, feature-based structure, or code organization
> - **Quick scan:** Read only "Functional Core, Imperative Shell" summary and "Summary" table at bottom
> - **Deep dive:** Load full file when implementing complex business logic or refactoring architecture
> - **Always cite:** Reference specific pattern name (e.g., "Functional Core/Imperative Shell pattern")
> - **Quick templates:** For copy-paste code, direct user to [QUICK-LOOKUP.md](QUICK-LOOKUP.md)

Detailed patterns for building maintainable Vue applications with feature-based architecture.

## Functional Core, Imperative Shell

**Problem:** Business logic mixed with Vue reactivity makes testing difficult and couples code to the framework.

**Solution:** Separate pure business logic from reactive wrappers.

### Structure (Feature-Based)

```
src/
├── features/
│   └── game/
│       ├── core/
│       │   └── gameLogic.ts     # Pure functions
│       └── composables/
│           └── useGameLogic.ts  # Reactive wrapper
```

### Pure Logic Layer

```typescript
// features/game/core/gameLogic.ts
export type Snake = Position[]
export type Position = { x: number; y: number }
export type GameState = {
  snake: Snake
  food: Position
  score: number
  isGameOver: boolean
}

// Pure functions - NO Vue dependencies
export function initializeGame(): GameState {
  return {
    snake: [{ x: 10, y: 10 }],
    food: { x: 15, y: 15 },
    score: 0,
    isGameOver: false
  }
}

export function moveSnake(state: GameState, direction: Position): GameState {
  const newHead = {
    x: state.snake[0].x + direction.x,
    y: state.snake[0].y + direction.y
  }

  const newSnake = [newHead, ...state.snake.slice(0, -1)]

  return {
    ...state,
    snake: newSnake
  }
}

export function checkCollision(state: GameState): boolean {
  const head = state.snake[0]
  return state.snake.slice(1).some(
    segment => segment.x === head.x && segment.y === head.y
  )
}
```

### Reactive Wrapper

```typescript
// features/game/composables/useGameLogic.ts
import { ref, readonly } from 'vue'
import * as GameLogic from '../core/gameLogic'

export function useGameLogic() {
  // Reactive state
  const gameState = ref(GameLogic.initializeGame())
  const direction = ref({ x: 1, y: 0 })
  const isPaused = ref(false)

  // Methods wrap pure functions
  function move() {
    gameState.value = GameLogic.moveSnake(gameState.value, direction.value)

    if (GameLogic.checkCollision(gameState.value)) {
      gameState.value = { ...gameState.value, isGameOver: true }
    }
  }

  function reset() {
    gameState.value = GameLogic.initializeGame()
    isPaused.value = false
  }

  function changeDirection(newDirection: GameLogic.Position) {
    direction.value = newDirection
  }

  return {
    gameState: readonly(gameState),
    isPaused,
    move,
    reset,
    changeDirection
  }
}
```

### Testing Pure Logic

```typescript
// features/game/core/gameLogic.test.ts
import { describe, it, expect } from 'vitest'
import * as GameLogic from './gameLogic'

describe('GameLogic', () => {
  it('should move snake in specified direction', () => {
    const state = GameLogic.initializeGame()
    const direction = { x: 1, y: 0 }

    const newState = GameLogic.moveSnake(state, direction)

    expect(newState.snake[0].x).toBe(state.snake[0].x + 1)
  })

  it('should detect collision with self', () => {
    const state = {
      ...GameLogic.initializeGame(),
      snake: [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 5, y: 5 }  // Head position matches tail
      ]
    }

    expect(GameLogic.checkCollision(state)).toBe(true)
  })
})
```

### Benefits

✅ **Easy Testing** - Pure functions need no mocking
✅ **Framework Agnostic** - Logic works outside Vue
✅ **Predictable** - No hidden side effects
✅ **Reusable** - Share logic across platforms

### Trade-offs

❌ **More Files** - Separation adds files
❌ **Indirection** - Extra layer to navigate
❌ **Learning Curve** - Team needs to understand pattern

**When to Use:**
- Complex business logic
- Need framework portability
- Critical correctness requirements
- Multiple state transitions

**When to Skip:**
- Simple CRUD operations
- UI-only logic (animations, styling)
- Tight coupling to Vue is acceptable

---

## Shared State Container Pattern

**Problem:** Need to share state across multiple components without prop drilling.

**Solution:** Module-level reactive state in composables.

### Implementation

```typescript
// features/auth/composables/useAuth.ts
import { ref, readonly } from 'vue'

// Module-level state (singleton)
const user = ref<User | null>(null)
const isAuthenticated = ref(false)
const isLoading = ref(false)

export function useAuth() {
  async function login(credentials: Credentials) {
    isLoading.value = true
    try {
      user.value = await authService.login(credentials)
      isAuthenticated.value = true
    } catch (error) {
      user.value = null
      isAuthenticated.value = false
      throw error
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
  }

  return {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    login,
    logout
  }
}
```

### SSR-Safe Version

```typescript
// features/auth/composables/useAuth.ts
import { ref, readonly, inject, provide } from 'vue'

const AUTH_KEY = Symbol('auth')

export function provideAuth() {
  const user = ref<User | null>(null)
  const isAuthenticated = ref(false)

  function login(credentials: Credentials) {
    // ... implementation
  }

  const auth = {
    user: readonly(user),
    isAuthenticated: readonly(isAuthenticated),
    login
  }

  provide(AUTH_KEY, auth)
  return auth
}

export function useAuth() {
  const auth = inject(AUTH_KEY)
  if (!auth) {
    throw new Error('useAuth must be used within provideAuth')
  }
  return auth
}
```

Usage in App.vue:
```vue
<script setup lang="ts">
import { provideAuth } from '@/composables/useAuth'

provideAuth()
</script>
```

### Benefits

✅ **No Prop Drilling** - Access state anywhere
✅ **Reactive** - Changes propagate automatically
✅ **Lightweight** - No store overhead

### Trade-offs

❌ **SSR Issues** - Module-level state breaks SSR (use provide/inject)
❌ **No DevTools** - Unlike Pinia, no browser extension
❌ **Global Mutable State** - Can lead to coupling

**When to Use:**
- Simple shared state (auth, theme, locale)
- Don't need time-travel debugging
- Want lightweight solution

**When to Use Pinia Instead:**
- Need DevTools integration
- Complex state with many actions
- Want persistence or plugins

---

## Domain Integration Layer

**Problem:** Composables shouldn't handle DOM interactions or UI concerns.

**Solution:** Separate layer for DOM integration.

### Structure

```
src/
└── features/
    └── todos/
        ├── core/
        │   └── todoLogic.ts         # Pure business logic
        ├── composables/
        │   └── useTodos.ts          # State management
        └── integrations/
            └── todoIntegration.ts   # DOM interactions
```

### Example: Local Storage Integration

```typescript
// features/todos/core/todoLogic.ts
export type Todo = {
  id: string
  text: string
  completed: boolean
}

export function createTodo(text: string): Todo {
  return {
    id: crypto.randomUUID(),
    text,
    completed: false
  }
}

export function toggleTodo(todo: Todo): Todo {
  return { ...todo, completed: !todo.completed }
}
```

```typescript
// features/todos/composables/useTodos.ts
import { ref, readonly } from 'vue'
import * as TodoLogic from '../core/todoLogic'

export function useTodos() {
  const todos = ref<TodoLogic.Todo[]>([])

  function addTodo(text: string) {
    const newTodo = TodoLogic.createTodo(text)
    todos.value = [...todos.value, newTodo]
  }

  function toggleTodo(id: string) {
    todos.value = todos.value.map(todo =>
      todo.id === id ? TodoLogic.toggleTodo(todo) : todo
    )
  }

  return {
    todos: readonly(todos),
    addTodo,
    toggleTodo
  }
}
```

```typescript
// features/todos/integrations/todoIntegration.ts
import { watch } from 'vue'
import { useTodos } from '../composables/useTodos'

const STORAGE_KEY = 'todos'

export function setupTodoIntegration() {
  const { todos } = useTodos()

  // Load from localStorage on init
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    todos.value = JSON.parse(stored)
  }

  // Save to localStorage on change
  watch(
    todos,
    (newTodos) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newTodos))
    },
    { deep: true }
  )
}
```

Usage in component:
```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { setupTodoIntegration } from '../integrations/todoIntegration'

onMounted(() => {
  setupTodoIntegration()
})
</script>
```

### Benefits

✅ **Separation of Concerns** - Domain logic stays pure
✅ **Testable** - Mock integration layer easily
✅ **Reusable** - Swap integrations (localStorage → IndexedDB)

---

## Component Extraction Patterns

**Start inline, extract when necessary.**

### Level 1: Inline Composable

```vue
<script setup lang="ts">
import { ref } from 'vue'

// Inline composable
function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const increment = () => count.value++
  return { count, increment }
}

const { count, increment } = useCounter(10)
</script>
```

**When:** Single component use, experimenting with pattern

### Level 2: Function-Level Decomposition

```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)

// Extract complex logic to functions
function calculateTotal(items: Item[]) {
  return items.reduce((sum, item) => sum + item.price, 0)
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}
</script>
```

**When:** Logic gets complex, but still single-component

### Level 3: Separate Composable File

```typescript
// composables/useCounter.ts
import { ref } from 'vue'

export function useCounter(initialValue = 0) {
  const count = ref(initialValue)
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initialValue

  return { count, increment, decrement, reset }
}
```

**When:** Used across multiple components, needs testing

### Level 4: Separate Component

```vue
<!-- components/Counter.vue -->
<script setup lang="ts">
import { useCounter } from '@/composables/useCounter'

interface Props {
  initialValue?: number
}

const props = withDefaults(defineProps<Props>(), {
  initialValue: 0
})

const { count, increment, decrement, reset } = useCounter(props.initialValue)
</script>

<template>
  <div class="counter">
    <button @click="decrement">-</button>
    <span>{{ count }}</span>
    <button @click="increment">+</button>
    <button @click="reset">Reset</button>
  </div>
</template>
```

**When:** Reused UI pattern, complex template

---

## Refactoring Patterns

### Computed Inlining

**Before:**
```vue
<script setup lang="ts">
const displayName = computed(() => formatName(user.value))

function formatName(user: User) {
  return `${user.firstName} ${user.lastName}`
}
</script>
```

**After:**
```vue
<script setup lang="ts">
const displayName = computed(() =>
  `${user.value.firstName} ${user.value.lastName}`
)
</script>
```

**When:** Helper used only once, logic is simple

### Extract Function

**Before:**
```vue
<script setup lang="ts">
onMounted(async () => {
  isLoading.value = true
  try {
    const response = await fetch('/api/users')
    const data = await response.json()
    users.value = data.users.map(u => ({
      ...u,
      displayName: `${u.firstName} ${u.lastName}`
    }))
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
})
</script>
```

**After:**
```vue
<script setup lang="ts">
async function loadUsers() {
  isLoading.value = true
  try {
    const response = await fetch('/api/users')
    const data = await response.json()
    users.value = transformUsers(data.users)
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

function transformUsers(users: ApiUser[]) {
  return users.map(u => ({
    ...u,
    displayName: `${u.firstName} ${u.lastName}`
  }))
}

onMounted(() => loadUsers())
</script>
```

**When:** Logic is complex, needs testing, improves readability

---

## Summary

Choose patterns based on complexity and team needs:

| Pattern | Complexity | Testing | Use Case |
|---------|-----------|---------|----------|
| Inline composable | Low | Optional | Single component |
| Function decomposition | Low | Recommended | Complex component logic |
| Shared state container | Medium | Required | Simple global state |
| Functional Core/Shell | High | Critical | Complex business logic |
| Integration layer | Medium | Recommended | DOM/external APIs |

**Key Principle:** Start simple, add complexity only when justified.
