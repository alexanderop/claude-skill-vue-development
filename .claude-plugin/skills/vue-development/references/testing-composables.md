# Testing Vue Composables in Isolation

## Table of Contents
- [Overview](#overview)
- [Composable Categories](#composable-categories)
- [Testing Independent Composables](#testing-independent-composables)
- [Testing Dependent Composables](#testing-dependent-composables)
- [Testing Composables with Inject](#testing-composables-with-inject)
- [Testing Patterns](#testing-patterns)
- [Common Testing Mistakes](#common-testing-mistakes)
- [Testing Checklist](#testing-checklist)
- [Quick Reference](#quick-reference)
- [Summary](#summary)

## Overview

Test composables based on whether they're independent (reactivity only) or dependent (lifecycle/inject).

## Composable Categories

### Independent Composables 🔓

**Definition:** Use ONLY Vue's Reactivity APIs (ref, computed, watch). No lifecycle hooks, no provide/inject.

**Testing:** Test directly like regular functions.

```ts
import { ref, computed, type Ref, type ComputedRef } from 'vue'

// ✅ Independent: Only uses reactivity
function useSum(a: Ref<number>, b: Ref<number>): ComputedRef<number> {
  return computed(() => a.value + b.value)
}

// Test directly
describe('useSum', () => {
  it('correctly computes the sum of two numbers', () => {
    const num1 = ref(2)
    const num2 = ref(3)
    const sum = useSum(num1, num2)

    expect(sum.value).toBe(5)
  })
})
```

### Dependent Composables 🔗

**Definition:** Use lifecycle hooks (onMounted, onUnmounted) or provide/inject. Require component context.

**Testing:** Need helper to simulate component mounting.

```ts
import { ref, watch, onMounted } from 'vue'

// ❌ Dependent: Uses onMounted lifecycle
function useLocalStorage<T>(key: string, initialValue: T) {
  const value = ref<T>(initialValue)

  function loadFromLocalStorage() {
    const storedValue = localStorage.getItem(key)
    if (storedValue !== null) {
      value.value = JSON.parse(storedValue)
    }
  }

  onMounted(loadFromLocalStorage)  // Requires component context

  watch(value, (newValue) => {
    localStorage.setItem(key, JSON.stringify(newValue))
  })

  return { value }
}
```

## Testing Independent Composables

Test directly without helpers:

```ts
import { describe, it, expect } from 'vitest'
import { ref } from 'vue'

describe('useCounter (independent)', () => {
  it('increments count', () => {
    const count = ref(0)
    const increment = () => count.value++

    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })
})
```

## Testing Dependent Composables

### The withSetup Helper

For composables using lifecycle hooks:

```ts
import type { App } from 'vue'
import { createApp } from 'vue'

export function withSetup<T>(composable: () => T): [T, App] {
  let result: T

  const app = createApp({
    setup() {
      result = composable()
      return () => {}
    }
  })

  app.mount(document.createElement('div'))

  return [result, app]
}
```

**Usage:**

```ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should load initial value', () => {
    const [result, app] = withSetup(() =>
      useLocalStorage('testKey', 'initValue')
    )

    expect(result.value.value).toBe('initValue')
    app.unmount()
  })

  it('should load from localStorage if exists', () => {
    localStorage.setItem('testKey', JSON.stringify('fromStorage'))

    const [result, app] = withSetup(() =>
      useLocalStorage('testKey', 'initialValue')
    )

    expect(result.value.value).toBe('fromStorage')
    app.unmount()
  })

  it('should sync changes to localStorage', async () => {
    const [result, app] = withSetup(() =>
      useLocalStorage('testKey', 'initial')
    )

    result.value.value = 'updated'

    // Wait for watch to trigger
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(localStorage.getItem('testKey')).toBe(JSON.stringify('updated'))
    app.unmount()
  })
})
```

**Why withSetup works:**
1. Creates actual Vue app
2. Executes composable during setup phase
3. Triggers lifecycle hooks (onMounted, etc.)
4. Returns result + app for cleanup

## Testing Composables with Inject

### The Problem

```ts
import type { InjectionKey } from 'vue'
import { inject } from 'vue'

export const MessageKey: InjectionKey<string> = Symbol('message')

export function useMessage() {
  const message = inject(MessageKey)

  if (!message) {
    throw new Error('Message must be provided')
  }

  const getUpperCase = () => message.toUpperCase()
  const getReversed = () => message.split('').reverse().join('')

  return { message, getUpperCase, getReversed }
}
```

This composable REQUIRES a provider. Testing directly will fail.

### The useInjectedSetup Helper

```ts
import type { InjectionKey } from 'vue'
import { createApp, defineComponent, h, provide } from 'vue'

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never
type VM<V> = InstanceType<V> & { unmount: () => void }

interface InjectionConfig {
  key: InjectionKey<any> | string
  value: any
}

export function useInjectedSetup<TResult>(
  setup: () => TResult,
  injections: InjectionConfig[] = []
): TResult & { unmount: () => void } {
  let result!: TResult

  const Comp = defineComponent({
    setup() {
      result = setup()
      return () => h('div')
    }
  })

  const Provider = defineComponent({
    setup() {
      injections.forEach(({ key, value }) => {
        provide(key, value)
      })
      return () => h(Comp)
    }
  })

  const mounted = mount(Provider)

  return {
    ...result,
    unmount: mounted.unmount
  } as TResult & { unmount: () => void }
}

function mount<V>(Comp: V) {
  const el = document.createElement('div')
  const app = createApp(Comp as any)
  const unmount = () => app.unmount()
  const comp = app.mount(el) as any as VM<V>
  comp.unmount = unmount
  return comp
}
```

### Testing with useInjectedSetup

```ts
import { describe, it, expect } from 'vitest'
import { useInjectedSetup } from './helpers'
import { MessageKey, useMessage } from './useMessage'

describe('useMessage', () => {
  it('should handle injected message', () => {
    const wrapper = useInjectedSetup(
      () => useMessage(),
      [{ key: MessageKey, value: 'hello world' }]
    )

    expect(wrapper.message).toBe('hello world')
    expect(wrapper.getUpperCase()).toBe('HELLO WORLD')
    expect(wrapper.getReversed()).toBe('dlrow olleh')

    wrapper.unmount()
  })

  it('should throw error when message not provided', () => {
    expect(() => {
      useInjectedSetup(() => useMessage(), [])
    }).toThrow('Message must be provided')
  })
})
```

**How it works:**
1. Creates Provider component that provides injections
2. Creates child component that uses the composable
3. Mounts both in proper hierarchy
4. Returns composable result + unmount function

## Testing Patterns

### Pattern 1: Independent Composable with Reactive State

```ts
// Composable
function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  const decrement = () => count.value--
  const reset = () => count.value = initial

  return { count, increment, decrement, reset }
}

// Test
describe('useCounter', () => {
  it('initializes with default value', () => {
    const { count } = useCounter()
    expect(count.value).toBe(0)
  })

  it('initializes with custom value', () => {
    const { count } = useCounter(10)
    expect(count.value).toBe(10)
  })

  it('increments count', () => {
    const { count, increment } = useCounter()
    increment()
    expect(count.value).toBe(1)
  })

  it('resets to initial value', () => {
    const { count, increment, reset } = useCounter(5)
    increment()
    increment()
    expect(count.value).toBe(7)
    reset()
    expect(count.value).toBe(5)
  })
})
```

### Pattern 2: Composable with Lifecycle (withSetup)

```ts
// Composable
function useDocumentTitle(title: Ref<string>) {
  onMounted(() => {
    document.title = title.value
  })

  watch(title, (newTitle) => {
    document.title = newTitle
  })
}

// Test
describe('useDocumentTitle', () => {
  it('sets document title on mount', () => {
    const title = ref('Test Title')
    const [_, app] = withSetup(() => useDocumentTitle(title))

    expect(document.title).toBe('Test Title')
    app.unmount()
  })

  it('updates document title when ref changes', async () => {
    const title = ref('Initial')
    const [_, app] = withSetup(() => useDocumentTitle(title))

    title.value = 'Updated'
    await nextTick()

    expect(document.title).toBe('Updated')
    app.unmount()
  })
})
```

### Pattern 3: Async Composable with Lifecycle

```ts
// Composable
function useAsyncData<T>(fetcher: () => Promise<T>) {
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

  onMounted(() => {
    execute()
  })

  return { data, error, isLoading, execute }
}

// Test
describe('useAsyncData', () => {
  it('loads data on mount', async () => {
    const fetcher = vi.fn().mockResolvedValue({ id: 1, name: 'Test' })

    const [result, app] = withSetup(() => useAsyncData(fetcher))

    expect(result.isLoading.value).toBe(true)

    await vi.waitFor(() => {
      expect(result.isLoading.value).toBe(false)
    })

    expect(result.data.value).toEqual({ id: 1, name: 'Test' })
    expect(result.error.value).toBeNull()

    app.unmount()
  })

  it('handles errors', async () => {
    const fetcher = vi.fn().mockRejectedValue(new Error('Failed'))

    const [result, app] = withSetup(() => useAsyncData(fetcher))

    await vi.waitFor(() => {
      expect(result.isLoading.value).toBe(false)
    })

    expect(result.error.value).toBeInstanceOf(Error)
    expect(result.error.value?.message).toBe('Failed')
    expect(result.data.value).toBeNull()

    app.unmount()
  })
})
```

### Pattern 4: Composable Using Other Composables

```ts
// Composables
function useAuth() {
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => token.value !== null)
  return { token, isAuthenticated }
}

function useAuthenticatedUser(userId: string) {
  const { token, isAuthenticated } = useAuth()
  const user = ref<User | null>(null)

  watchEffect(async () => {
    if (isAuthenticated.value && token.value) {
      user.value = await fetchUser(userId, token.value)
    }
  })

  return { user, isAuthenticated }
}

// Test
describe('useAuthenticatedUser', () => {
  it('only fetches when authenticated', async () => {
    const fetchUser = vi.fn()

    const [result, app] = withSetup(() => {
      // Mock useAuth
      const auth = useAuth()
      auth.token.value = null  // Not authenticated

      return useAuthenticatedUser('123')
    })

    expect(fetchUser).not.toHaveBeenCalled()

    app.unmount()
  })
})
```

## Common Testing Mistakes

| Mistake | Fix |
|---------|-----|
| Testing dependent composable directly | Use withSetup for lifecycle composables |
| Not unmounting after tests | Always call app.unmount() |
| Missing inject providers | Use useInjectedSetup with injections array |
| Not waiting for async operations | Use vi.waitFor() or await nextTick() |
| Testing implementation details | Test behavior, not internal refs |
| Forgetting to clear mocks/storage | Use beforeEach/afterEach hooks |

## Testing Checklist

### For Independent Composables
- [ ] Test directly without helpers
- [ ] Test all return values
- [ ] Test edge cases (null, undefined, empty)
- [ ] Test reactivity (refs update correctly)

### For Dependent Composables (Lifecycle)
- [ ] Use withSetup helper
- [ ] Test onMounted behavior
- [ ] Test watch/watchEffect triggers
- [ ] Unmount app after each test
- [ ] Clear side effects (localStorage, etc.)

### For Dependent Composables (Inject)
- [ ] Use useInjectedSetup helper
- [ ] Test with provided values
- [ ] Test error when injection missing
- [ ] Unmount wrapper after each test

### For Async Composables
- [ ] Test loading states
- [ ] Test success states
- [ ] Test error states
- [ ] Use vi.waitFor() for assertions
- [ ] Mock async dependencies

## Quick Reference

```ts
// Independent: Test directly
const { count, increment } = useCounter()
increment()
expect(count.value).toBe(1)

// Lifecycle: Use withSetup
const [result, app] = withSetup(() => useLocalStorage('key', 'value'))
expect(result.value.value).toBe('value')
app.unmount()

// Inject: Use useInjectedSetup
const wrapper = useInjectedSetup(
  () => useMessage(),
  [{ key: MessageKey, value: 'hello' }]
)
expect(wrapper.message).toBe('hello')
wrapper.unmount()
```

## Summary

| Composable Type | Testing Approach | Helper Needed |
|----------------|------------------|---------------|
| Independent (ref, computed, watch) | Test directly | ❌ No |
| Dependent (lifecycle hooks) | withSetup | ✅ Yes |
| Dependent (inject) | useInjectedSetup | ✅ Yes |

**Golden Rule:** If it uses lifecycle or inject, it needs a helper. Otherwise, test it like a regular function.
