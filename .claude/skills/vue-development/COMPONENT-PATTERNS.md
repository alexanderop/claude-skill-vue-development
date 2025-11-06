# Component Design Patterns

Design patterns provide proven solutions to common problems in Vue applications. These patterns help you write maintainable, testable, and scalable components.

## Core Component Patterns

### 1. Humble Components Pattern

**Problem:** Components become bloated with business logic, making them hard to test and reuse.

**Solution:** Keep components focused on presentation and user input. Move business logic to composables or pure functions.

**Key Principle:** "Props down, events up"

```vue
<!-- ✅ Good: Humble Component -->
<template>
  <div class="user-card">
    <img :src="userData.image" alt="User Image" />
    <div class="user-info">
      <h2>{{ userData.name }}</h2>
      <p>{{ userData.bio }}</p>
    </div>
    <button @click="$emit('edit-profile')" class="btn-primary">
      Edit Profile
    </button>
  </div>
</template>

<script setup lang="ts">
interface UserData {
  image: string
  name: string
  bio: string
}

defineProps<{
  userData: UserData
}>()

defineEmits<{
  'edit-profile': []
}>()
</script>
```

```vue
<!-- ❌ Bad: Business logic in component -->
<template>
  <div class="user-card">
    <img :src="userData.image" alt="User Image" />
    <div class="user-info">
      <h2>{{ userData.name }}</h2>
      <p>{{ userData.bio }}</p>
    </div>
    <button @click="handleEdit" class="btn-primary">
      Edit Profile
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleEdit = async () => {
  // ❌ Business logic in component
  if (!authStore.isAuthenticated) {
    await router.push('/login')
    return
  }

  try {
    await validateProfile()
    await router.push(`/profile/edit/${userData.id}`)
  } catch (error) {
    showToast('Error loading profile')
  }
}
</script>
```

**When to use:**
- Leaf components (no or few children)
- Presentational components
- Components you want to reuse across different contexts

---

### 2. Controller Components

**Problem:** Need to orchestrate multiple composables and manage complex component interactions.

**Solution:** Create a controller component that manages state and delegates rendering to humble components.

```vue
<!-- TaskController.vue -->
<script setup lang="ts">
import { useTasks } from '@/features/tasks/composables/useTasks'
import { useTaskFilters } from '@/features/tasks/composables/useTaskFilters'
import TaskInput from './TaskInput.vue'
import TaskList from './TaskList.vue'
import TaskFilters from './TaskFilters.vue'

// Controller orchestrates multiple composables
const { tasks, addTask, removeTask, updateTask, loading, error } = useTasks()
const { filteredTasks, activeFilter, setFilter } = useTaskFilters(tasks)
</script>

<template>
  <div class="task-controller">
    <TaskInput @add-task="addTask" />
    <TaskFilters
      :active-filter="activeFilter"
      @filter-change="setFilter"
    />
    <TaskList
      v-if="!loading"
      :tasks="filteredTasks"
      @remove-task="removeTask"
      @update-task="updateTask"
    />
    <LoadingSpinner v-else />
    <ErrorMessage v-if="error" :error="error" />
  </div>
</template>
```

**When to use:**
- Managing multiple child components
- Coordinating several composables
- Complex state orchestration
- Feature entry points

---

### 3. Extract Conditional Pattern

**Problem:** Templates with multiple complex conditional branches become hard to read.

**Solution:** Extract each conditional branch into its own component with a descriptive name.

```vue
<!-- ❌ Before: Complex nested conditionals -->
<template>
  <div>
    <div v-if="isLoading">
      <div class="spinner"></div>
      <p>Loading your data...</p>
      <button @click="cancelLoad">Cancel</button>
    </div>
    <div v-else-if="error">
      <div class="error-icon">⚠️</div>
      <h2>{{ error.title }}</h2>
      <p>{{ error.message }}</p>
      <button @click="retry">Retry</button>
      <button @click="goBack">Go Back</button>
    </div>
    <div v-else>
      <!-- 50+ lines of success state UI -->
    </div>
  </div>
</template>

<!-- ✅ After: Clear, self-documenting -->
<template>
  <LoadingState v-if="isLoading" @cancel="cancelLoad" />
  <ErrorState v-else-if="error" :error="error" @retry="retry" />
  <SuccessState v-else :data="data" />
</template>
```

**Benefits:**
- Self-documenting code (component names explain what they show)
- Easier to test each state independently
- Simpler to modify one state without affecting others

---

### 4. List Component Pattern

**Problem:** Large `v-for` loops clutter parent components and mix concerns.

**Solution:** Extract the list rendering logic into a dedicated list component.

```vue
<!-- ❌ Before: Direct v-for in parent -->
<template>
  <div class="products">
    <div
      v-for="product in products"
      :key="product.id"
      class="product-card"
    >
      <img :src="product.image" :alt="product.name" />
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <div class="price">{{ formatPrice(product.price) }}</div>
      <button @click="addToCart(product)">Add to Cart</button>
      <button @click="viewDetails(product)">Details</button>
    </div>
  </div>
</template>

<!-- ✅ After: Abstracted into list component -->
<template>
  <ProductList
    :products="products"
    @add-to-cart="addToCart"
    @view-details="viewDetails"
  />
</template>
```

```vue
<!-- ProductList.vue -->
<template>
  <div class="products">
    <ProductCard
      v-for="product in products"
      :key="product.id"
      :product="product"
      @add-to-cart="$emit('add-to-cart', $event)"
      @view-details="$emit('view-details', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import type { Product } from '@/types'

defineProps<{
  products: Product[]
}>()

defineEmits<{
  'add-to-cart': [product: Product]
  'view-details': [product: Product]
}>()
</script>
```

---

### 5. Strategy Pattern

**Problem:** Complex conditional logic for rendering different components based on runtime conditions.

**Solution:** Use dynamic components with computed component selection.

```vue
<template>
  <component :is="currentView" v-bind="viewProps" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import GridView from './GridView.vue'
import ListView from './ListView.vue'
import TableView from './TableView.vue'
import MapView from './MapView.vue'

const props = defineProps<{
  viewMode: 'grid' | 'list' | 'table' | 'map'
  data: any[]
}>()

// Strategy pattern: Select component based on mode
const viewComponents = {
  grid: GridView,
  list: ListView,
  table: TableView,
  map: MapView,
} as const

const currentView = computed(() => {
  return viewComponents[props.viewMode]
})

const viewProps = computed(() => ({
  items: props.data,
}))
</script>
```

**Advanced: With factory functions**

```typescript
// viewStrategyFactory.ts
import type { Component } from 'vue'

interface ViewStrategy {
  component: Component
  transform: (data: any[]) => any
}

export function createViewStrategy(
  viewMode: string,
  data: any[]
): ViewStrategy {
  const strategies: Record<string, ViewStrategy> = {
    grid: {
      component: GridView,
      transform: (data) => data.slice(0, 12), // Paginate
    },
    list: {
      component: ListView,
      transform: (data) => data, // No transform
    },
    map: {
      component: MapView,
      transform: (data) =>
        data.filter(item => item.coordinates), // Only items with location
    },
  }

  return strategies[viewMode] || strategies.list
}
```

---

### 6. Preserve Object Pattern

**Problem:** Too many individual props make components brittle and verbose.

**Solution:** Pass the entire object when components are tightly coupled to a specific domain.

```vue
<!-- ✅ Good: Domain-specific component -->
<template>
  <CustomerDisplay :customer="activeCustomer" />
</template>

<!-- CustomerDisplay.vue -->
<script setup lang="ts">
import type { Customer } from '@/types'

defineProps<{
  customer: Customer
}>()
</script>

<template>
  <div class="customer-card">
    <h2>{{ customer.name }}</h2>
    <p>{{ customer.email }}</p>
    <p>{{ customer.phone }}</p>
    <p>{{ customer.address }}</p>
    <!-- Easy to add more customer fields without prop drilling -->
  </div>
</template>
```

```vue
<!-- ❌ Bad: Generic component with object prop -->
<template>
  <!-- This creates hidden dependencies on object structure -->
  <GenericCard :data="customer" />
</template>
```

**When to use:**
- Domain-specific components (not generic/reusable ones)
- Tightly coupled to a specific data model
- Frequently adding/removing fields

**When NOT to use:**
- Generic, reusable components
- Components in shared/component library
- When you need explicit prop validation

---

### 7. Hidden Components Pattern

**Problem:** A component accepts many props, but different subsets are always used together.

**Solution:** Split into multiple focused components based on actual usage patterns.

```vue
<!-- ❌ Before: Kitchen sink component -->
<template>
  <!-- Used as a chart -->
  <DataDisplay
    :chart-data="data"
    :chart-type="'bar'"
    :chart-options="chartOptions"
  />

  <!-- Used as a table -->
  <DataDisplay
    :table-data="data"
    :table-columns="columns"
    :table-sortable="true"
  />

  <!-- Used as a card grid -->
  <DataDisplay
    :card-data="data"
    :card-layout="'grid'"
    :cards-per-row="3"
  />
</template>

<!-- ✅ After: Separate focused components -->
<template>
  <ChartDisplay
    :data="data"
    :type="'bar'"
    :options="chartOptions"
  />

  <TableDisplay
    :data="data"
    :columns="columns"
    :sortable="true"
  />

  <CardGrid
    :data="data"
    :per-row="3"
  />
</template>
```

**How to identify hidden components:**
- Props are always used in specific groups
- You never use prop A and prop B together
- The component name is generic but usage is specific

---

### 8. Long Components Principle

**Problem:** When is a component "too long"?

**Answer:** When it becomes hard to understand.

**Solution:** Break down into smaller, self-documenting components.

```vue
<!-- ❌ Before: 300+ line component -->
<template>
  <div class="profile-page">
    <!-- 50 lines of header HTML -->
    <div class="profile-header">...</div>

    <!-- 80 lines of stats section -->
    <div class="profile-stats">...</div>

    <!-- 100 lines of activity feed -->
    <div class="activity-feed">...</div>

    <!-- 70 lines of settings panel -->
    <div class="settings-panel">...</div>
  </div>
</template>

<!-- ✅ After: Self-documenting structure -->
<template>
  <div class="profile-page">
    <ProfileHeader :user="user" />
    <ProfileStats :stats="userStats" />
    <ActivityFeed :activities="recentActivities" />
    <SettingsPanel :settings="userSettings" />
  </div>
</template>
```

**Benefits:**
- Component names document what the code does
- Easier to navigate and modify
- Each component can be tested independently
- Clearer responsibilities

---

## Advanced Patterns

### 9. Thin Composables Pattern

**Problem:** Composables mix business logic with Vue reactivity, making logic hard to test.

**Solution:** Separate pure business logic from reactivity management.

```typescript
// ❌ Before: Mixed concerns
export function useTemperatureConverter() {
  const celsius = ref(0)
  const fahrenheit = ref(0)

  watch(celsius, (newCelsius) => {
    // Logic mixed with reactivity
    fahrenheit.value = (newCelsius * 9/5) + 32
  })

  return { celsius, fahrenheit }
}
```

```typescript
// ✅ After: Separated concerns

// Pure business logic - easy to test
export function convertToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32
}

export function convertToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9
}

// Thin reactive wrapper
export function useTemperatureConverter(celsiusRef: Ref<number>) {
  const fahrenheit = ref(0)

  watch(celsiusRef, (newCelsius) => {
    fahrenheit.value = convertToFahrenheit(newCelsius)
  })

  return { fahrenheit: readonly(fahrenheit) }
}
```

**Testing:**

```typescript
import { describe, it, expect } from 'vitest'
import { convertToFahrenheit, convertToCelsius } from './temperature'

describe('Temperature Conversion', () => {
  // ✅ No Vue Test Utils needed!
  it('should convert 0°C to 32°F', () => {
    expect(convertToFahrenheit(0)).toBe(32)
  })

  it('should convert 100°C to 212°F', () => {
    expect(convertToFahrenheit(100)).toBe(212)
  })

  it('should convert 32°F to 0°C', () => {
    expect(convertToCelsius(32)).toBe(0)
  })
})
```

---

### 10. Extract Composable Pattern

**Problem:** Component logic grows complex but isn't reused yet.

**Solution:** Extract logic into a composable even for single-use cases to improve clarity.

**IMPORTANT: Before implementing a composable, always check [VueUse](https://vueuse.org/) first!**

VueUse provides 200+ battle-tested composables. Common examples:
- DOM: `useEventListener`, `useIntersectionObserver`, `useResizeObserver`, `onClickOutside`
- Browser APIs: `useLocalStorage`, `useFetch`, `useClipboard`, `useGeolocation`
- State: `useToggle`, `useCounter`, `useDebounce`, `useThrottle`
- Component: `useVModel`, `useTemplateRef`

Only create custom composables when VueUse doesn't have what you need.

```vue
<!-- ❌ Before: All logic in component -->
<template>
  <div class="counter">
    <button @click="decrement">-</button>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const count = ref(0)
const history = ref<number[]>([])

const increment = () => {
  count.value++
  history.value.push(count.value)
}

const decrement = () => {
  count.value--
  history.value.push(count.value)
}

watch(count, (newValue, oldValue) => {
  console.log(`Count changed from ${oldValue} to ${newValue}`)
})
</script>
```

```vue
<!-- ✅ After: Logic extracted -->
<template>
  <div class="counter">
    <button @click="decrement">-</button>
    <p>Count: {{ count }}</p>
    <button @click="increment">+</button>
  </div>
</template>

<script setup lang="ts">
import { useCounter } from './useCounter'

const { count, increment, decrement } = useCounter(0)
</script>
```

```typescript
// useCounter.ts
import { ref, watch, readonly } from 'vue'

export function useCounter(initialValue: number = 0) {
  const count = ref(initialValue)
  const history = ref<number[]>([initialValue])

  const increment = () => {
    count.value++
    history.value.push(count.value)
  }

  const decrement = () => {
    count.value--
    history.value.push(count.value)
  }

  const undo = () => {
    if (history.value.length > 1) {
      history.value.pop()
      count.value = history.value[history.value.length - 1]
    }
  }

  watch(count, (newValue, oldValue) => {
    console.log(`Count changed from ${oldValue} to ${newValue}`)
  })

  return {
    count: readonly(count),
    history: readonly(history),
    increment,
    decrement,
    undo, // Easy to add new features!
  }
}
```

**Benefits:**
- Separates logic from UI
- Easy to add features (like `undo`)
- Testable without mounting components
- Clearer component responsibility

---

### 11. Data Store Pattern

**Problem:** Need to share state between components without prop drilling, but Pinia is overkill.

**Solution:** Create a simple reactive data store using a composable with module-level state.

```typescript
// useThemeStore.ts
import { reactive, toRefs, readonly } from 'vue'
import { themes } from './utils'

// 1. Global state at module scope - shared across all usages
const state = reactive({
  darkMode: false,
  sidebarCollapsed: false,
  theme: 'nord' as string, // Private to this module
})

export function useThemeStore() {
  // 2. Expose only some of the state
  const { darkMode, sidebarCollapsed } = toRefs(state)

  // 3. Methods to modify underlying state
  const changeTheme = (newTheme: string) => {
    if (themes.includes(newTheme)) {
      state.theme = newTheme
    }
  }

  const toggleDarkMode = () => {
    state.darkMode = !state.darkMode
  }

  const toggleSidebar = () => {
    state.sidebarCollapsed = !state.sidebarCollapsed
  }

  return {
    // Only return selected state
    darkMode,
    sidebarCollapsed,
    // Expose theme as readonly
    theme: readonly(toRef(state, 'theme')),
    // Methods
    changeTheme,
    toggleDarkMode,
    toggleSidebar,
  }
}
```

**Usage:**

```vue
<!-- NavBar.vue -->
<script setup lang="ts">
import { useThemeStore } from '@/composables/useThemeStore'

const { darkMode, toggleDarkMode, sidebarCollapsed, toggleSidebar } =
  useThemeStore()
</script>

<template>
  <nav :class="{ dark: darkMode }">
    <button @click="toggleSidebar">
      {{ sidebarCollapsed ? 'Expand' : 'Collapse' }}
    </button>
    <button @click="toggleDarkMode">
      {{ darkMode ? '☀️' : '🌙' }}
    </button>
  </nav>
</template>
```

**When to use:**
- Simple shared state between a few components
- Don't need DevTools/time travel
- Want something lighter than Pinia

**When NOT to use:**
- Complex state with many actions → Use Pinia
- Need debugging/DevTools → Use Pinia
- Server state → Use TanStack Query or pinia-colada

---

### 12. Insider Trading Pattern

**Problem:** Parent and child components are overly coupled, passing everything back and forth.

**Solution:** Inline the child component into the parent to reduce indirection.

```vue
<!-- ❌ Before: Unnecessary child component -->
<!-- ParentComponent.vue -->
<template>
  <div>
    <ChildComponent
      :user-name="userName"
      :email-address="emailAddress"
      :phone-number="phoneNumber"
      @user-update="(val) => $emit('user-update', val)"
      @email-update="(val) => $emit('email-update', val)"
      @phone-update="(val) => $emit('phone-update', val)"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userName: string
  emailAddress: string
  phoneNumber: string
}>()

defineEmits<{
  'user-update': [value: string]
  'email-update': [value: string]
  'phone-update': [value: string]
}>()
</script>
```

```vue
<!-- ✅ After: Inlined and simplified -->
<template>
  <div class="user-form">
    <input
      :value="userName"
      @input="$emit('user-update', $event.target.value)"
      placeholder="Name"
    />
    <input
      :value="emailAddress"
      @input="$emit('email-update', $event.target.value)"
      type="email"
      placeholder="Email"
    />
    <input
      :value="phoneNumber"
      @input="$emit('phone-update', $event.target.value)"
      type="tel"
      placeholder="Phone"
    />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  userName: string
  emailAddress: string
  phoneNumber: string
}>()

defineEmits<{
  'user-update': [value: string]
  'email-update': [value: string]
  'phone-update': [value: string]
}>()
</script>
```

**When to use:**
- Child component only exists to serve one parent
- All props come directly from parent
- All events go directly to parent
- No reusability benefit

---

### 13. Combine Branches Pattern

**Problem:** Multiple conditional branches can be simplified by combining similar cases.

```vue
<!-- ❌ Before: Separate branches for similar cases -->
<template>
  <div>
    <LoadingState v-if="isLoading" />
    <ErrorState v-else-if="hasError" :error="error" />
    <EmptyState v-else-if="items.length === 0" />
    <SuccessState v-else :items="items" />
  </div>
</template>

<!-- ✅ After: Combined branches -->
<template>
  <div>
    <StatusState
      :status="currentStatus"
      :error="error"
      :items="items"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentStatus = computed(() => {
  if (isLoading) return 'loading'
  if (hasError) return 'error'
  if (items.value.length === 0) return 'empty'
  return 'success'
})
</script>
```

**StatusState.vue:**

```vue
<template>
  <LoadingView v-if="status === 'loading'" />
  <ErrorView v-else-if="status === 'error'" :error="error" />
  <EmptyView v-else-if="status === 'empty'" />
  <SuccessView v-else :items="items" />
</template>

<script setup lang="ts">
defineProps<{
  status: 'loading' | 'error' | 'empty' | 'success'
  error?: Error
  items?: any[]
}>()
</script>
```

---

## Pattern Selection Guide

### Component Complexity

```
Single Responsibility → Humble Component
Multiple Children → Controller Component
Complex Conditionals → Extract Conditional / Strategy Pattern
Large Lists → List Component Pattern
Too Many Props → Hidden Components / Preserve Object
```

### State Management

```
Local State → ref/reactive in component
Shared Logic → Extract Composable
Simple Global State → Data Store Pattern
Complex Global State → Pinia (see STATE-MANAGEMENT.md)
```

### Coupling & Reusability

```
Tightly Coupled → Inline it (Insider Trading)
Domain-Specific → Preserve Object Pattern
Generic/Reusable → Individual Props + Humble Component
```

### Code Clarity

```
Hard to Understand → Long Components Principle
Mixed Concerns → Thin Composables
Repetitive Branches → Combine Branches
```

## Anti-Patterns

❌ **God Components**
- Components that do everything
- Solution: Controller + Humble Components

❌ **Prop Drilling**
- Passing props through multiple levels
- Solution: Composables, Provide/Inject, or Pinia

❌ **Smart Children**
- Child components making API calls or business decisions
- Solution: Controller pattern, lift state up

❌ **Premature Abstraction**
- Extracting components before understanding patterns
- Solution: Inline first, extract when pattern emerges

❌ **Kitchen Sink Components**
- One component with many unrelated features
- Solution: Hidden Components pattern

---

## Testing Component Patterns

### Humble Components

```typescript
import { render, screen } from '@testing-library/vue'
import { describe, it, expect } from 'vitest'
import UserCard from './UserCard.vue'

describe('UserCard', () => {
  it('should display user information', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Software developer',
    }

    render(UserCard, {
      props: { userData }
    })

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('Software developer')).toBeInTheDocument()
  })

  it('should emit edit-profile when button clicked', async () => {
    const { emitted } = render(UserCard, {
      props: { userData: mockUser }
    })

    await screen.getByRole('button', { name: /edit profile/i }).click()

    expect(emitted()['edit-profile']).toHaveLength(1)
  })
})
```

### Composables

```typescript
import { describe, it, expect } from 'vitest'
import { useCounter } from './useCounter'

describe('useCounter', () => {
  it('should increment count', () => {
    const { count, increment } = useCounter(0)

    expect(count.value).toBe(0)
    increment()
    expect(count.value).toBe(1)
  })

  it('should support undo functionality', () => {
    const { count, increment, undo } = useCounter(0)

    increment()
    increment()
    expect(count.value).toBe(2)

    undo()
    expect(count.value).toBe(1)
  })
})
```

---

## Progressive Enhancement

Start simple, add complexity only when needed:

1. **Start with inline code** in component
2. **Check VueUse** - Search [vueuse.org](https://vueuse.org/) before implementing anything
3. **Extract to methods** if reused within component
4. **Extract to composable** if shared across components (and not in VueUse)
5. **Create store** if global state is needed
6. **Split components** when they become hard to understand

Don't jump to the most complex pattern first!

### VueUse Integration Examples

```vue
<!-- ❌ Bad: Reinventing the wheel -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  isVisible.value = window.scrollY > 100
}
</script>

<!-- ✅ Good: Using VueUse -->
<script setup lang="ts">
import { useScroll } from '@vueuse/core'
import { computed } from 'vue'

const { y } = useScroll(window)
const isVisible = computed(() => y.value > 100)
</script>
```

```vue
<!-- ❌ Bad: Manual localStorage management -->
<script setup lang="ts">
import { ref, watch } from 'vue'

const theme = ref('light')

// Load from localStorage
const saved = localStorage.getItem('theme')
if (saved) theme.value = saved

// Save to localStorage
watch(theme, (newTheme) => {
  localStorage.setItem('theme', newTheme)
})
</script>

<!-- ✅ Good: Using VueUse -->
<script setup lang="ts">
import { useLocalStorage } from '@vueuse/core'

// Automatically syncs with localStorage
const theme = useLocalStorage('theme', 'light')
</script>
```

---

## Further Reading

- [PATTERNS.md](PATTERNS.md) - Functional Core / Imperative Shell
- [STATE-MANAGEMENT.md](STATE-MANAGEMENT.md) - When to use Pinia vs composables
- [TESTING.md](TESTING.md) - Testing patterns with Testing Library
- [Vue 3 Component Design Patterns](https://vuejs.org/guide/reusability/composables.html)
