<script setup lang="ts">
/**
 * [ComponentName] - [Brief description]
 *
 * @example
 * ```vue
 * <[ComponentName]
 *   title="Example"
 *   :items="items"
 *   @submit="handleSubmit"
 * />
 * ```
 */

// ============================================
// IMPORTS
// ============================================
import { ref, computed, watch, onMounted } from 'vue'

// ============================================
// TYPES
// ============================================
interface Item {
  id: string
  name: string
}

// For discriminated union props (variant pattern):
type BaseProps = {
  title: string
}

type VariantAProps = BaseProps & {
  variant: 'a'
  itemsA: Item[]
  itemsB?: never
}

type VariantBProps = BaseProps & {
  variant: 'b'
  itemsB: Item[]
  itemsA?: never
}

type Props = VariantAProps | VariantBProps

// Or for simple props:
// interface Props {
//   title: string
//   items: Item[]
//   disabled?: boolean
// }

// ============================================
// PROPS & EMITS
// ============================================
const props = withDefaults(defineProps<Props>(), {
  // Default values for optional props
  // disabled: false
})

const emit = defineEmits<{
  submit: [data: FormData]
  cancel: []
  change: [value: string]
}>()

// ============================================
// COMPOSABLES
// ============================================
// Import and use composables
// const { data, isLoading, error, load } = useData()

// ============================================
// STATE
// ============================================
const localValue = ref('')
const isProcessing = ref(false)

// ============================================
// COMPUTED
// ============================================
const displayItems = computed(() => {
  if (props.variant === 'a') {
    return props.itemsA
  } else {
    return props.itemsB
  }
})

const hasItems = computed(() => displayItems.value.length > 0)

// ============================================
// METHODS
// ============================================
function handleSubmit() {
  if (isProcessing.value) return

  isProcessing.value = true

  try {
    // Process data
    const formData = {
      value: localValue.value
    }

    emit('submit', formData)
  } finally {
    isProcessing.value = false
  }
}

function handleChange(value: string) {
  localValue.value = value
  emit('change', value)
}

function handleCancel() {
  localValue.value = ''
  emit('cancel')
}

// ============================================
// WATCHERS
// ============================================
watch(
  () => props.title,
  (newTitle) => {
    console.log('Title changed:', newTitle)
  }
)

// ============================================
// LIFECYCLE
// ============================================
onMounted(() => {
  // Initialize component
})
</script>

<template>
  <div class="component-container">
    <!-- Header -->
    <header class="component-header">
      <h2>{{ title }}</h2>
    </header>

    <!-- Content -->
    <main class="component-content">
      <!-- Empty State -->
      <div v-if="!hasItems" class="empty-state">
        <p>No items available</p>
      </div>

      <!-- Items List -->
      <ul v-else class="items-list">
        <li
          v-for="item in displayItems"
          :key="item.id"
          class="item"
        >
          {{ item.name }}
        </li>
      </ul>
    </main>

    <!-- Actions -->
    <footer class="component-actions">
      <button
        type="button"
        :disabled="isProcessing"
        class="btn btn-primary"
        @click="handleSubmit"
      >
        {{ isProcessing ? 'Processing...' : 'Submit' }}
      </button>

      <button
        type="button"
        class="btn btn-secondary"
        @click="handleCancel"
      >
        Cancel
      </button>
    </footer>
  </div>
</template>

<style scoped>
/* ============================================
   COMPONENT STYLES
   ============================================ */

.component-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}

.component-header {
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 0.5rem;
}

.component-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.component-content {
  min-height: 200px;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
}

.items-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.item {
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.item:hover {
  background-color: #f3f4f6;
}

.component-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

/* Dark mode support (if using TailwindCSS dark: prefix or custom implementation) */
@media (prefers-color-scheme: dark) {
  .component-container {
    border-color: #374151;
    background-color: #1f2937;
  }

  .component-header {
    border-color: #374151;
  }

  .item {
    background-color: #374151;
  }

  .item:hover {
    background-color: #4b5563;
  }

  .btn-secondary {
    background-color: #374151;
    color: #f9fafb;
  }

  .btn-secondary:hover {
    background-color: #4b5563;
  }
}
</style>

<!-- ============================================
     USAGE EXAMPLES
     ============================================

Basic Usage:
<[ComponentName]
  title="My Component"
  variant="a"
  :itemsA="items"
  @submit="handleSubmit"
  @cancel="handleCancel"
/>

With Discriminated Union Props:
<[ComponentName]
  title="Variant A"
  variant="a"
  :itemsA="itemsA"
/>

<[ComponentName]
  title="Variant B"
  variant="b"
  :itemsB="itemsB"
/>

     ============================================ -->
