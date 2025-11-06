# TypeScript Patterns

> **For Claude Code:**
> - **When to load:** User asks about TypeScript, types, discriminated unions, generics, or type safety
> - **Quick scan:** Read only "Discriminated Unions for Props" and "Common Pitfalls" sections
> - **Deep dive:** Load full file when implementing complex type patterns or debugging type errors
> - **Always cite:** Reference specific pattern (e.g., "Discriminated Union pattern" or "Type Guards")
> - **Quick templates:** For copy-paste type code, direct user to [QUICK-LOOKUP.md](QUICK-LOOKUP.md)

Advanced TypeScript patterns for Vue applications.

## Core Principles

1. **Strong type safety** - Leverage TypeScript's type system fully
2. **Discriminated unions** - For variant props and states
3. **Avoid `as` assertions** - They bypass type checking
4. **Generic components** - When prop types are interdependent
5. **Extract utility types** - For reusable transformations

---

## Discriminated Unions for Props

**Use discriminated unions to prevent invalid prop combinations.**

### Basic Pattern

```typescript
// ❌ Problem: Can mix incompatible props
interface Props {
  variant: 'success' | 'error'
  message?: string
  errorCode?: string
}

// User could pass: variant="success" errorCode="500" (invalid!)
```

```typescript
// ✅ Solution: Discriminated union
type BaseProps = {
  title: string
}

type SuccessProps = BaseProps & {
  variant: 'success'
  message: string
  errorCode?: never  // Prevents errorCode with success
}

type ErrorProps = BaseProps & {
  variant: 'error'
  errorCode: string
  message?: never  // Prevents message with error
}

type Props = SuccessProps | ErrorProps
```

### Component Implementation

```vue
<!-- Alert.vue -->
<script setup lang="ts">
type BaseProps = {
  title: string
}

type SuccessProps = BaseProps & {
  variant: 'success'
  message: string
  errorCode?: never
}

type ErrorProps = BaseProps & {
  variant: 'error'
  errorCode: string
  message?: never
}

type Props = SuccessProps | ErrorProps

const props = defineProps<Props>()

// TypeScript narrows type based on variant
function getDisplayMessage() {
  if (props.variant === 'success') {
    return props.message  // ✓ TypeScript knows message exists
  } else {
    return `Error ${props.errorCode}`  // ✓ TypeScript knows errorCode exists
  }
}
</script>

<template>
  <div :class="`alert alert-${variant}`">
    <h3>{{ title }}</h3>
    <p>{{ getDisplayMessage() }}</p>
  </div>
</template>
```

### Usage

```vue
<template>
  <!-- ✓ Valid -->
  <Alert variant="success" title="Done" message="Saved successfully" />

  <!-- ✓ Valid -->
  <Alert variant="error" title="Failed" errorCode="500" />

  <!-- ✗ TypeScript error: Can't mix message and errorCode -->
  <Alert variant="success" title="Done" errorCode="500" />
</template>
```

---

## Generic Components

**Use generics when prop types depend on each other.**

### Example: Type-Safe List Component

```vue
<!-- List.vue -->
<script setup lang="ts" generic="T">
interface Props {
  items: T[]
  keyFn: (item: T) => string | number
  renderItem: (item: T) => string
}

const props = defineProps<Props>()
</script>

<template>
  <ul>
    <li v-for="item in items" :key="keyFn(item)">
      {{ renderItem(item) }}
    </li>
  </ul>
</template>
```

### Usage

```vue
<script setup lang="ts">
interface User {
  id: number
  name: string
}

const users: User[] = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]
</script>

<template>
  <!-- TypeScript infers T = User -->
  <List
    :items="users"
    :keyFn="(user) => user.id"
    :renderItem="(user) => user.name"
  />
</template>
```

### Generic with Constraints

```vue
<script setup lang="ts" generic="T extends { id: string | number }">
interface Props {
  items: T[]
}

const props = defineProps<Props>()

// Can safely access id since T extends { id: ... }
function getKey(item: T) {
  return item.id
}
</script>
```

---

## Utility Types

### Extract Utility Types

```typescript
// types/utils.ts

// Make all properties required and non-nullable
export type RequiredNotNull<T> = {
  [P in keyof T]-?: NonNullable<T[P]>
}

// Pick and make optional
export type PartialPick<T, K extends keyof T> = Partial<Pick<T, K>>

// Omit and make required
export type RequiredOmit<T, K extends keyof T> = Required<Omit<T, K>>

// Deep partial (all nested properties optional)
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

// Extract function return type
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : never
```

### Usage

```typescript
import type { RequiredNotNull, PartialPick } from '@/types/utils'

interface User {
  id: number
  name: string
  email?: string
  avatar?: string
}

// All properties required and non-null
type CompleteUser = RequiredNotNull<User>
// { id: number; name: string; email: string; avatar: string }

// Pick specific fields and make optional
type UserUpdate = PartialPick<User, 'name' | 'email'>
// { name?: string; email?: string }
```

---

## Type Guards

### Custom Type Guards

```typescript
// types/guards.ts

export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function isError(error: unknown): error is Error {
  return error instanceof Error
}

// Type guard for discriminated unions
export function isSuccessResult<T>(
  result: SuccessResult<T> | ErrorResult
): result is SuccessResult<T> {
  return result.status === 'success'
}
```

### Usage

```typescript
const value: string | null = getUserInput()

// ❌ TypeScript error
console.log(value.toUpperCase())

// ✅ Type narrowed to string
if (isDefined(value)) {
  console.log(value.toUpperCase())
}

// Filter with type guard
const values: (string | null)[] = ['a', null, 'b']
const strings: string[] = values.filter(isDefined)
```

---

## Composables with TypeScript

### Typed Composable

```typescript
// composables/useFetch.ts
import { ref, type Ref } from 'vue'

interface UseFetchReturn<T> {
  data: Ref<T | null>
  error: Ref<Error | null>
  isLoading: Ref<boolean>
  execute: () => Promise<void>
}

export function useFetch<T>(url: string): UseFetchReturn<T> {
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

  return { data, error, isLoading, execute }
}
```

### Usage

```vue
<script setup lang="ts">
import { useFetch } from '@/composables/useFetch'

interface User {
  id: number
  name: string
}

// TypeScript infers data as Ref<User | null>
const { data, error, isLoading, execute } = useFetch<User>('/api/user')

onMounted(() => execute())
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="error">{{ error.message }}</div>
  <!-- data is correctly typed as User | null -->
  <div v-else-if="data">{{ data.name }}</div>
</template>
```

---

## Store Types

### Pinia Store with TypeScript

```typescript
// stores/users/usersModel.ts
export interface User {
  id: string
  name: string
  email: string
}

export interface UsersModel {
  users: User[]
  selectedUserId: string | null
  isLoading: boolean
  error: string | null
}

export type UsersMessage =
  | { type: 'USERS_LOADED'; users: User[] }
  | { type: 'USER_SELECTED'; id: string }
  | { type: 'USER_DESELECTED' }
  | { type: 'LOADING_START' }
  | { type: 'LOADING_ERROR'; error: string }

export function initialModel(): UsersModel {
  return {
    users: [],
    selectedUserId: null,
    isLoading: false,
    error: null
  }
}
```

```typescript
// stores/users/usersUpdate.ts
import type { UsersModel, UsersMessage } from './usersModel'

export function update(
  model: UsersModel,
  message: UsersMessage
): UsersModel {
  switch (message.type) {
    case 'USERS_LOADED':
      return {
        ...model,
        users: message.users,
        isLoading: false
      }

    case 'USER_SELECTED':
      return {
        ...model,
        selectedUserId: message.id
      }

    case 'USER_DESELECTED':
      return {
        ...model,
        selectedUserId: null
      }

    case 'LOADING_START':
      return {
        ...model,
        isLoading: true,
        error: null
      }

    case 'LOADING_ERROR':
      return {
        ...model,
        isLoading: false,
        error: message.error
      }

    default:
      // Exhaustiveness check - ensures all messages handled
      const _exhaustive: never = message
      return model
  }
}
```

---

## Event Types

### Typed Component Events

```vue
<!-- Form.vue -->
<script setup lang="ts">
interface FormData {
  email: string
  password: string
}

// Define emits with types
const emit = defineEmits<{
  submit: [data: FormData]
  cancel: []
  error: [message: string]
}>()

function handleSubmit() {
  emit('submit', { email: 'test@example.com', password: '123' })
}
</script>
```

### Usage

```vue
<script setup lang="ts">
interface FormData {
  email: string
  password: string
}

function onSubmit(data: FormData) {
  // data is correctly typed
  console.log(data.email)
}
</script>

<template>
  <Form
    @submit="onSubmit"
    @cancel="() => console.log('Cancelled')"
    @error="(msg) => console.error(msg)"
  />
</template>
```

---

## Advanced Patterns

### Branded Types

Prevent accidental mixing of similar primitive types:

```typescript
// types/branded.ts
type Brand<K, T> = K & { __brand: T }

export type UserId = Brand<string, 'UserId'>
export type PostId = Brand<string, 'PostId'>

export function createUserId(id: string): UserId {
  return id as UserId
}

export function createPostId(id: string): PostId {
  return id as PostId
}
```

```typescript
// Usage
function getUser(id: UserId) {
  // ...
}

function getPost(id: PostId) {
  // ...
}

const userId = createUserId('user-123')
const postId = createPostId('post-456')

getUser(userId)  // ✓ OK
getUser(postId)  // ✗ TypeScript error - wrong brand!

// ✗ Can't accidentally pass raw string
getUser('user-123')  // TypeScript error
```

### Template Literal Types

```typescript
// types/routes.ts
type RoutePrefix = '/api' | '/admin'
type RouteAction = 'users' | 'posts' | 'comments'

type ApiRoute = `${RoutePrefix}/${RouteAction}`
// '/api/users' | '/api/posts' | '/api/comments' |
// '/admin/users' | '/admin/posts' | '/admin/comments'

function navigateTo(route: ApiRoute) {
  // Only accepts valid combinations
}

navigateTo('/api/users')  // ✓ OK
navigateTo('/api/invalid')  // ✗ TypeScript error
```

### Const Assertions

```typescript
// ❌ Without const assertion
const routes = {
  home: '/',
  about: '/about'
}
// Type: { home: string; about: string }

// ✅ With const assertion
const routes = {
  home: '/',
  about: '/about'
} as const
// Type: { readonly home: '/'; readonly about: '/about' }

// Extract literal types
type RoutePath = typeof routes[keyof typeof routes]
// Type: '/' | '/about'
```

---

## Type-Safe Environment Variables

```typescript
// types/env.d.ts
interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_API_KEY: string
  readonly VITE_ENABLE_ANALYTICS: 'true' | 'false'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

```typescript
// config/env.ts
export const config = {
  apiUrl: import.meta.env.VITE_API_URL,
  apiKey: import.meta.env.VITE_API_KEY,
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true'
} as const

// TypeScript ensures these are defined and correct type
```

---

## Testing Types

### Test Type Utilities

```typescript
// types/test-utils.ts
import { expectTypeOf } from 'vitest'

// Verify function return type
expectTypeOf<ReturnType<typeof myFunction>>().toEqualTypeOf<ExpectedType>()

// Verify parameter types
expectTypeOf<Parameters<typeof myFunction>>().toEqualTypeOf<[string, number]>()

// Verify object shape
expectTypeOf<MyType>().toMatchTypeOf<{ id: string }>()
```

### Example

```typescript
// useFetch.test.ts
import { expectTypeOf } from 'vitest'
import { useFetch } from './useFetch'

describe('useFetch types', () => {
  it('should return correct types', () => {
    const result = useFetch<{ name: string }>('/api/user')

    expectTypeOf(result.data).toEqualTypeOf<Ref<{ name: string } | null>>()
    expectTypeOf(result.error).toEqualTypeOf<Ref<Error | null>>()
    expectTypeOf(result.isLoading).toEqualTypeOf<Ref<boolean>>()
    expectTypeOf(result.execute).toBeFunction()
  })
})
```

---

## Common Pitfalls

### ❌ Using `as` Assertions

```typescript
// ❌ Bad - Bypasses type checking
const user = data as User

// ✅ Good - Type guard
function isUser(data: unknown): data is User {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data &&
    'name' in data
  )
}

if (isUser(data)) {
  // data is User
}
```

### ❌ Any Type

```typescript
// ❌ Bad - Loses type safety
function processData(data: any) {
  return data.name.toUpperCase()  // No type checking!
}

// ✅ Good - Use generic or unknown
function processData<T extends { name: string }>(data: T) {
  return data.name.toUpperCase()
}

// Or with unknown + type guard
function processData(data: unknown) {
  if (isUser(data)) {
    return data.name.toUpperCase()
  }
  throw new Error('Invalid data')
}
```

### ❌ Non-Null Assertions

```typescript
// ❌ Bad - Can cause runtime errors
const user = users.find(u => u.id === id)!
console.log(user.name)  // Might crash if user is undefined!

// ✅ Good - Handle null case
const user = users.find(u => u.id === id)
if (!user) throw new Error('User not found')
console.log(user.name)
```

---

## Best Practices

### 1. Prefer Type Inference

```typescript
// ❌ Redundant type annotation
const count: number = ref<number>(0)

// ✅ Let TypeScript infer
const count = ref(0)
```

### 2. Use Discriminated Unions

```typescript
// For variant props, loading states, result types
type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error }
```

### 3. Avoid Optional Chaining Abuse

```typescript
// ❌ Masking potential bugs
const name = user?.profile?.name ?? 'Unknown'

// ✅ Explicit null handling
if (!user) throw new Error('User required')
if (!user.profile) throw new Error('Profile required')
const name = user.profile.name
```

### 4. Use Const Assertions

```typescript
// For literal types and readonly
const config = {
  api: 'https://api.example.com',
  timeout: 5000
} as const
```

---

## Summary

### Key Patterns

| Pattern | Use Case |
|---------|----------|
| Discriminated unions | Variant props, state machines |
| Generic components | Type-dependent props |
| Type guards | Runtime type checking |
| Utility types | Reusable type transformations |
| Branded types | Prevent primitive mixing |
| Template literals | Type-safe string combinations |

### Type Safety Checklist

✅ Use discriminated unions for variant props
✅ Avoid `as` assertions and `any`
✅ Create type guards for runtime checks
✅ Extract utility types for reusability
✅ Use generics for flexible, type-safe code
✅ Leverage TypeScript's inference
✅ Handle null/undefined explicitly
✅ Test types with expectTypeOf

**Strong types catch bugs at compile time, not runtime.**
