---
name: vue-development
description: This skill should be used when creating or working with Vue.js applications using TypeScript and Vite. Provides guidance on testing-first development with Testing Library, functional core/imperative shell patterns, Pinia state management with Composition API, feature-based architecture, composable best practices, and type safety. Apply when creating Vue components (.vue files), composables (useX functions), Pinia stores, writing component tests, reviewing Vue code for best practices, or architecting Vue applications. Always check VueUse before implementing custom composables.
---

# Vue Development Skill


## Quick Reference (30-second scan)

### Core Principles (The Non-Negotiables)
1. **Test user behavior** - Use `getByRole`/`getByLabelText`, never `wrapper.vm`
2. **Check VueUse first** - Search [vueuse.org](https://vueuse.org/) before implementing any composable
3. **Functional core, imperative shell** - Pure logic separate from Vue reactivity for complex business logic
4. **Feature-based architecture** - Organize by features: `src/features/{feature}/{components,composables,stores,tests}`
5. **Return `{ data, error }`** - Actions/composables return explicit error state, never throw

### Decision Trees

#### State Management Decision Tree
```
Is data shared across components?
├─ NO → Use local ref() or reactive()
│
└─ YES → Is it shared between...?
   ├─ 2-3 specific components → Composable with module-level state
   │                            (SSR? Use provide/inject)
   ├─ Server data (API) → pinia-colada or TanStack Vue Query
   │                       (don't manage server state manually)
   └─ Global client state → Is it complex (CRUD/business logic)?
      ├─ YES → Pinia with Composition API
      │        • Each action returns { data, error }
      │        • Never calls toast/alert
      │        • Consumer decides error presentation
      └─ NO → Composable with module-level state
              (simple: auth, theme, locale)
```

#### Composable Extraction Decision Tree
```
How complex is the logic?
├─ Simple (<10 lines, no reuse)
│  └─ Keep inline in <script setup>
│
├─ Medium (10-50 lines)
│  ├─ Used only in this component?
│  │  └─ Extract to inline function
│  │     Example: function useFeature() { /* ... */ }
│  │
│  └─ Reused across components?
│     └─ ⚠️ CHECK VUEUSE FIRST! (vueuse.org)
│        ├─ Exists in VueUse → Use it
│        └─ Not in VueUse → Create in features/{feature}/composables/
│
└─ Complex (50+ lines OR complex business logic)
   └─ Separate file
      └─ Pure business logic?
         ├─ YES → Functional Core/Shell pattern
         │        • Pure functions in {feature}/core/
         │        • Reactive wrapper in {feature}/composables/
         └─ NO → Single file in {feature}/composables/
```

#### Testing Stack Decision Tree
```
What are you testing?
├─ Pure functions (no Vue) → Vitest unit tests
│                            • No mounting, just call function
│                            • Example: describe('utils', () => { ... })
│
├─ Components/Composables → Vitest + Vue Testing Library
│                           • Use Page Object Pattern
│                           • getByRole, userEvent.setup()
│                           • Never access wrapper.vm
│
└─ Critical user flows → Playwright E2E
                         • Login, checkout, data submission
                         • Real browser, real network
```

### Anti-Patterns Quick Check

Before committing code, verify you're NOT doing these:

| ❌ Anti-Pattern | ✅ Correct Approach | Location |
|----------------|-------------------|----------|
| `wrapper.vm.someProperty` | `screen.getByRole(...)` | references/TESTING.md |
| `throw new Error()` in composable | `return { data: null, error }` | references/STATE-MANAGEMENT.md |
| `toast.error()` in store/composable | Return error, let consumer show toast | references/STATE-MANAGEMENT.md |
| `as UserType` type assertion | Type guard function | references/TYPESCRIPT.md |
| `any` type | Use generics or `unknown` + type guard | references/TYPESCRIPT.md |
| Event bus for state | Pinia, composables, provide/inject | references/PATTERNS.md |
| `fireEvent.click()` | `await user.click()` with userEvent | references/TESTING.md |

### Pattern Catalog (Quick Links)

#### Component Patterns
- **Humble Components** - Props down, events up, no business logic → [references/COMPONENT-PATTERNS.md](references/COMPONENT-PATTERNS.md#1-humble-components-pattern)
- **Controller Components** - Orchestrate multiple composables → [references/COMPONENT-PATTERNS.md](references/COMPONENT-PATTERNS.md#2-controller-components)
- **Extract Conditional** - Complex `v-if`/`v-else` → named components → [references/COMPONENT-PATTERNS.md](references/COMPONENT-PATTERNS.md#3-extract-conditional-pattern)
- **Strategy Pattern** - Dynamic component selection with `<component :is>` → [references/COMPONENT-PATTERNS.md](references/COMPONENT-PATTERNS.md#5-strategy-pattern)
- **Thin Composables** - Pure logic separate from reactivity → [references/COMPONENT-PATTERNS.md](references/COMPONENT-PATTERNS.md#9-thin-composables-pattern)

#### State Patterns
- **Pinia (Composition API)** - Global state with `{ data, error }` return → [references/STATE-MANAGEMENT.md](references/STATE-MANAGEMENT.md#pinia-with-composition-api)
- **Shared State Container** - Module-level reactive for simple shared state → [references/PATTERNS.md](references/PATTERNS.md#shared-state-container-pattern)
- **Functional Core/Shell** - Pure functions + reactive wrappers → [references/PATTERNS.md](references/PATTERNS.md#functional-core-imperative-shell)

#### Testing Patterns
- **Page Object Pattern** - Encapsulate queries/actions at end of test file → [references/TESTING.md](references/TESTING.md#basic-structure-with-page-object-pattern)
- **User Event Testing** - `userEvent.setup()`, never `fireEvent` → [references/TESTING.md](references/TESTING.md#user-interactions)
- **Async Testing** - `findBy*` for async elements, `waitFor` for complex conditions → [references/TESTING.md](references/TESTING.md#async-testing)

#### Composition Patterns
- **Inline Composables** - Extract within component first, file only if reused → [references/COMPOSITION-EXCELLENCE.md](references/COMPOSITION-EXCELLENCE.md#2-inline-composable-functions)
- **Explicit Dependencies** - Pass params, avoid module-scope coupling → [references/COMPOSITION-EXCELLENCE.md](references/COMPOSITION-EXCELLENCE.md#4-explicit-dependencies)
- **Progressive Extraction** - Inline → function → file → shared directory → [references/COMPOSITION-EXCELLENCE.md](references/COMPOSITION-EXCELLENCE.md#5-progressive-extraction-strategy)

#### TypeScript Patterns
- **Discriminated Unions** - Variant props with `type` + `never` fields → [references/TYPESCRIPT.md](references/TYPESCRIPT.md#discriminated-unions-for-props)
- **Generic Components** - `<script setup lang="ts" generic="T">` → [references/TYPESCRIPT.md](references/TYPESCRIPT.md#generic-components)
- **Type Guards** - Runtime validation with `value is Type` → [references/TYPESCRIPT.md](references/TYPESCRIPT.md#type-guards)

---

## Detailed Guidance

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

See [references/TESTING.md](references/TESTING.md) for detailed practices.

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

See [references/PATTERNS.md](references/PATTERNS.md) for more architectural patterns.

### 3. Composables Best Practices

**Before implementing a composable, check if VueUse has it!**

[VueUse](https://vueuse.org/) provides 200+ essential Vue Composition utilities. Always search VueUse first:
- DOM operations → `useEventListener`, `useIntersectionObserver`, `useResizeObserver`
- Browser APIs → `useLocalStorage`, `useFetch`, `useClipboard`, `useGeolocation`
- State management → `useToggle`, `useCounter`, `useDebounce`, `useThrottle`
- Component utilities → `useVModel`, `useTemplateRef`, `onClickOutside`

Only implement custom composables when VueUse doesn't have what you need.

**Progressive Extraction Strategy:**
1. **Start inline** - Begin with code directly in `<script setup>`
2. **Extract to inline functions** - Create composable functions within the same file
3. **Move to separate file** - Only when reused across 2+ components
4. **Move to shared** - If generic enough for app-wide use

**Key Patterns:**
- **Check VueUse First**: Don't reinvent the wheel
- **Single Responsibility**: One composable, one concern
- **Explicit Dependencies**: Pass dependencies as parameters
- **Explicit Error State**: Return `{ data, error, loading }` - never throw
- **No UI Logic**: No toast/alert calls in composables
- **Inline First**: Extract functions within components before creating separate files

**See the gold standard:** [references/COMPOSITION-EXCELLENCE.md](references/COMPOSITION-EXCELLENCE.md) for real-world examples

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

See [references/STATE-MANAGEMENT.md](references/STATE-MANAGEMENT.md) for detailed patterns and examples.

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

See [references/TYPESCRIPT.md](references/TYPESCRIPT.md) for advanced patterns.

## Component Architecture

### The Gold Standard

**The perfect way to structure Vue components with `<script setup>`:**

1. **Organized imports** - External deps → Reusable functions → GraphQL → Utils
2. **Inline composables** - Extract focused functions for related state/logic
3. **Explicit dependencies** - Pass parameters instead of implicit coupling
4. **Progressive extraction** - Move to files only when reused

**Real-world example:** See [references/COMPOSITION-EXCELLENCE.md](references/COMPOSITION-EXCELLENCE.md) for a production-grade component demonstrating this pattern.

### Component Design Patterns

**Learn 13+ proven patterns for writing maintainable, testable Vue components.**

Key patterns include:
- **Humble Components** - Keep components focused on presentation
- **Controller Components** - Orchestrate composables and child components
- **Extract Conditional** - Simplify complex conditional rendering
- **Strategy Pattern** - Dynamic component selection
- **Thin Composables** - Separate pure logic from reactivity

See [references/COMPONENT-PATTERNS.md](references/COMPONENT-PATTERNS.md) for detailed patterns with examples.

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

See [references/PATTERNS.md](references/PATTERNS.md) for more architectural patterns.

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
2. **Study the gold standard:** [references/COMPOSITION-EXCELLENCE.md](references/COMPOSITION-EXCELLENCE.md) - Perfect `<script setup>` organization
3. Check relevant detailed docs:
   - [references/COMPONENT-PATTERNS.md](references/COMPONENT-PATTERNS.md) - 13+ component design patterns
   - [references/PATTERNS.md](references/PATTERNS.md) - Architectural patterns & feature-based structure
   - [references/STATE-MANAGEMENT.md](references/STATE-MANAGEMENT.md) - Pinia + Elm deep dive
   - [references/TESTING.md](references/TESTING.md) - Testing Library practices
   - [references/TYPESCRIPT.md](references/TYPESCRIPT.md) - Type safety patterns
4. Use templates for scaffolding new code
5. Always prioritize testability, type safety, and feature-based organization

## Skill Resources

This skill includes bundled resources to help with Vue development tasks:

### scripts/
Executable utilities to automate common Vue development tasks.

**Available scripts:**
- `init_vue_component.py` - Initialize new Vue components with test files
  - Creates component in PascalCase with proper structure
  - Generates corresponding test file with Testing Library setup
  - Usage: `python scripts/init_vue_component.py ComponentName --path src/features/feature/components`
- `validate_skill.py` - Validate the skill structure and required files
- `package_skill.py` - Package the skill into a distributable zip file

### references/
In-depth documentation loaded into context when needed by Claude.

**Available references:**
- `COMPONENT-PATTERNS.md` - 13+ proven component design patterns
- `COMPOSITION-EXCELLENCE.md` - Gold standard component organization
- `PATTERNS.md` - Architectural patterns and project structure
- `STATE-MANAGEMENT.md` - Pinia with Composition API deep dive
- `TESTING.md` - Testing Library best practices
- `TYPESCRIPT.md` - Advanced TypeScript patterns

### templates/
Code templates for creating new Vue code (see templates/ directory).

**Available templates:**
- `component.template.vue` - Vue component with `<script setup>`
- `composable.template.ts` - Composable function with error handling
- `store.template.ts` - Pinia store with Composition API
- `test.template.ts` - Component test with Testing Library

### assets/
Boilerplate project structure (not loaded into context, used as reference).

**Available assets:**
- `vue-starter-project/` - Minimal Vite + Vue 3 + TypeScript project
  - Demonstrates feature-based architecture
  - Includes testing setup (Vitest + Testing Library)
  - Example Pinia store and composable
  - Production-ready configuration
