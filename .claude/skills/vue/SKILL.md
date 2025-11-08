---
name: vue-development
description: Use when working with Vue 3 projects, encountering reactivity issues, choosing between ref/reactive/Pinia, setting up testing, or needing TypeScript patterns - provides Vue 3 best practices, Composition API patterns, and ecosystem tool recommendations
---

# Vue 3 Development

## Overview

Vue 3 with Composition API and `<script setup>` is the modern standard. This skill provides decision criteria, common patterns, and tool recommendations for effective Vue 3 development.

## Stack Defaults

**Always use unless user specifies otherwise:**
- Vue 3 with Composition API
- `<script setup>` syntax
- TypeScript for type safety
- Vite for build tooling
- Vitest + @vue/test-utils for testing

## Reactivity: ref() vs reactive()

| Use Case | Choice | Example |
|----------|--------|---------|
| Primitive values | `ref()` | `const count = ref(0)` |
| Reassigning entire object | `ref()` | `const user = ref({...})` then `user.value = newUser` |
| Object that won't be reassigned | `reactive()` | `const form = reactive({ name: '', email: '' })` |
| Array that won't be reassigned | `reactive()` | `const items = reactive([])` |
| Destructured props/values | `toRefs()` or `toRef()` | `const { name } = toRefs(props)` |

**Rule of thumb:** When in doubt, use `ref()`. It's more flexible and explicit.

## Common Reactivity Pitfalls

```typescript
// ❌ WRONG: Loses reactivity
const { name, email } = props
const { count } = reactive({ count: 0 })

// ✅ CORRECT: Maintains reactivity
const { name, email } = toRefs(props)
const state = reactive({ count: 0 })
// Access as state.count

// ❌ WRONG: Not reactive
const items = []
items.push('new') // Template won't update

// ✅ CORRECT: Reactive
const items = ref([])
items.value.push('new') // Template updates

// ❌ WRONG: Using .value in template
<template>{{ count.value }}</template>

// ✅ CORRECT: Auto-unwrapped in templates
<template>{{ count }}</template>

// ❌ WRONG: Direct mutation loses reactivity
let state = reactive({ count: 0 })
state = { count: 5 } // Breaks reactivity!

// ✅ CORRECT: Mutate properties or use ref
const state = reactive({ count: 0 })
state.count = 5 // Maintains reactivity

// OR use ref for reassignment
const state = ref({ count: 0 })
state.value = { count: 5 } // Works!
```

## State Management Decision Tree

```
Need shared state?
├─ Between 2-3 nearby components?
│  └─ Use props + emits
├─ Between distant components (same feature)?
│  └─ Use provide/inject or composable
├─ Across multiple features or routes?
│  └─ Use Pinia
└─ Global app settings/auth?
   └─ Use Pinia with persistent plugin
```

**Composable pattern** (for feature-scoped state):
```typescript
// composables/useAuth.ts
const user = ref(null)
const isAuthenticated = computed(() => !!user.value)

export function useAuth() {
  const login = async (credentials) => {
    user.value = await api.login(credentials)
  }

  const logout = () => {
    user.value = null
  }

  return { user: readonly(user), isAuthenticated, login, logout }
}
```

**Pinia pattern** (for app-wide state):
```typescript
// stores/auth.ts
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = computed(() => !!user.value)

  async function login(credentials) {
    user.value = await api.login(credentials)
  }

  function logout() {
    user.value = null
  }

  return { user, isAuthenticated, login, logout }
})
```

## TypeScript Patterns

```typescript
// Props with TypeScript
<script setup lang="ts">
interface Props {
  userId: number
  name?: string
  onUpdate?: (value: string) => void
}

const props = defineProps<Props>()

// With defaults
const props = withDefaults(defineProps<Props>(), {
  name: 'Guest'
})
</script>

// Emits with TypeScript
<script setup lang="ts">
interface Emits {
  (e: 'update', value: string): void
  (e: 'delete', id: number): void
}

const emit = defineEmits<Emits>()
emit('update', 'hello') // Type-safe!
</script>

// Template refs with TypeScript
<script setup lang="ts">
import { ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import ChildComponent from './ChildComponent.vue'

const childRef = ref<ComponentPublicInstance<typeof ChildComponent>>()
const inputRef = ref<HTMLInputElement>()
</script>

<template>
  <ChildComponent ref="childRef" />
  <input ref="inputRef" />
</template>
```

## Testing Setup

**Install:**
```bash
npm install -D vitest @vue/test-utils jsdom @vitest/ui
```

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: 'jsdom',
  },
})
```

**Component test pattern:**
```typescript
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import UserProfile from './UserProfile.vue'

describe('UserProfile', () => {
  it('displays user name', () => {
    const wrapper = mount(UserProfile, {
      props: { name: 'Alice' }
    })
    expect(wrapper.text()).toContain('Alice')
  })

  it('emits update on button click', async () => {
    const wrapper = mount(UserProfile)
    await wrapper.find('[data-test="edit-btn"]').trigger('click')
    expect(wrapper.emitted('update')).toBeTruthy()
  })
})
```

**Composable test pattern:**
```typescript
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('increments count', () => {
    const { count, increment } = useCounter()
    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })
})
```

## Essential Tools

**Development:**
- **Volar** - VSCode extension for Vue 3 + TypeScript (replaces Vetur)
- **Vue DevTools** - Browser extension for debugging components, Pinia stores, and reactivity

**Testing:**
- **Vitest** - Fast, Vite-native test runner
- **@vue/test-utils** - Official Vue component testing library

**Libraries:**
- **VueUse** - Collection of essential Vue composables (@vueuse/core)
- **Pinia** - Official state management
- **Vue Router** - Official routing library

## Performance Patterns

```vue
<!-- Use computed for derived state -->
<script setup>
const items = ref([...])
// ❌ WRONG: Recalculates every render
const filteredItems = items.value.filter(x => x.active)

// ✅ CORRECT: Cached until dependencies change
const filteredItems = computed(() =>
  items.value.filter(x => x.active)
)
</script>

<!-- Use v-memo for expensive lists -->
<template>
  <div v-for="item in items" :key="item.id" v-memo="[item.id, item.name]">
    <!-- Only re-renders if item.id or item.name changes -->
    <ExpensiveComponent :item="item" />
  </div>
</template>

<!-- Use v-once for static content -->
<template>
  <div v-once>
    <!-- Rendered once, never updates -->
    <h1>{{ staticTitle }}</h1>
  </div>
</template>
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `const x = props.value` | Use `toRef(props, 'value')` or `computed(() => props.value)` |
| `items.push()` (non-reactive array) | Use `ref([])` or `reactive([])` |
| `{{ count.value }}` in template | Remove `.value` (auto-unwrapped) |
| `ref({ data })` then `state.data.x = y` | Use `state.value.data.x = y` or use `reactive()` |
| Mixing Options API + Composition API | Choose one (prefer Composition) |
| `shallowMount()` by default | Use `mount()` unless optimizing slow tests |

## Quick Checklist

When helping with Vue 3 projects:
- [ ] Use `<script setup>` syntax
- [ ] Use TypeScript with `lang="ts"`
- [ ] Choose `ref()` vs `reactive()` based on table above
- [ ] Warn about reactivity pitfalls if destructuring or mutating
- [ ] Suggest Pinia only when state is truly app-wide
- [ ] Recommend Vitest + @vue/test-utils for testing
- [ ] Mention Vue DevTools for debugging complex reactivity
- [ ] Use `data-test` attributes for test selectors
- [ ] Add `computed()` for derived state instead of functions
- [ ] Check for VueUse composables before reinventing (useLocalStorage, useFetch, etc.)
