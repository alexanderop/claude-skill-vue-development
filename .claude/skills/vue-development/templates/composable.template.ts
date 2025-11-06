// features/[feature-name]/composables/use[Name].ts
import { ref, readonly, computed, watch, onMounted } from 'vue'

/**
 * [Brief description of what this composable does]
 *
 * Part of the [feature-name] feature.
 *
 * @example
 * ```ts
 * const { data, isLoading, error, load } = use[Name]()
 *
 * onMounted(() => {
 *   load()
 * })
 * ```
 */
export function use[Name]() {
  // ============================================
  // 1. PRIMARY STATE
  // ============================================
  // Main reactive data
  const data = ref<DataType | null>(null)

  // ============================================
  // 2. STATE METADATA
  // ============================================
  // Loading, error, and other status indicators
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  // ============================================
  // 3. COMPUTED PROPERTIES
  // ============================================
  // Derived state
  const hasData = computed(() => data.value !== null)
  const hasError = computed(() => error.value !== null)

  // ============================================
  // 4. METHODS
  // ============================================
  // Functions that update state
  async function load() {
    isLoading.value = true
    error.value = null

    try {
      // Simulate API call
      const response = await fetch('/api/endpoint')
      if (!response.ok) throw new Error('Failed to load')

      data.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err : new Error('Unknown error')
      data.value = null
    } finally {
      isLoading.value = false
    }
  }

  function reset() {
    data.value = null
    error.value = null
    isLoading.value = false
  }

  // ============================================
  // 5. LIFECYCLE HOOKS (if needed)
  // ============================================
  // Optional: Auto-load on mount
  // onMounted(() => {
  //   load()
  // })

  // ============================================
  // 6. WATCHERS (if needed)
  // ============================================
  // Optional: React to state changes
  // watch(data, (newData) => {
  //   console.log('Data changed:', newData)
  // })

  // ============================================
  // 7. RETURN PUBLIC API
  // ============================================
  // Use readonly() to prevent direct state mutation
  return {
    // State (readonly)
    data: readonly(data),
    isLoading: readonly(isLoading),
    error: readonly(error),

    // Computed
    hasData,
    hasError,

    // Methods
    load,
    reset
  }
}

// ============================================
// TYPES
// ============================================
type DataType = {
  id: string
  name: string
}

// Export return type for use in components
export type Use[Name]Return = ReturnType<typeof use[Name]>
