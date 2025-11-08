# Vue Composables Best Practices Reference

## Table of Contents
- [What is a Composable?](#what-is-a-composable)
- [File Naming and Structure](#file-naming-and-structure)
- [Composable Anatomy](#composable-anatomy)
- [Single Responsibility Principle](#single-responsibility-principle)
- [Argument Passing](#argument-passing)
- [Error Handling](#error-handling)
- [Separation of Concerns: No UI Logic](#separation-of-concerns-no-ui-logic-in-composables)
- [Functional Core, Imperative Shell](#functional-core-imperative-shell-optional-pattern)
- [Consistent File Structure](#consistent-file-structure)
- [Composable Composition](#composable-composition)
- [Return Values](#return-values)
- [TypeScript Best Practices](#typescript-best-practices)
- [Common Patterns](#common-patterns)
- [Testing Composables](#testing-composables)
- [Common Mistakes](#common-mistakes)
- [Quick Checklist](#quick-checklist)

## What is a Composable?

Composables encapsulate reusable stateful logic using Vue's Composition API.

## File Naming and Structure

### Naming Convention

```
✅ CORRECT:
src/composables/
  useCounter.ts
  useUserData.ts
  useApiRequest.ts

❌ WRONG:
src/composables/
  counter.ts          // Missing 'use' prefix
  APIrequest.ts       // Wrong casing
  user-data.ts        // Wrong casing
```

**Rules:**
- ALWAYS prefix with `use`
- ALWAYS use PascalCase after `use`: `useUserData` not `useuserdata`
- Place in `src/composables/` directory
- One composable per file

### Function Naming

```ts
// ✅ CORRECT: Descriptive names
export function useUserData() {}
export function useApiRequest() {}
export function useLocalStorage() {}

// ❌ WRONG: Too generic
export function useData() {}
export function useRequest() {}
export function useStorage() {}
```

## Composable Anatomy

A well-structured composable has three parts:

```ts
export function useUserData(userId: string) {
  // 1. PRIMARY STATE - Main reactive data
  const user = ref<User | null>(null)

  // 2. STATE METADATA - Supporting state (loading, error, etc.)
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const error = ref<Error | null>(null)

  // 3. METHODS - Functions that update state
  const fetchUser = async () => {
    status.value = 'loading'
    error.value = null

    try {
      const response = await axios.get(`/api/users/${userId}`)
      user.value = response.data
      status.value = 'success'
    } catch (e) {
      error.value = e as Error
      status.value = 'error'
    }
  }

  return { user, status, error, fetchUser }
}
```

**Structure Order:**
1. Primary State (the main data)
2. State Metadata (loading, error, etc.)
3. Methods (functions that manipulate state)

## Single Responsibility Principle

Each composable should do ONE thing well.

```ts
// ✅ CORRECT: Single responsibility
export function useCounter() {
  const count = ref(0)

  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = 0

  return { count, increment, decrement, reset }
}

// ❌ WRONG: Multiple responsibilities
export function useUserAndCounter(userId: string) {
  // User management
  const user = ref<User | null>(null)
  const fetchUser = async () => { /* ... */ }

  // Counter logic (unrelated!)
  const count = ref(0)
  const increment = () => count.value++

  return { user, fetchUser, count, increment }
}
```

**Fix:** Create two composables: `useUser` and `useCounter`.

## Argument Passing

### Four or More Parameters: Use Object

```ts
// ✅ CORRECT: Object for 4+ parameters
useUserData({
  id: 1,
  fetchOnMount: true,
  token: 'abc',
  locale: 'en'
})

// ✅ CORRECT: Individual args for 3 or fewer
useCounter(initialValue, autoIncrement, storageKey)

// ❌ WRONG: Many individual args
useUserData(1, true, 'abc', 'en', false, null)
```

**With TypeScript:**

```ts
interface UseUserDataOptions {
  id: number
  fetchOnMount?: boolean
  token?: string
  locale?: string
}

export function useUserData(options: UseUserDataOptions) {
  const { id, fetchOnMount = false, token, locale = 'en' } = options
  // ...
}
```

## Error Handling

ALWAYS expose error state, NEVER just console.error.

```ts
// ✅ CORRECT: Expose errors
export function useUserData(userId: string) {
  const user = ref<User | null>(null)
  const error = ref<Error | null>(null)

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`)
      user.value = response.data
    } catch (e) {
      error.value = e as Error  // Expose to caller
    }
  }

  return { user, error, fetchUser }
}

// ❌ WRONG: Swallow errors
export function useUserDataBad(userId: string) {
  const user = ref<User | null>(null)

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`)
      user.value = response.data
    } catch (e) {
      console.error('Error:', e)  // Component can't handle error
    }
  }

  return { user, fetchUser }  // No error exposed
}
```

## Separation of Concerns: No UI Logic in Composables

Composables handle STATE and BUSINESS LOGIC only. UI concerns (toasts, alerts, modals) belong in components.

```ts
// ✅ CORRECT: Business logic only
export function useUserData(userId: string) {
  const user = ref<User | null>(null)
  const error = ref<Error | null>(null)
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

  const fetchUser = async () => {
    status.value = 'loading'
    try {
      const response = await axios.get(`/api/users/${userId}`)
      user.value = response.data
      status.value = 'success'
    } catch (e) {
      error.value = e as Error
      status.value = 'error'
    }
  }

  return { user, error, status, fetchUser }
}

// In component - UI layer handles presentation
const { user, error, status, fetchUser } = useUserData(userId)

watch(status, (s) => {
  if (s === 'success') showToast('Success!')  // UI in component
  if (s === 'error') showToast(`Error: ${error.value?.message}`)
})

// ❌ WRONG: UI logic in composable
export function useUserDataBad(userId: string) {
  const user = ref<User | null>(null)

  const fetchUser = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}`)
      user.value = response.data
    } catch (e) {
      showToast('Failed to load user')  // UI logic in composable
    }
  }

  return { user, fetchUser }
}
```

**Why separation matters:**
- Composable is testable without mocking UI
- Different components can use different UI (toast, modal, inline error)
- Composable works in non-UI contexts (background tasks, SSR)
- Follows separation of concerns

## Functional Core, Imperative Shell (Optional Pattern)

Separate pure functions (core logic) from side effects (shell).

```ts
// ✅ CORRECT: Functional core, imperative shell
// Functional Core (pure, testable)
const calculate = (a: number, b: number) => a + b
const multiply = (a: number, b: number) => a * b

// Imperative Shell (Vue reactivity, side effects)
export function useCalculator() {
  const result = ref(0)

  const add = (a: number, b: number) => {
    result.value = calculate(a, b)  // Use pure function
  }

  const times = (a: number, b: number) => {
    result.value = multiply(a, b)
  }

  return { result, add, times }
}

// ❌ WRONG: Mixed concerns
export function useCalculatorBad() {
  const result = ref(0)

  const add = (a: number, b: number) => {
    console.log('Adding:', a, b)  // Side effect mixed with logic
    result.value = a + b
  }

  return { result, add }
}
```

**Benefits:**
- Pure functions are easy to test
- Side effects isolated to shell
- Better separation of concerns

## Consistent File Structure

Maintain consistent ordering within composable files:

```ts
import { ref, computed, watch, onMounted } from 'vue'

export function useExample() {
  // 1. INITIALIZING
  // Setup, imports, router, other composables
  const router = useRouter()
  const { user } = useAuth()

  // 2. REFS
  const count = ref(0)
  const data = ref<Data | null>(null)

  // 3. COMPUTED
  const isEven = computed(() => count.value % 2 === 0)
  const hasData = computed(() => data.value !== null)

  // 4. METHODS
  const increment = () => count.value++
  const fetchData = async () => { /* ... */ }

  // 5. LIFECYCLE HOOKS
  onMounted(() => {
    fetchData()
  })

  // 6. WATCH
  watch(count, (newCount) => {
    console.log('Count changed:', newCount)
  })

  return { count, isEven, increment, data, fetchData }
}
```

**Recommended Order:**
1. Initializing (setup, other composables)
2. Refs (reactive state)
3. Computed (derived state)
4. Methods (functions)
5. Lifecycle Hooks (onMounted, onUnmounted, etc.)
6. Watch (watchers)

## Composable Composition

Composables can use other composables:

```ts
// ✅ CORRECT: Composing composables
export function useAuthenticatedUser(userId: string) {
  const { token, isAuthenticated } = useAuth()
  const { user, error, fetchUser } = useUserData(userId)

  // Only fetch if authenticated
  watchEffect(() => {
    if (isAuthenticated.value && token.value) {
      fetchUser()
    }
  })

  return { user, error, isAuthenticated }
}
```

**Rules for composition:**
- Call composables at the top of your composable function
- Don't call composables conditionally
- Compose related functionality (auth + user data)
- Maintain single responsibility even when composing

## Return Values

Return an object with named properties for clarity:

```ts
// ✅ CORRECT: Named object return
export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++

  return { count, increment }
}

// Usage
const { count, increment } = useCounter()

// ❌ WRONG: Array return (unclear)
export function useCounterBad() {
  const count = ref(0)
  const increment = () => count.value++

  return [count, increment]  // Which is which?
}
```

## TypeScript Best Practices

```ts
// ✅ CORRECT: Proper typing
interface User {
  id: number
  name: string
  email: string
}

interface UseUserDataReturn {
  user: Ref<User | null>
  error: Ref<Error | null>
  status: Ref<'idle' | 'loading' | 'success' | 'error'>
  fetchUser: () => Promise<void>
}

export function useUserData(userId: string): UseUserDataReturn {
  const user = ref<User | null>(null)
  const error = ref<Error | null>(null)
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

  const fetchUser = async () => {
    status.value = 'loading'
    try {
      const response = await axios.get<User>(`/api/users/${userId}`)
      user.value = response.data
      status.value = 'success'
    } catch (e) {
      error.value = e as Error
      status.value = 'error'
    }
  }

  return { user, error, status, fetchUser }
}
```

## Common Patterns

### Loading State Pattern

```ts
export function useAsyncData<T>(fetcher: () => Promise<T>) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  const execute = async () => {
    isLoading.value = true
    error.value = null

    try {
      data.value = await fetcher()
    } catch (e) {
      error.value = e as Error
    } finally {
      isLoading.value = false
    }
  }

  return { data, error, isLoading, execute }
}
```

### LocalStorage Sync Pattern

```ts
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const data = ref<T>(defaultValue)

  // Load from localStorage on init
  const stored = localStorage.getItem(key)
  if (stored) {
    try {
      data.value = JSON.parse(stored)
    } catch (e) {
      console.warn('Failed to parse stored value')
    }
  }

  // Sync to localStorage on change
  watch(data, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  }, { deep: true })

  return data
}
```

### Debounced Input Pattern

```ts
export function useDebouncedRef<T>(value: T, delay = 300) {
  const immediate = ref(value)
  const debounced = ref(value)

  watch(immediate, (newValue) => {
    setTimeout(() => {
      debounced.value = newValue
    }, delay)
  })

  return { immediate, debounced }
}
```

## Testing Composables

```ts
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { count, increment } = useCounter()

    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })

  it('decrements count', () => {
    const { count, decrement } = useCounter()

    count.value = 5
    decrement()
    expect(count.value).toBe(4)
  })
})
```

For async composables, use Vue Test Utils:

```ts
import { mount } from '@vue/test-utils'

it('fetches user data', async () => {
  const wrapper = mount({
    setup() {
      return useUserData('123')
    },
    template: '<div></div>'
  })

  const { fetchUser, user, status } = wrapper.vm

  await fetchUser()

  expect(status.value).toBe('success')
  expect(user.value).toBeDefined()
})
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Missing `use` prefix | Always prefix: `useCounter` not `counter` |
| UI logic in composable | Move toasts/alerts to component |
| Multiple responsibilities | Split into focused composables |
| Not exposing errors | Always return error state |
| Too many parameters | Use object for 4+ params |
| Conditional composable calls | Call composables at top level only |
| Array returns | Use named object returns |
| Missing TypeScript types | Type all refs and return values |

## Quick Checklist

- [ ] File named with `use` prefix and PascalCase
- [ ] Located in `src/composables/` directory
- [ ] Single responsibility (one thing well)
- [ ] Exposes error state (not just console.error)
- [ ] No UI logic (toasts, alerts, modals)
- [ ] Consistent internal structure (refs → computed → methods → lifecycle → watch)
- [ ] Named object return (not array)
- [ ] Full TypeScript types
- [ ] 4+ params use object, 3 or fewer use individual args
