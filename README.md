# Vue Development Skill

> A Claude Code Agent Skill for building high-quality Vue.js applications with TypeScript, emphasizing testing-first development, functional patterns, and maintainable architecture.

## What is this?

This is an **Agent Skill** for Claude Code that provides expert guidance on Vue.js development. When installed, Claude automatically uses this skill when you're working with Vue.js code, components, composables, stores, or asking about Vue best practices.

**Key Features:**
- **The Gold Standard Pattern**: Real-world example of perfect component organization with `<script setup>`
- **Component Design Patterns**: 13+ proven patterns for maintainable, testable components
- **Testing-First Approach**: Write tests that survive refactoring
- **Functional Core, Imperative Shell**: Separate pure logic from framework code
- **Feature-Based Architecture**: Organize code by features, not file types
- **Composables Best Practices**: Progressive extraction strategy with inline composables
- **Pinia with Composition API**: Single responsibility, explicit error handling, no UI logic in stores
- **TypeScript Patterns**: Type-safe components with discriminated unions
- **Comprehensive Templates**: Ready-to-use templates for components, composables, stores, and tests

## Installation

### For Personal Use (Available in All Your Projects)

Copy the skill to your personal Claude skills directory:

```bash
# Clone this repository
git clone https://github.com/yourusername/vue-development-skill.git

# Copy to personal skills directory
cp -r vue-development-skill/.claude/skills/vue-development ~/.claude/skills/vue-development
```

### For Team/Project Use (Shared via Git)

Add this skill to your project repository:

```bash
# Clone this repository
git clone https://github.com/yourusername/vue-development-skill.git

# Copy to your project's skills directory
cp -r vue-development-skill/.claude/skills/vue-development /path/to/your-project/.claude/skills/vue-development

# Commit to your project
cd /path/to/your-project
git add .claude/skills/vue-development
git commit -m "Add Vue development skill"
git push
```

Team members will automatically get the skill when they pull your repository.

### Verify Installation

After installation, ask Claude:

```
What Skills are available?
```

You should see `vue-development` in the list.

### Stack Requirements

- **Vue 3** with Composition API
- **TypeScript**
- **Vite** (build tooling)
- **Vitest** + **Vue Testing Library** (testing)
- **Pinia** (state management)
- **Playwright** (E2E testing)

## How It Works

Once installed, Claude automatically uses this skill when:
- You're creating Vue components
- You're writing composables
- You're setting up Pinia stores
- You ask about Vue best practices
- You're writing tests for Vue components
- You mention TypeScript patterns in Vue

You don't need to explicitly invoke it - Claude decides when to use it based on your request.

## What's Inside

The skill is located in `.claude/skills/vue-development/` and contains:

```
.claude/skills/vue-development/
├── SKILL.md                    # Main skill instructions (Claude reads this)
├── COMPOSITION-EXCELLENCE.md   # Gold standard for component & composable organization
├── COMPONENT-PATTERNS.md       # 13+ component design patterns
├── PATTERNS.md                 # Architectural patterns & feature-based structure
├── STATE-MANAGEMENT.md         # Pinia with Composition API patterns
├── TESTING.md                  # Testing Library best practices
├── TYPESCRIPT.md               # Advanced TypeScript patterns
└── templates/                  # Code templates
    ├── component.template.vue
    ├── composable.template.ts
    ├── store.template.ts
    └── test.template.ts
```

Claude reads these files progressively - starting with SKILL.md and loading other files only when needed.

## Documentation

### Core Documents (For Reference)

These documents are also available in the `docs/` directory for your reference:

1. **[.claude/skills/vue-development/SKILL.md](.claude/skills/vue-development/SKILL.md)** - Overview of all principles and practices
2. **[.claude/skills/vue-development/COMPOSITION-EXCELLENCE.md](.claude/skills/vue-development/COMPOSITION-EXCELLENCE.md)** - **START HERE**: Gold standard for component organization
3. **[.claude/skills/vue-development/COMPONENT-PATTERNS.md](.claude/skills/vue-development/COMPONENT-PATTERNS.md)** - 13+ component design patterns
4. **[.claude/skills/vue-development/PATTERNS.md](.claude/skills/vue-development/PATTERNS.md)** - Architectural patterns and feature-based structure
5. **[.claude/skills/vue-development/STATE-MANAGEMENT.md](.claude/skills/vue-development/STATE-MANAGEMENT.md)** - Deep dive into Pinia with Composition API
6. **[.claude/skills/vue-development/TESTING.md](.claude/skills/vue-development/TESTING.md)** - Testing Library best practices
7. **[.claude/skills/vue-development/TYPESCRIPT.md](.claude/skills/vue-development/TYPESCRIPT.md)** - Advanced TypeScript patterns

### Templates

Ready-to-use code templates in `.claude/skills/vue-development/templates/`:

- **component.template.vue** - Vue component with best practices
- **composable.template.ts** - Composable structure
- **store.template.ts** - Pinia store with Composition API
- **test.template.ts** - Component test structure

## Core Principles

### 0. The Gold Standard Pattern ⭐

**The perfect way to structure Vue components with `<script setup>`:**

See **[COMPOSITION-EXCELLENCE.md](.claude/skills/vue-development/COMPOSITION-EXCELLENCE.md)** for a complete real-world example demonstrating:

- **Organized imports** - External deps → Reusable functions → GraphQL → Utils
- **Inline composables** - Extract focused functions for related state/logic
- **Explicit dependencies** - Pass parameters instead of implicit coupling
- **Progressive extraction** - Move to files only when reused

This document shows a production-grade component that exemplifies perfect organization and demonstrates when to extract composables vs. keeping logic inline.

### 1. Testing-First Mindset

**Always test user behavior, never implementation details.**

```typescript
// ✅ Good - Test what users see and do
it('should display success message when form is submitted', async () => {
  const user = userEvent.setup()
  render(LoginForm)

  await user.type(screen.getByLabelText('Email'), 'test@example.com')
  await user.click(screen.getByRole('button', { name: 'Submit' }))

  expect(screen.getByText('Success!')).toBeInTheDocument()
})

// ❌ Bad - Testing implementation
it('should update email state', () => {
  const wrapper = mount(LoginForm)
  wrapper.vm.email = 'test@example.com'
  expect(wrapper.vm.email).toBe('test@example.com')
})
```

### 2. Functional Core, Imperative Shell

**Separate pure business logic from Vue reactivity.**

```typescript
// Pure logic - NO Vue dependencies
export function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0)
}

// Reactive wrapper
export function useCart() {
  const items = ref<Item[]>([])
  const total = computed(() => calculateTotal(items.value))
  return { items, total }
}
```

### 3. Feature-Based Architecture

Organize by features, not file types:

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── stores/
│   │   └── tests/
│   └── todos/
│       ├── components/
│       ├── composables/
│       └── stores/
└── shared/
    ├── components/
    └── utils/
```

### 4. Composables Best Practices

**Extract composables progressively:**

1. Start inline within component
2. Extract to function if reused within component
3. Move to separate file only if shared across components

**Key patterns:**
- Single Responsibility
- Explicit Error State (return `{ data, error, loading }`)
- No UI Logic (no toast/alert calls)
- Use readonly() to prevent mutations

### 5. State Management

Choose the right tool:

| Scenario | Solution | Complexity |
|----------|----------|-----------|
| Component-local | `ref()` / `reactive()` | Low |
| Shared between components | Composable | Low |
| Global state (CRUD + business logic) | Pinia with Composition API | Medium |
| Server state | pinia-colada / TanStack Query | Medium |

**Key Principles:**
- Each action does ONE thing
- Return `{ data, error }`, never throw
- Store never calls toast/alert - consumer decides
- Use `readonly()` to prevent mutations

## Usage Examples

### Creating a Component

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title: string
  items: Item[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  select: [id: string]
}>()

const selectedId = ref<string | null>(null)
const selectedItem = computed(() =>
  props.items.find(item => item.id === selectedId.value)
)

function handleSelect(id: string) {
  selectedId.value = id
  emit('select', id)
}
</script>

<template>
  <div>
    <h2>{{ title }}</h2>
    <ul>
      <li
        v-for="item in items"
        :key="item.id"
        @click="handleSelect(item.id)"
      >
        {{ item.name }}
      </li>
    </ul>
  </div>
</template>
```

### Creating a Composable

```typescript
// composables/useFetch.ts
export function useFetch<T>(url: string) {
  const data = ref<T | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function execute() {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error('Fetch failed')
      data.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      isLoading.value = false
    }
  }

  return { data: readonly(data), error, isLoading, execute }
}
```

### Creating a Store

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
  const todos = ref<Todo[]>([])
  const isLoading = ref(false)

  // Each action returns { data, error }
  async function fetchTodos() {
    isLoading.value = true
    try {
      const response = await fetch('/api/todos')
      if (!response.ok) {
        return { data: null, error: `Failed to fetch: ${response.statusText}` }
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

  function toggleTodo(id: string) {
    const todo = todos.value.find(t => t.id === id)
    if (!todo) {
      return { data: null, error: 'Todo not found' }
    }
    todo.completed = !todo.completed
    return { data: todo, error: null }
  }

  return {
    todos: readonly(todos),
    isLoading: readonly(isLoading),
    fetchTodos,
    toggleTodo
  }
})

// Component usage
const store = useTodosStore()
const toast = useToast()

async function handleFetch() {
  const { error } = await store.fetchTodos()
  if (error) {
    toast.error(error) // Consumer decides how to show errors
  }
}
```

## Testing Philosophy

**The more your tests resemble user behavior, the more confidence they provide.**

### Key Principles

1. Find elements by role/text, not internals
2. Never access `wrapper.vm` - it's an anti-pattern
3. Use `userEvent` over `fireEvent`
4. Test naming: "should [verb] [expected outcome] when [trigger event]"
5. Prefer real router/store integration over mocking

### Query Priority

1. **Accessible queries** (best):
   - `getByRole`
   - `getByLabelText`
   - `getByPlaceholderText`
   - `getByText`

2. **Semantic queries**:
   - `getByAltText`
   - `getByTitle`

3. **Test IDs** (last resort):
   - `getByTestId`

## Anti-Patterns to Avoid

- ❌ No event buses for state - Use Pinia or composables
- ❌ No testing implementation details - Test user behavior only
- ❌ No throwing from composables - Return explicit error state
- ❌ No UI logic in composables - Keep them UI-agnostic
- ❌ No white box testing - Never access component internals
- ❌ No `as` type assertions - Use type guards
- ❌ No `any` type - Use generics or `unknown`

## When Complexity is Overkill

**Be pragmatic, not dogmatic.**

Use simpler patterns when:
- Single component state → Local `ref()`/`reactive()`
- Shared between few components → Composables
- Server state → TanStack Query or pinia-colada
- Simple cross-component communication → provide/inject

## Project Structure Example

```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.vue
│   │   │   └── LoginForm.test.ts
│   │   ├── composables/
│   │   │   └── useAuth.ts
│   │   ├── stores/
│   │   │   └── authStore.ts
│   │   └── types/
│   │       └── auth.types.ts
│   │
│   └── todos/
│       ├── components/
│       ├── composables/
│       └── stores/
│
├── shared/
│   ├── components/       # Base components
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

## Usage Examples

### Example 1: Creating a Component

Ask Claude:
```
Create a Vue component for a user profile card with name, avatar, and bio
```

Claude will use this skill to create a component following all best practices: TypeScript, proper testing, feature-based organization, etc.

### Example 2: Writing Tests

Ask Claude:
```
Write tests for the LoginForm component
```

Claude will use Testing Library best practices from this skill, testing user behavior rather than implementation details.

### Example 3: Setting Up State Management

Ask Claude:
```
Create a Pinia store for managing a shopping cart
```

Claude will create a Pinia store with Composition API following the skill's pattern: single responsibility, explicit error handling, and no UI logic.

## Sharing with Your Team

To share this skill with your team:

1. **Add to your project**:
   ```bash
   cp -r vue-development-skill/.claude/skills/vue-development ./.claude/skills/vue-development
   ```

2. **Commit to git**:
   ```bash
   git add .claude/skills/vue-development
   git commit -m "Add Vue development skill for the team"
   git push
   ```

3. **Team members get it automatically**:
   When they pull the repository, the skill is immediately available in Claude Code.

## Updating the Skill

If you improve the skill or want to update it:

```bash
# Edit the skill files
code .claude/skills/vue-development/SKILL.md

# Changes take effect next time you restart Claude Code
```

For team skills, commit and push the changes:
```bash
git add .claude/skills/vue-development
git commit -m "Update Vue skill with new patterns"
git push
```

## Troubleshooting

### Claude doesn't use the skill

**Check the description** in `.claude/skills/vue-development/SKILL.md`:
- Make sure it mentions "Vue", "components", "composables", etc.
- The description should be specific enough for Claude to discover when to use it

**Verify installation**:
```bash
# Check if the skill exists
ls .claude/skills/vue-development/SKILL.md

# Or for personal installation
ls ~/.claude/skills/vue-development/SKILL.md
```

**Restart Claude Code** to load the updated skill.

### Skill has errors

**Check YAML frontmatter** in SKILL.md:
- Opening `---` on line 1
- Closing `---` before content
- Valid YAML syntax (no tabs, correct indentation)

**Run Claude Code in debug mode**:
```bash
claude --debug
```

This will show any skill loading errors.

## Contributing

Contributions are welcome! This is a living skill that evolves with Vue.js best practices.

### Areas for Contribution

- Additional templates
- Real-world examples
- Performance optimization patterns
- Accessibility patterns
- Animation patterns
- Error boundary patterns
- Updates for new Vue features

## About Agent Skills

This project follows the **Agent Skills** pattern for Claude Code. Agent Skills are:

- **Model-invoked**: Claude autonomously decides when to use them
- **Discoverable**: Based on description in YAML frontmatter
- **Progressive**: Supporting files loaded only when needed
- **Shareable**: Via git (project skills) or personal installation

Learn more about Agent Skills:
- [Claude Code Agent Skills Documentation](https://docs.claude.com/en/docs/claude-code/agent-skills)
- [Agent Skills Best Practices](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/best-practices)
- [Engineering Blog: Equipping agents with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)

## Resources

### Official Documentation

- [Vue 3 Documentation](https://vuejs.org/)
- [Vue Router](https://router.vuejs.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Vitest](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Playwright](https://playwright.dev/)

### Recommended Libraries

- [VueUse](https://vueuse.org/) - Collection of essential Vue Composition Utilities
- [pinia-colada](https://github.com/posva/pinia-colada) - Data fetching for Pinia
- [TanStack Vue Query](https://tanstack.com/query/latest/docs/vue/overview) - Powerful data synchronization

## License

MIT License - See [LICENSE](LICENSE) file for details

## Credits

This skill is based on battle-tested patterns used in production Vue.js applications, incorporating best practices from:

- Vue.js core team recommendations
- Testing Library philosophy
- Single Responsibility Principle
- Functional programming patterns
- Real-world production experience
- [12 Design Patterns in Vue](https://michaelnthiessen.com/12-design-patterns-vue/) by Michael Thiessen - Component design patterns

---

**Questions or Feedback?** Open an issue or discussion on GitHub!
