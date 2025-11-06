# Usage Guide

This guide shows practical examples of how the Vue Development Skill works with Claude Code.

## How the Skill Works

Once installed, Claude **automatically** uses this skill when you:
- Create Vue components
- Write composables
- Set up Pinia stores
- Write tests for Vue code
- Ask about Vue best practices
- Review Vue code

You don't need to explicitly invoke it - just work with Vue naturally!

## Practical Examples

### Example 1: Creating a Component

**You ask:**
```
Create a Vue component for displaying a user profile card with avatar, name, email, and bio
```

**Claude will:**
1. Use the `component.template.vue` as a reference
2. Follow TypeScript best practices
3. Apply proper prop typing with discriminated unions if needed
4. Use Composition API with `<script setup lang="ts">`
5. Follow naming conventions (e.g., `UserProfileCard.vue`)

**Result:**
```vue
<script setup lang="ts">
interface Props {
  name: string
  email: string
  bio: string
  avatarUrl?: string
}

const props = defineProps<Props>()
</script>

<template>
  <div class="user-profile-card">
    <img v-if="avatarUrl" :src="avatarUrl" :alt="name" />
    <h2>{{ name }}</h2>
    <p class="email">{{ email }}</p>
    <p class="bio">{{ bio }}</p>
  </div>
</template>
```

### Example 2: Creating a Composable

**You ask:**
```
Create a composable for fetching and managing user data from an API
```

**Claude will:**
1. Use the functional core, imperative shell pattern
2. Return explicit error state (no throwing)
3. Use readonly() to prevent mutations
4. Follow the composable structure from templates
5. Keep it UI-agnostic (no toast/alert calls)

**Result:**
```typescript
// composables/useUser.ts
import { ref, readonly } from 'vue'

interface User {
  id: string
  name: string
  email: string
}

export function useUser(userId: string) {
  const user = ref<User | null>(null)
  const error = ref<Error | null>(null)
  const isLoading = ref(false)

  async function fetchUser() {
    isLoading.value = true
    error.value = null

    try {
      const response = await fetch(`/api/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      user.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
    } finally {
      isLoading.value = false
    }
  }

  return {
    user: readonly(user),
    error,
    isLoading,
    fetchUser
  }
}
```

### Example 3: Writing Tests

**You ask:**
```
Write tests for the LoginForm component
```

**Claude will:**
1. Use Testing Library (never wrapper.vm)
2. Find elements by role/text
3. Test user behavior, not implementation
4. Use userEvent for interactions
5. Follow test naming convention

**Result:**
```typescript
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import LoginForm from './LoginForm.vue'

describe('LoginForm', () => {
  it('should display success message when valid credentials are submitted', async () => {
    const user = userEvent.setup()
    render(LoginForm)

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByText('Login successful!')).toBeInTheDocument()
  })

  it('should display error message when credentials are invalid', async () => {
    const user = userEvent.setup()
    render(LoginForm)

    await user.type(screen.getByLabelText('Email'), 'invalid@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: 'Login' }))

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument()
  })
})
```

### Example 4: Setting Up State Management

**You ask:**
```
Create a Pinia store for managing a shopping cart with validation
```

**Claude will:**
1. Use Pinia with Composition API
2. Each action returns `{ data, error }`
3. Store never handles UI (no toast/alert)
4. Use readonly() to prevent mutations
5. Separate pure validation logic from store

**Result:**

```typescript
// stores/cart.ts
import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])

  const total = computed(() =>
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )

  function addItem(item: CartItem) {
    const existing = items.value.find(i => i.id === item.id)

    if (existing) {
      existing.quantity += item.quantity
      return { data: existing, error: null }
    }

    items.value.push(item)
    return { data: item, error: null }
  }

  function updateQuantity(id: string, quantity: number) {
    if (quantity <= 0) {
      return { data: null, error: 'Quantity must be greater than 0' }
    }

    const item = items.value.find(i => i.id === id)
    if (!item) {
      return { data: null, error: 'Item not found' }
    }

    item.quantity = quantity
    return { data: item, error: null }
  }

  function removeItem(id: string) {
    const index = items.value.findIndex(i => i.id === id)
    if (index === -1) {
      return { data: null, error: 'Item not found' }
    }

    items.value.splice(index, 1)
    return { data: undefined, error: null }
  }

  return {
    items: readonly(items),
    total,
    addItem,
    updateQuantity,
    removeItem
  }
})

// Component usage
const cart = useCartStore()
const toast = useToast()

function handleUpdateQuantity(id: string, quantity: number) {
  const { error } = cart.updateQuantity(id, quantity)
  if (error) {
    toast.error(error) // Consumer handles error presentation
  }
}
```

### Example 5: Code Review

**You ask:**
```
Review this Vue component for best practices:

<script>
export default {
  data() {
    return {
      items: []
    }
  },
  methods: {
    async loadItems() {
      this.items = await fetch('/api/items').then(r => r.json())
    }
  }
}
</script>
```

**Claude will:**
1. Identify anti-patterns (Options API, no TypeScript, no error handling)
2. Suggest improvements based on skill guidelines
3. Recommend using Composition API
4. Add proper error handling
5. Suggest Testing Library tests

**Response:**
```
This component has several issues based on Vue best practices:

1. **Using Options API**: Should use Composition API with <script setup lang="ts">
2. **No TypeScript**: Missing type safety
3. **No error handling**: fetch can fail
4. **No loading state**: Users don't know when data is loading
5. **Direct mutation**: Should use explicit error state pattern

Here's the improved version:

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Item {
  id: string
  name: string
}

const items = ref<Item[]>([])
const error = ref<Error | null>(null)
const isLoading = ref(false)

async function loadItems() {
  isLoading.value = true
  error.value = null

  try {
    const response = await fetch('/api/items')
    if (!response.ok) throw new Error('Failed to load items')
    items.value = await response.json()
  } catch (err) {
    error.value = err instanceof Error ? err : new Error('Unknown error')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadItems()
})
</script>

<template>
  <div>
    <div v-if="isLoading">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <ul v-else>
      <li v-for="item in items" :key="item.id">{{ item.name }}</li>
    </ul>
  </div>
</template>
```

## Tips for Using the Skill

### Be Specific in Your Requests

**Instead of:**
```
Create a form
```

**Try:**
```
Create a Vue component for a user registration form with email, password, and validation
```

### Mention Key Terms

The skill activates when you mention:
- "Vue component"
- "composable"
- "Pinia store"
- "Vue test"
- "TypeScript" (in Vue context)
- Feature-based architecture
- State management

### Ask for Explanations

```
Explain when to use Pinia vs composables for state management
```

```
What's the difference between functional core and imperative shell in Vue?
```

### Request Refactoring

```
Refactor this component to use the composables pattern
```

```
Convert this store to return result/error instead of throwing
```

## Common Workflows

### Starting a New Feature

```
I'm building a new blog feature. Set up the feature-based folder structure and create the initial components for listing and viewing blog posts.
```

Claude will:
- Create feature-based folder structure
- Set up components with TypeScript
- Create tests
- Suggest composables for data fetching
- Follow all best practices from the skill

### Adding Tests to Existing Code

```
Add comprehensive tests for the UserProfileCard component using Testing Library
```

Claude will:
- Use Testing Library queries (getByRole, getByText)
- Test user behavior, not implementation
- Follow proper test naming conventions
- Include edge cases

### Setting Up State Management

```
I need state management for a todo app with filtering and sorting. What approach should I use?
```

Claude will:
- Analyze the complexity
- Recommend appropriate pattern (Pinia with Composition API or composables)
- Provide implementation following the skill's templates
- Each action returns `{ data, error }` for explicit error handling

## What the Skill Doesn't Do

The skill provides **guidance and best practices**, but:
- ❌ Doesn't automatically create files (you still need to ask Claude to create them)
- ❌ Doesn't enforce strict rules (Claude uses judgment based on context)
- ❌ Doesn't prevent you from choosing simpler patterns when appropriate
- ✅ Works best when you provide context about your specific needs

## Next Steps

- Read [README.md](README.md) for comprehensive documentation
- Check [INSTALL.md](INSTALL.md) for installation details
- Browse [templates](.claude/skills/vue-development/templates/) for code examples
- Read the detailed guides in `.claude/skills/vue-development/`

---

**Start using the skill now!** Just ask Claude to help you build a Vue component.
