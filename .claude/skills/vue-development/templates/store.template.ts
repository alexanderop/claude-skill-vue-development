// ============================================
// Pinia Store Template with Composition API
// ============================================
// This template demonstrates best practices:
// - Single Responsibility: Each action does ONE thing
// - Explicit Error Handling: Return { data, error }, never throw
// - No UI Logic: Store never calls toast/alert
// - Readonly State: Use readonly() to prevent mutations
// - Composition API: Modern, type-safe approach
//
// Replace [Name] with your domain (e.g., Todo, User, Product)
// ============================================

import { defineStore } from 'pinia'
import { ref, readonly, computed } from 'vue'

// ============================================
// TYPES
// ============================================

type [Name] = {
  id: string
  name: string
  // Add your properties
}

type Result<T> = {
  data: T
  error: null
} | {
  data: null
  error: string
}

// ============================================
// STORE
// ============================================

export const use[Name]Store = defineStore('[name]', () => {
  // ============================================
  // STATE
  // ============================================
  const items = ref<[Name][]>([])
  const isLoading = ref(false)
  const selectedId = ref<string | null>(null)

  // ============================================
  // COMPUTED (GETTERS)
  // ============================================
  const selectedItem = computed(() =>
    selectedId.value
      ? items.value.find(item => item.id === selectedId.value)
      : null
  )

  const hasItems = computed(() => items.value.length > 0)

  // ============================================
  // ACTIONS
  // Each action:
  // - Does ONE thing
  // - Returns { data, error }
  // - Never throws errors
  // - Never calls toast/alert
  // ============================================

  /**
   * Fetch all items from the API
   * Consumer handles error presentation
   */
  async function fetchItems(): Promise<Result<[Name][]>> {
    isLoading.value = true

    try {
      const response = await fetch('/api/[name]')

      if (!response.ok) {
        return {
          data: null,
          error: `Failed to fetch: ${response.statusText}`
        }
      }

      const data = await response.json()
      items.value = data
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

  /**
   * Create a new item
   * Consumer handles success/error notifications
   */
  async function createItem(
    item: Omit<[Name], 'id'>
  ): Promise<Result<[Name]>> {
    try {
      const response = await fetch('/api/[name]', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      })

      if (!response.ok) {
        return {
          data: null,
          error: `Failed to create: ${response.statusText}`
        }
      }

      const newItem = await response.json()
      items.value.push(newItem)
      return { data: newItem, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Update an existing item
   * Consumer handles success/error notifications
   */
  async function updateItem(
    id: string,
    updates: Partial<Omit<[Name], 'id'>>
  ): Promise<Result<[Name]>> {
    try {
      const response = await fetch(`/api/[name]/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        return {
          data: null,
          error: `Failed to update: ${response.statusText}`
        }
      }

      const updatedItem = await response.json()

      items.value = items.value.map(item =>
        item.id === id ? updatedItem : item
      )

      return { data: updatedItem, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Delete an item
   * Consumer handles success/error notifications
   */
  async function deleteItem(id: string): Promise<Result<void>> {
    try {
      const response = await fetch(`/api/[name]/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        return {
          data: null,
          error: `Failed to delete: ${response.statusText}`
        }
      }

      items.value = items.value.filter(item => item.id !== id)
      return { data: undefined as void, error: null }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Select an item (local state update)
   * Synchronous actions can also return Result
   */
  function selectItem(id: string): Result<[Name]> {
    const item = items.value.find(i => i.id === id)

    if (!item) {
      return { data: null, error: 'Item not found' }
    }

    selectedId.value = id
    return { data: item, error: null }
  }

  /**
   * Clear selection
   */
  function clearSelection(): void {
    selectedId.value = null
  }

  // ============================================
  // PUBLIC INTERFACE
  // Use readonly() to prevent mutations outside actions
  // ============================================
  return {
    // State (readonly)
    items: readonly(items),
    isLoading: readonly(isLoading),
    selectedId: readonly(selectedId),

    // Computed
    selectedItem,
    hasItems,

    // Actions
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    selectItem,
    clearSelection
  }
})

// ============================================
// USAGE IN COMPONENT
// ============================================
/*
<script setup lang="ts">
import { onMounted } from 'vue'
import { use[Name]Store } from '@/stores/[name]'
import { useToast } from '@/composables/useToast'

const store = use[Name]Store()
const toast = useToast()

// Load data on mount
onMounted(async () => {
  const { error } = await store.fetchItems()
  if (error) {
    // Consumer decides: toast, modal, inline error, etc.
    toast.error(`Failed to load items: ${error}`)
  }
})

// Handle create
async function handleCreate(name: string) {
  const { data, error } = await store.createItem({ name })

  if (error) {
    toast.error(error)
    return
  }

  toast.success(`Created: ${data.name}`)
}

// Handle update
async function handleUpdate(id: string, name: string) {
  const { data, error } = await store.updateItem(id, { name })

  if (error) {
    toast.error(error)
    return
  }

  toast.success(`Updated: ${data.name}`)
}

// Handle delete
async function handleDelete(id: string) {
  const { error } = await store.deleteItem(id)

  if (error) {
    toast.error(error)
    return
  }

  toast.success('Deleted successfully')
}

// Handle selection (sync action)
function handleSelect(id: string) {
  const { error } = store.selectItem(id)
  if (error) {
    toast.error(error)
  }
}
</script>

<template>
  <div>
    <div v-if="store.isLoading">Loading...</div>

    <div v-else-if="!store.hasItems">
      No items found
    </div>

    <ul v-else>
      <li
        v-for="item in store.items"
        :key="item.id"
        @click="handleSelect(item.id)"
      >
        {{ item.name }}
        <button @click.stop="handleDelete(item.id)">Delete</button>
      </li>
    </ul>
  </div>
</template>
*/

// ============================================
// ADVANCED: SEPARATING PURE BUSINESS LOGIC
// ============================================
// For complex business logic, extract to pure functions:
/*
// features/[name]/logic/[name]Logic.ts
export type [Name] = {
  id: string
  name: string
}

export function create[Name](name: string): [Name] {
  return {
    id: crypto.randomUUID(),
    name
  }
}

export function validate[Name]Name(name: string): { valid: boolean; error: string | null } {
  if (!name.trim()) {
    return { valid: false, error: 'Name cannot be empty' }
  }
  if (name.length > 100) {
    return { valid: false, error: 'Name must be less than 100 characters' }
  }
  return { valid: true, error: null }
}

// Then use in store:
import * as [Name]Logic from '@/features/[name]/logic/[name]Logic'

async function createItem(item: Omit<[Name], 'id'>): Promise<Result<[Name]>> {
  // Validate using pure function
  const validation = [Name]Logic.validate[Name]Name(item.name)
  if (!validation.valid) {
    return { data: null, error: validation.error }
  }

  // Create using pure function
  const newItem = [Name]Logic.create[Name](item.name)

  // API call...
}
*/

// ============================================
// TESTING EXAMPLE
// ============================================
/*
// stores/[name].test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { use[Name]Store } from './[name]'

describe('use[Name]Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('should create item successfully', async () => {
    const store = use[Name]Store()

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: '1', name: 'Test' })
    })

    const { data, error } = await store.createItem({ name: 'Test' })

    expect(error).toBeNull()
    expect(data).toEqual({ id: '1', name: 'Test' })
    expect(store.items).toHaveLength(1)
  })

  it('should return error when create fails', async () => {
    const store = use[Name]Store()

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Bad Request'
    })

    const { data, error } = await store.createItem({ name: 'Test' })

    expect(data).toBeNull()
    expect(error).toBe('Failed to create: Bad Request')
    expect(store.items).toHaveLength(0)
  })

  it('should select item', () => {
    const store = use[Name]Store()
    store.items.value = [{ id: '1', name: 'Test' }]

    const { data, error } = store.selectItem('1')

    expect(error).toBeNull()
    expect(data).toEqual({ id: '1', name: 'Test' })
    expect(store.selectedId).toBe('1')
  })

  it('should return error for invalid item id', () => {
    const store = use[Name]Store()

    const { data, error } = store.selectItem('invalid-id')

    expect(data).toBeNull()
    expect(error).toBe('Item not found')
  })
})
*/
