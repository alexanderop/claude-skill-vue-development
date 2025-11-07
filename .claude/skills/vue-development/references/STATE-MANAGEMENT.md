# State Management

> **For Claude Code:**
> - **When to load:** User asks about state management, Pinia, stores, or choosing between state solutions
> - **Quick scan:** Read only "When to Use What" table and "Pinia with Composition API" intro
> - **Deep dive:** Load full file when implementing stores or debugging state management issues
> - **Always cite:** Reference "Pinia with Composition API" pattern and emphasize `{ data, error }` return pattern
> - **Quick templates:** For copy-paste store code, direct user to [QUICK-LOOKUP.md](QUICK-LOOKUP.md)

Deep dive into Pinia state management with Composition API, focusing on single responsibility, explicit error handling, and clean separation of concerns.

## When to Use What

| Scenario | Solution | Complexity |
|----------|----------|-----------|
| Component-local state | `ref()` / `reactive()` | Low |
| Shared between components | Composable with module-level state | Low |
| Global state (CRUD + business logic) | Pinia with Composition API | Medium |
| Server state | pinia-colada / TanStack Query | Medium |

---

## Pinia with Composition API

**Core Principles:**
- ✅ **Single Responsibility** - Each action does one thing
- ✅ **Explicit Error Handling** - Return `{ data, error }`, never throw
- ✅ **No UI Logic** - Store never calls toast/alert, consumer handles errors
- ✅ **Composition API** - Use `defineStore` with setup function
- ✅ **Readonly State** - Use `readonly()` to prevent mutations outside actions

### Basic Example

```typescript
// stores/todos.ts
import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'

type Todo = {
  id: string
  text: string
  completed: boolean
}

export const useTodosStore = defineStore('todos', () => {
  // State
  const todos = ref<Todo[]>([])
  const isLoading = ref(false)

  // Actions - each does ONE thing, returns result/error
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
        return {
          data: null,
          error: `Failed to create: ${response.statusText}`
        }
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
    isLoading: readonly(isLoading),
    fetchTodos,
    addTodo,
    toggleTodo
  }
})
```

### Benefits

✅ **Single Responsibility** - Each action does one thing
✅ **Explicit Errors** - Consumer decides how to handle errors (toast, modal, etc.)
✅ **No UI Logic** - Store is UI-agnostic
✅ **DevTools Support** - Time travel debugging
✅ **Hot Module Replacement** - Preserves state during dev
✅ **Type Safe** - Full TypeScript support

---

## Component Usage Pattern

**Consumer handles error presentation:**

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTodosStore } from '@/stores/todos'
import { useToast } from '@/composables/useToast'

const store = useTodosStore()
const toast = useToast()

onMounted(async () => {
  const { error } = await store.fetchTodos()
  if (error) {
    toast.error(`Failed to load todos: ${error}`)
  }
})

async function handleAddTodo(text: string) {
  const { data, error } = await store.addTodo(text)

  if (error) {
    // Consumer decides: toast, modal, inline error, etc.
    toast.error(error)
    return
  }

  toast.success(`Added: ${data.text}`)
}

function handleToggleTodo(id: string) {
  const { error } = store.toggleTodo(id)
  if (error) {
    toast.error(error)
  }
}
</script>

<template>
  <div>
    <div v-if="store.isLoading">Loading...</div>

    <ul v-else>
      <li
        v-for="todo in store.todos"
        :key="todo.id"
        @click="handleToggleTodo(todo.id)"
      >
        {{ todo.text }}
      </li>
    </ul>
  </div>
</template>
```

**Key points:**
- ✅ Store action returns `{ data, error }`
- ✅ Component decides how to show errors (toast, modal, inline)
- ✅ Store has no knowledge of UI/notification system
- ✅ Easy to test both store and component separately

---

## Advanced Pattern: Separating Business Logic

For complex business logic, separate pure functions from store:

```typescript
// features/todos/logic/todoLogic.ts
// Pure business logic - framework agnostic
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

export function toggleTodoCompletion(todo: Todo): Todo {
  return { ...todo, completed: !todo.completed }
}

export function validateTodoText(text: string): { valid: boolean; error: string | null } {
  if (!text.trim()) {
    return { valid: false, error: 'Todo text cannot be empty' }
  }
  if (text.length > 500) {
    return { valid: false, error: 'Todo text must be less than 500 characters' }
  }
  return { valid: true, error: null }
}
```

```typescript
// stores/todos.ts
// Reactive wrapper around pure logic
import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'
import * as TodoLogic from '@/features/todos/logic/todoLogic'
import type { Todo } from '@/features/todos/logic/todoLogic'

export const useTodosStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const isLoading = ref(false)

  async function addTodo(text: string) {
    // Validate using pure function
    const validation = TodoLogic.validateTodoText(text)
    if (!validation.valid) {
      return { data: null, error: validation.error }
    }

    try {
      // Create using pure function
      const newTodo = TodoLogic.createTodo(text)

      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTodo)
      })

      if (!response.ok) {
        return { data: null, error: `Failed to create: ${response.statusText}` }
      }

      const savedTodo = await response.json()
      todos.value.push(savedTodo)
      return { data: savedTodo, error: null }
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

    // Toggle using pure function
    const toggled = TodoLogic.toggleTodoCompletion(todo)
    todos.value = todos.value.map(t => t.id === id ? toggled : t)

    return { data: toggled, error: null }
  }

  return {
    todos: readonly(todos),
    isLoading: readonly(isLoading),
    addTodo,
    toggleTodo
  }
})
```

**Benefits:**
- ✅ Pure functions are trivial to test (no mocking needed)
- ✅ Business logic is framework-agnostic
- ✅ Store focuses on reactivity and side effects
- ✅ Clear separation of concerns

---

## Testing Stores

**Testing stores is straightforward with the result/error pattern:**

```typescript
// stores/todos.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useTodosStore } from './todos'

describe('useTodosStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should add todo successfully', async () => {
    const store = useTodosStore()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', text: 'Test', completed: false })
    })

    const { data, error } = await store.addTodo('Test')

    expect(error).toBeNull()
    expect(data).toEqual({ id: '1', text: 'Test', completed: false })
    expect(store.todos).toHaveLength(1)
  })

  it('should return error when add fails', async () => {
    const store = useTodosStore()

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Request'
    })

    const { data, error } = await store.addTodo('Test')

    expect(data).toBeNull()
    expect(error).toBe('Failed to create: Bad Request')
    expect(store.todos).toHaveLength(0)
  })

  it('should toggle todo', () => {
    const store = useTodosStore()
    store.todos.value = [{ id: '1', text: 'Test', completed: false }]

    const { data, error } = store.toggleTodo('1')

    expect(error).toBeNull()
    expect(data?.completed).toBe(true)
  })

  it('should return error for invalid todo id', () => {
    const store = useTodosStore()

    const { data, error } = store.toggleTodo('invalid-id')

    expect(data).toBeNull()
    expect(error).toBe('Todo not found')
  })
})
```

---

## Summary

Choose based on your needs:

| Pattern | Complexity | Use Case |
|---------|-----------|----------|
| Local `ref()` | Low | Component-only state |
| Composable | Low-Medium | Shared state, few components |
| Pinia (Composition API) | Medium | Global state, CRUD + business logic |
| Server state lib | Medium | Fetching/caching server data |

### Key Principles to Remember

1. **Single Responsibility** - One action does one thing
2. **Explicit Errors** - Return `{ data, error }`, never throw
3. **No UI Logic** - Store never calls toast/alert
4. **Readonly State** - Use `readonly()` to prevent mutations
5. **Consumer Decides** - Component/caller handles error presentation
6. **Separate Pure Logic** - Extract complex business logic to pure functions

**Start simple. Add complexity only when justified.**
