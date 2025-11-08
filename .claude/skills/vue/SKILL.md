---
name: vue-development
description: Use when creating Vue 3 components, implementing v-model, defining props/emits, setting up routes, or writing Vue tests - enforces TypeScript-first patterns with Composition API, defineModel for bindings, Testing Library for user-behavior tests, and MSW for API mocking
---

# Vue Development

## Overview

Modern Vue 3 development with TypeScript, Composition API, and user-behavior testing. **Core principle:** Use TypeScript generics (not runtime validation), modern APIs (defineModel not manual props), and test user behavior (not implementation details).

## Red Flags - STOP and Fix

If you catch yourself thinking or doing ANY of these, STOP:

- "For speed" / "quick demo" → Using shortcuts
- "We can clean it up later" → Accepting poor patterns
- "TypeScript is too verbose" → Skipping types
- "This is production-ready" → Without type safety
- Using `const props = defineProps()` without using props in script
- Manual `modelValue` prop + `update:modelValue` emit → Use defineModel()
- Using runtime prop validation when TypeScript is available
- Array syntax for emits: `defineEmits(['event'])` → Missing type safety
- `setTimeout()` in tests → Use proper async utilities
- Testing `wrapper.vm.*` internal state → Test user-visible behavior
- Using `index.vue` in routes → Use route groups `(name).vue`
- Generic route params `[id]` → Use explicit `[userId]`, `[postSlug]`

**All of these mean: Use the modern pattern. No exceptions.**

## Quick Rules

### Components
- Props: `defineProps<{ }>()` with TypeScript, no `const` unless used in script
- Emits: `const emit = defineEmits<{ event: [args] }>()`
- V-model: `defineModel<type>()` (NOT manual modelValue)
- Template: `:prop` shorthand, `#slot` shorthand, explicit `<template>` tags
- See @references/component-patterns.md for detailed examples

### Testing
- PRIMARY: `@testing-library/vue` for user behavior
- API mocking: MSW (`msw`)
- NEVER: `setTimeout()` in tests, testing internal state
- Async: Use `findBy*` queries or `waitFor()`
- See @references/testing-patterns.md for detailed examples

### Routing
- AVOID: `index.vue` → use route groups `(name).vue`
- Params: Explicit names `[userId]` not `[id]`
- Nesting: Use `.` in filename: `users.edit.vue` → `/users/edit`
- Navigation: Named routes with typed params
- See @references/routing-patterns.md for detailed examples

### Composables
- Naming: `useFeatureName` with PascalCase, prefix with `use`
- Location: `src/composables/` directory
- Structure: Primary state → Metadata → Methods
- Single responsibility: One composable, one purpose
- NO UI logic: No toasts, alerts, or modals in composables
- See @references/composable-patterns.md for detailed examples

## Essential Patterns

### Props Definition

```vue
<script setup lang="ts">
// ✅ CORRECT: No const when props not used in script
defineProps<{
  userId: number
  userName: string
}>()

// ✅ CORRECT: With const ONLY when used in script
const props = defineProps<{
  count: number
}>()
console.log(props.count)

// ❌ WRONG: Runtime validation with TypeScript available
defineProps({
  user: {
    type: Object as PropType<User>,
    required: true
  }
})
</script>
```

### Emits Definition

```vue
<script setup lang="ts">
// ✅ CORRECT: TypeScript with typed payloads
const emit = defineEmits<{
  submit: [formData: FormData]
  cancel: []
  update: [userId: number, changes: Partial<User>]
}>()

// ❌ WRONG: Array syntax without types
const emit = defineEmits(['submit', 'cancel'])
</script>
```

### V-Model

```vue
<script setup lang="ts">
// ✅ CORRECT: Simple v-model
const title = defineModel<string>({ required: true })

// ✅ CORRECT: Multiple v-models
const firstName = defineModel<string>('firstName')
const age = defineModel<number>('age')

// ❌ WRONG: Manual modelValue
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
```

### Testing

```ts
// ✅ CORRECT: Testing Library + MSW
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/users', () => HttpResponse.json([...]))
)

test('loads and displays users', async () => {
  render(UserList)
  expect(await screen.findByText('John Doe')).toBeInTheDocument()
})

// ❌ WRONG: test-utils + setTimeout
const wrapper = mount(UserList)
await new Promise(r => setTimeout(r, 1000))
expect(wrapper.vm.isLoading).toBe(false)
```

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| `const props = defineProps({ })` | Use `defineProps<{ }>()` with TypeScript |
| `const props =` when unused | Remove `const`, just `defineProps<{ }>()` |
| `defineEmits(['event'])` | Use `defineEmits<{ event: [] }>()` |
| Manual `modelValue` + emit | Use `defineModel<type>()` |
| `setTimeout` in tests | Use `findBy*` or `waitFor()` |
| Testing `wrapper.vm.*` | Test visible UI, not internal state |
| `index.vue` in pages | Use route groups `(name).vue` |
| Generic `[id]` param | Explicit `[userId]`, `[postSlug]` |
| `:count="count"` | Use shorthand `:count` |
| `v-slot:header` | Use shorthand `#header` |

## Rationalizations Table

| Excuse | Reality |
|--------|---------|
| "For speed / quick demo" | TypeScript IS fast. Runtime validation is legacy and slower. |
| "TypeScript is too verbose" | `defineProps<{ count: number }>()` is LESS code than runtime validation. |
| "We can clean it up later" | Write it correctly the first time. Takes same time. |
| "This is production-ready" | Without type safety, it's not production-ready. |
| "Simple array syntax is fine" | Missing types = runtime errors TypeScript would catch. |
| "This is the correct pattern" | Manual modelValue was correct in Vue 2. Use defineModel() in Vue 3.4+. |
| "Tests are flaky, just add timeout" | Timeouts mask bugs. Fix with proper async handling. |
| "Following existing code style" | Existing code might be legacy. Use modern patterns. |
| "Composables can show toasts" | UI logic belongs in components. Expose error state instead. |
| "counter.ts is fine" | Must prefix with 'use': useCounter.ts |
| "test-utils is the standard" | Testing Library is the gold standard for user-behavior testing. |

## Detailed References

**When implementing components:**
- Read @references/component-patterns.md for all prop, emit, v-model, and template patterns

**When writing tests:**
- Read @references/testing-patterns.md for Testing Library, MSW, and async patterns
- Read @references/testing-composables.md for testing composables in isolation (withSetup, useInjectedSetup)

**When setting up routes:**
- Read @references/routing-patterns.md for file-based routing and navigation patterns

**When creating composables:**
- Read @references/composable-patterns.md for composable structure, naming, and best practices

## Quick Checklists

### Component Setup
- [ ] Props: `defineProps<{ }>()` with TypeScript
- [ ] Props used in script? Add `const props =`, otherwise omit
- [ ] Emits: `const emit = defineEmits<{ event: [args] }>()`
- [ ] V-model? Use `defineModel<type>()`
- [ ] Template: Use `:prop` shorthand, `#slot` shorthand

### Testing Setup
- [ ] Import from `@testing-library/vue`
- [ ] Use MSW for API mocking
- [ ] Query by `getByRole`, `getByLabelText`
- [ ] Async? Use `findBy*` queries
- [ ] NO `setTimeout()`, NO testing internal state

### Route Setup
- [ ] Avoid `index.vue` → use `(name).vue`
- [ ] Explicit params: `[userId]` not `[id]`
- [ ] Use `.` for path separation without nesting
- [ ] Named routes with typed params

### Composable Setup
- [ ] File named with `use` prefix: `useFeatureName.ts`
- [ ] Single responsibility (one purpose)
- [ ] Expose error state (not just console.error)
- [ ] NO UI logic (toasts, alerts, modals)
- [ ] Consistent structure: refs → computed → methods → lifecycle → watch

## When NOT to Use This Skill

- Vue 2 projects (different API)
- Options API codebases (this is Composition API focused)
- Projects without TypeScript (though you should add it)

## Real-World Impact

**Baseline:** 37.5% correct patterns under pressure
**With skill:** 100% correct patterns under pressure

Type safety prevents runtime errors. defineModel() reduces boilerplate. Testing Library catches real user issues.
