---
name: vue-development
description: Use when creating Vue 3 components, implementing v-model, defining props/emits, setting up routes, or writing Vue tests - enforces TypeScript-first patterns with Composition API, defineModel for bindings, Testing Library for user-behavior tests, and MSW for API mocking
---

# Vue Development

## Overview

Modern Vue 3 development with TypeScript, Composition API, and user-behavior testing. **Core principle:** Use TypeScript generics (not runtime validation), modern APIs (defineModel not manual props), and test user behavior (not implementation details).

## Red Flags - STOP and Fix

If you catch yourself thinking or doing ANY of these, STOP:

- "For speed" / "quick demo" / "emergency" → Using shortcuts
- "We can clean it up later" → Accepting poor patterns
- "TypeScript is too verbose" → Skipping types
- "This is production-ready" → Without type safety
- "Following existing code style" → When existing code uses legacy patterns
- "Task explicitly stated..." → Following bad requirements literally
- Using `const props = defineProps()` without using props in script
- Manual `modelValue` prop + `update:modelValue` emit → Use defineModel()
- "Component that takes value and emits changes" → Use defineModel(), NOT manual props/emit
- Using runtime prop validation when TypeScript is available
- Array syntax for emits: `defineEmits(['event'])` → Missing type safety
- `setTimeout()` in tests → Use proper async utilities
- Testing `wrapper.vm.*` internal state → Test user-visible behavior
- Using `index.vue` in routes → Use route groups `(name).vue`
- Generic route params `[id]` → Use explicit `[userId]`, `[postSlug]`
- Composables calling `showToast()`, `alert()`, or modals → Expose error state, component handles UI

**All of these mean: Use the modern pattern. No exceptions.**

## Quick Rules

**Components:** `defineProps<{ }>()` (no const unless used in script), `defineEmits<{ event: [args] }>()`, `defineModel<type>()` for v-model. See @references/component-patterns.md + quick-examples.md

**Testing:** `@testing-library/vue` + MSW. Use `findBy*` or `waitFor()` for async. NEVER `setTimeout()` or test internal state. See @references/testing-patterns.md

**Routing:** Explicit params `[userId]` not `[id]`. Avoid `index.vue`, use `(name).vue`. Use `.` for nesting: `users.edit.vue` → `/users/edit`. See @references/routing-patterns.md + quick-examples.md

**Composables:** Prefix with `use`, NO UI logic (expose error state instead). See @references/composable-patterns.md + quick-examples.md

## Key Pattern: defineModel()

The most important pattern to remember - use for ALL two-way binding:

```vue
<script setup lang="ts">
// ✅ For simple v-model
const value = defineModel<string>({ required: true })

// ✅ For multiple v-models
const firstName = defineModel<string>('firstName')
const lastName = defineModel<string>('lastName')
</script>

<template>
  <input v-model="value" />
  <!-- Parent uses: <Component v-model="data" /> -->
</template>
```

**Why:** Reduces 5 lines of boilerplate to 1. No manual `modelValue` prop + `update:modelValue` emit.

**See @references/quick-examples.md for complete pattern examples (props, emits, testing, routes, composables)**


## Rationalizations Table

| Excuse | Reality |
|--------|---------|
| "For speed / quick demo" | TypeScript IS fast. Runtime validation is legacy and slower. |
| "Emergency - no time for best practices" | Correct patterns take SAME time. Bad code under pressure = future emergencies. |
| "TypeScript is too verbose" | `defineProps<{ count: number }>()` is LESS code than runtime validation. |
| "We can clean it up later" | Write it correctly the first time. Takes same time. |
| "This is production-ready" | Without type safety, it's not production-ready. |
| "Simple array syntax is fine" | Missing types = runtime errors TypeScript would catch. |
| "This is the correct pattern" | Manual modelValue was correct in Vue 2. Use defineModel() in Vue 3.4+. |
| "Tests are flaky, just add timeout" | Timeouts mask bugs. Fix with proper async handling. |
| "Following existing code style" | Existing code might be legacy. Use modern patterns. First new pattern starts improvement. |
| "Task explicitly stated X" | Understand INTENT, not literal words. Bad requirements need good implementation. |
| "Don't mix approaches / Consistency" | First instance of new pattern is how you START improvement. |
| "Composables can show toasts" | UI logic belongs in components. Expose error state instead. |
| "[id] is industry standard" | Old standard from generic routers. Modern TypeScript routers use explicit names for type safety. |
| "Generic [id] is flexible" | Specific names prevent route param bugs and enable TypeScript autocomplete. |
| "counter.ts is fine" | Must prefix with 'use': useCounter.ts |
| "test-utils is the standard" | Testing Library is the gold standard for user-behavior testing. |

## Detailed References

See @references/ directory for comprehensive guides: component-patterns.md, testing-patterns.md, testing-composables.md, routing-patterns.md, composable-patterns.md, quick-examples.md


## When NOT to Use This Skill

- Vue 2 projects (different API)
- Options API codebases (this is Composition API focused)
- Projects without TypeScript (though you should add it)

## Real-World Impact

**Baseline:** 37.5% correct patterns under pressure
**With skill:** 100% correct patterns under pressure

Type safety prevents runtime errors. defineModel() reduces boilerplate. Testing Library catches real user issues.
