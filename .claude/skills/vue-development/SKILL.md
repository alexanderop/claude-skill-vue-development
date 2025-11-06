---
name: vue-development
description: Guide for writing Vue.js applications with TypeScript using Vite, focusing on testing-first development, functional patterns, Pinia with Composition API, feature-based architecture, composables best practices, and type safety. Use when creating Vue components, composables, stores, or reviewing Vue code for best practices.
---

# Vue Development Skill

This skill guides Vue.js development following principles of testability, type safety, feature-based architecture, and clean code patterns.

## Core Principles

### 1. Testing-First Mindset

**Always test user behavior, never implementation details.**

- Use Testing Library exclusively - find elements by role/text, not internals
- Never access `wrapper.vm` - it's an anti-pattern
- Tests should survive refactoring
- Test naming: "should [verb] [expected outcome] when [trigger event]"
- Prefer real router integration over mocking

**Stack:** Vitest + Testing Library + Playwright (E2E)

See [TESTING.md](TESTING.md) for detailed practices.

### 2. Functional Core, Imperative Shell

**Separate pure business logic from Vue reactivity.**

- Pure functions in separate files (e.g., `pureGameSnake.ts`) - NO Vue dependencies
- Reactive wrappers in composables (e.g., `useGameSnake.ts`)
- Makes testing trivial - pure functions need no mocking
- Framework-agnostic business logic

```typescript
// pureGameSnake.ts - Pure logic
export function moveSnake(snake: Snake, direction: Position): Snake {
  return snake.map((segment, index) => {...})
}

// useGameSnake.ts - Reactive wrapper
export function useGameSnake() {
  const snake = ref(GameLogic.initializeSnake())
  const direction = ref({ x: 0, y: 0 })

  function move() {
    snake.value = GameLogic.moveSnake(snake.value, direction.value)
  }

  return { snake: readonly(snake), direction, move }
}
```

See [PATTERNS.md](PATTERNS.md) for more architectural patterns.

### 3. Composables Best Practices

**Before implementing a composable, check if VueUse has it!**

[VueUse](https://vueuse.org/) provides 200+ essential Vue Composition utilities. Always search VueUse first:
- DOM operations → `useEventListener`, `useIntersectionObserver`, `useResizeObserver`
- Browser APIs → `useLocalStorage`, `useFetch`, `useClipboard`, `useGeolocation`
- State management → `useToggle`, `useCounter`, `useDebounce`, `useThrottle`
- Component utilities → `useVModel`, `useTemplateRef`, `onClickOutside`

Only implement custom composables when VueUse doesn't have what you need.

**File Organization:**
- Prefix with `use` and PascalCase (e.g., `useCounter.ts`)
- Place in `composables/` directory
- Use object arguments for 4+ parameters

**Internal Structure:**
1. Primary state (main reactive data)
2. State metadata (loading, error states)
3. Methods (functions that update state)
4. Lifecycle hooks
5. Watch/computed
6. Return statement

**Key Patterns:**
- **Check VueUse First**: Don't reinvent the wheel
- **Single Responsibility**: One composable, one concern
- **Explicit Error State**: Return `{ data, error, loading }` - never throw
- **No UI Logic**: No toast/alert calls in composables
- **Inline First**: Extract functions within components before creating separate files

**Template:** See [templates/composable.template.ts](templates/composable.template.ts)

### 4. State Management

**Use Pinia with Composition API for global state:**

**Core Principles:**
- **Single Responsibility**: Each action does ONE thing
- **Explicit Error Handling**: Return `{ data, error }`, never throw
- **No UI Logic**: Store never calls toast/alert - consumer decides
- **Readonly State**: Use `readonly()` to prevent mutations outside actions
- **Composition API**: Modern, type-safe approach with `defineStore`

**When to use:**
- Global state management (CRUD + business logic)
- Need DevTools support for debugging
- Multiple components share state
- Want type-safe, predictable state updates

**Alternatives:**
- Component-local state → Local `ref()`/`reactive()`
- Shared between few components → Composables
- Server state → pinia-colada, TanStack Vue Query
- Cross-component communication → provide/inject

See [STATE-MANAGEMENT.md](STATE-MANAGEMENT.md) for detailed patterns and examples.

**Template:** See [templates/store.template.ts](templates/store.template.ts)

### 5. TypeScript Patterns

**Use discriminated unions for variant props:**

```typescript
type BaseProps = { title: string }

type SuccessProps = BaseProps & {
  variant: 'success'
  message: string
  errorCode?: never  // Prevents mixing
}

type ErrorProps = BaseProps & {
  variant: 'error'
  errorCode: string
  message?: never
}

type Props = SuccessProps | ErrorProps
```

**Key practices:**
- Avoid `as` type assertions
- Extract utility types for reusability
- Use type guards for runtime validation

See [TYPESCRIPT.md](TYPESCRIPT.md) for advanced patterns.

## Component Architecture

### Component Design Patterns

**Learn 13+ proven patterns for writing maintainable, testable Vue components.**

Key patterns include:
- **Humble Components** - Keep components focused on presentation
- **Controller Components** - Orchestrate composables and child components
- **Extract Conditional** - Simplify complex conditional rendering
- **Strategy Pattern** - Dynamic component selection
- **Thin Composables** - Separate pure logic from reactivity

See [COMPONENT-PATTERNS.md](COMPONENT-PATTERNS.md) for detailed patterns with examples.

### Naming Conventions
- **Base components**: `BaseButton.vue`, `BaseTable.vue`, `BaseIcon.vue`
- **Related components**: `TodoList.vue`, `TodoListItem.vue`, `TodoListItemButton.vue`
- **Order**: Highest-level first (e.g., `SearchButtonClear.vue` not `ClearSearchButton.vue`)

### Code Style
- Always use `<script setup lang="ts">`
- Composition API (never Options API)
- Scoped styles or BEM with team prefixes

**Template:** See [templates/component.template.vue](templates/component.template.vue)

## Project Structure

**Always use feature-based architecture** for maintainability and scalability.

### Feature-Based Structure (Recommended)

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.vue
│   │   │   └── RegisterForm.vue
│   │   ├── composables/
│   │   │   └── useAuth.ts
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── tests/
│   │       └── LoginForm.test.ts
│   │
│   ├── todos/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── stores/
│   │   └── tests/
│   │
│   └── profile/
│       ├── components/
│       ├── composables/
│       └── tests/
│
├── shared/
│   ├── components/       # Shared UI components
│   │   ├── BaseButton.vue
│   │   └── BaseInput.vue
│   ├── composables/      # Shared composables
│   ├── utils/            # Utility functions
│   └── types/            # Shared types
│
├── router/
│   └── index.ts
│
└── App.vue
```

**Benefits:**
- Each feature is self-contained
- Easy to find related code
- Clear boundaries between features
- Scales well as app grows
- Easy to onboard new developers

See [PATTERNS.md](PATTERNS.md) for more architectural patterns.

## Anti-Patterns to Avoid

❌ **No event buses for state** - Use Pinia, composables, or provide/inject
❌ **No testing implementation details** - Test user behavior only
❌ **No throwing from composables** - Return explicit error state
❌ **No UI logic in composables** - Keep them UI-agnostic
❌ **No white box testing** - Never access component internals

## Common Tasks

### Creating a new composable
1. **Check VueUse first** - Search [vueuse.org](https://vueuse.org/) to see if it already exists
2. Start inline within the component
3. Extract to a function if reused within component
4. Move to separate file only if shared across components
5. Use template: [templates/composable.template.ts](templates/composable.template.ts)

### Creating a new store
- Use Pinia with Composition API
- Each action returns `{ data, error }`
- Store never handles UI (no toast/alert)
- Consumer decides error presentation
- Template: [templates/store.template.ts](templates/store.template.ts)

### Writing component tests
- Use Testing Library
- Find elements by role/text
- Test user behavior
- Template: [templates/test.template.ts](templates/test.template.ts)

## Tools & Libraries

**Core Stack:**
- Vue 3 + TypeScript
- **Vite** (always use Vite for build tooling)
- Pinia (Composition API)
- Vue Router

**Testing:**
- Vitest + Testing Library
- Playwright (E2E)

**Essential Libraries:**
- **VueUse** (ALWAYS check first before implementing composables) - 200+ composition utilities
- TailwindCSS

**Before implementing any composable functionality, search VueUse documentation at [vueuse.org](https://vueuse.org/)**

## When Complexity is Overkill

**Use simpler patterns when:**
- Single component state → Local `ref()`/`reactive()`
- Shared between few components → Composables
- Server state → TanStack Query or pinia-colada
- Simple cross-component communication → provide/inject

**Be pragmatic, not dogmatic.**

## Getting Started

1. Review this SKILL.md for essential principles
2. Check relevant detailed docs:
   - [COMPONENT-PATTERNS.md](COMPONENT-PATTERNS.md) - 13+ component design patterns
   - [PATTERNS.md](PATTERNS.md) - Architectural patterns & feature-based structure
   - [STATE-MANAGEMENT.md](STATE-MANAGEMENT.md) - Pinia + Elm deep dive
   - [TESTING.md](TESTING.md) - Testing Library practices
   - [TYPESCRIPT.md](TYPESCRIPT.md) - Type safety patterns
3. Use templates for scaffolding new code
4. Always prioritize testability, type safety, and feature-based organization
