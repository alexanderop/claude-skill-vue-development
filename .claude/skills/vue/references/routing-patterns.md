# Vue Router Patterns Reference

## Table of Contents
- [Route Structure](#route-structure)
- [Route Groups](#route-groups)
- [File Naming Patterns](#file-naming-patterns)
- [Route Params Best Practices](#route-params-best-practices)
- [Navigation with Type Safety](#navigation-with-type-safety)
- [Using Route Data in Components](#using-route-data-in-components)
- [definePage() Customization](#definepage-customization)
- [Typed Router Reference](#typed-router-reference)
- [Route Layouts](#route-layouts)
- [Navigation Guards (Per-Route)](#navigation-guards-per-route)
- [Fetch Route Data](#fetch-route-data)

## Route Structure

File-based routing using unplugin-vue-router or similar.

```
✅ CORRECT:
src/pages/
  (home).vue               # Route groups for meaningful names
  users.edit.vue           # Use . for / without nesting
  users.vue                # Layout for users/*
  users/
    (user-list).vue        # Group instead of index.vue
    [userId].vue           # Explicit param names
  posts.[[slug]]+.vue      # Optional repeatable params

❌ WRONG:
src/pages/
  index.vue                # Use groups: (home).vue
  users/
    index.vue              # Use groups: (user-list).vue
    [id].vue               # Too generic: use [userId].vue
```

**Rules:**
- AVOID `index.vue` → use route groups `(descriptive-name).vue`
- Use explicit param names: `[userId]` not `[id]`, `[postSlug]` not `[slug]`
- Use `.` in filenames for `/` without route nesting: `users.edit.vue` → `/users/edit`
- Use `[[param]]` for optional params, `[param]+` for repeatable
- Prefer named routes with typed parameters over string URLs

## Route Groups

Route groups create shared layouts without affecting URLs:

```
src/pages/
├── (admin).vue           # Layout for all admin routes
├── (admin)/
│   ├── dashboard.vue     # URL: /dashboard
│   └── settings.vue      # URL: /settings
└── (user)/
    ├── profile.vue       # URL: /profile
    └── orders.vue        # URL: /orders
```

The `(admin).vue` and `(user).vue` files provide layouts but don't add URL segments.

## File Naming Patterns

```
Pattern                  URL                      Notes
─────────────────────────────────────────────────────────────
(home).vue              /                        Root route with group
about.vue               /about                   Simple route
users.vue               /users                   Layout for nested routes
users/[userId].vue      /users/:userId           Dynamic param
users.edit.vue          /users/edit              Dot creates sibling
posts/[...slug].vue     /posts/*                 Catch-all
settings.[[tab]].vue    /settings/:tab?          Optional param
docs.[[path]]+.vue      /docs/:path+             Repeatable param
```

## Route Params Best Practices

```ts
// ✅ CORRECT: Explicit, semantic param names
pages/
  users/[userId].vue
  posts/[postSlug].vue
  orders/[orderId].vue

// ❌ WRONG: Generic names
pages/
  users/[id].vue         // Which ID? User? Post? Order?
  posts/[slug].vue       // Could be any entity
```

## Navigation with Type Safety

```ts
import { useRouter } from 'vue-router/auto'

const router = useRouter()

// ✅ CORRECT: Named route with typed params
router.push({
  name: '/users/[userId]',
  params: { userId: 123 }
})

// ❌ WRONG: String concatenation (no type safety)
router.push('/users/' + userId)

// ✅ CORRECT: Query params
router.push({
  name: '/search',
  query: { q: 'vue', page: 2 }
})
```

## Using Route Data in Components

```vue
<script setup lang="ts">
import { useRoute } from 'vue-router/auto'

// ✅ CORRECT: Pass route name for strict typing
const route = useRoute('/users/[userId]')

// Now route.params.userId is typed as string
const userId = route.params.userId

// ✅ CORRECT: Access query params
const searchQuery = route.query.q
</script>
```

## definePage() Customization

```vue
<script setup lang="ts">
definePage({
  name: 'UserProfile',
  meta: {
    requiresAuth: true,
    title: 'User Profile'
  },
  alias: ['/profile'],
  redirect: (to) => {
    // Conditional redirect
    if (!to.params.userId) {
      return { name: '/users' }
    }
  }
})
</script>
```

## Typed Router Reference

Always refer to `typed-router.d.ts` for:
- Available route names
- Required/optional params
- Query param types

```ts
// typed-router.d.ts is auto-generated
// Check it for available routes and their params
```

## Route Layouts

```
src/pages/
├── users.vue              # Parent layout
└── users/
    ├── (list).vue         # Renders inside users.vue
    └── [userId]/
        ├── (details).vue  # Renders inside users.vue
        └── edit.vue       # Renders inside users.vue
```

`users.vue` contains `<RouterView />` for nested routes.

## Navigation Guards (Per-Route)

```vue
<script setup lang="ts">
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

onBeforeRouteLeave((to, from) => {
  if (hasUnsavedChanges.value) {
    const answer = window.confirm('Discard unsaved changes?')
    if (!answer) return false
  }
})

onBeforeRouteUpdate(async (to, from) => {
  // Called when route params change but same component reused
  if (to.params.userId !== from.params.userId) {
    await loadUser(to.params.userId)
  }
})
</script>
```

## Fetch Route Data

For up-to-date routing documentation with unplugin-vue-router:
<https://uvr.esm.is/llms.txt>

Follow links in that file for:
- Advanced route patterns
- Type-safe navigation
- Meta fields
- Route guards
