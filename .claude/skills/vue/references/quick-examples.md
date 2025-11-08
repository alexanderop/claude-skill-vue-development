# Quick Examples - Vue Patterns

## Props Definition

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

## Emits Definition

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

## V-Model

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

## Testing

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

## Route Params - Why Explicit Names Matter

### The Problem with Generic [id]

```typescript
// ❌ WRONG: Generic [id] loses type safety
// File: pages/users/[id].vue
// File: pages/posts/[id].vue

// Both routes use generic "id" param:
router.push({
  name: '/users/[id]',
  params: { id: postId }  // BUG! Using post ID for user route
})

router.push({
  name: '/posts/[id]',
  params: { id: userId }  // BUG! Using user ID for post route
})

// TypeScript can't catch these bugs because both expect "id"
```

### The Solution with Explicit Names

```typescript
// ✅ CORRECT: Explicit names enable type safety
// File: pages/users/[userId].vue
// File: pages/posts/[postId].vue

router.push({
  name: '/users/[userId]',
  params: { userId: postId }  // ❌ TypeScript ERROR! Wrong type
})

router.push({
  name: '/posts/[postId]',
  params: { postId: userId }  // ❌ TypeScript ERROR! Wrong type
})

// ✅ CORRECT usage:
router.push({
  name: '/users/[userId]',
  params: { userId: '123' }  // ✅ TypeScript knows this is correct
})
```

**Result:** Explicit param names catch bugs at compile-time, not runtime.

## Composables - NO UI Logic

```typescript
// ❌ WRONG: UI logic in composable
export function useDataFetcher() {
  try {
    data.value = await fetch(...)
    showToast('Success!')  // ❌ NO! UI logic in composable
  } catch (e) {
    showToast('Error!')    // ❌ NO! UI logic in composable
    console.error(e)        // ❌ Swallowing errors
  }
}

// ✅ CORRECT: Expose state, component handles UI
export function useDataFetcher() {
  try {
    data.value = await fetch(...)
    status.value = 'success'  // ✅ YES - expose state
  } catch (e) {
    error.value = e           // ✅ YES - expose error
    status.value = 'error'    // ✅ YES - expose state
  }

  return { data, error, status }
}

// Component (UI layer):
const { data, error, status } = useDataFetcher()

watch(status, (s) => {
  if (s === 'success') showToast('Success!')  // ✅ UI in component
  if (s === 'error') showToast(`Error: ${error.value?.message}`)
})
```

**Why separation matters:**
- ✅ Composable is testable without mocking UI
- ✅ Different components can use different UI (toast, modal, inline error)
- ✅ Composable works in non-UI contexts (background tasks, SSR)
- ✅ Follows separation of concerns
