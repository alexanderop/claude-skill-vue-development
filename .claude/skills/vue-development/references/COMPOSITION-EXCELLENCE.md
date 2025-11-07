# Component and Composable Excellence

> **For Claude Code:**
> - **When to load:** User asks about component structure, composable extraction, `<script setup>` organization, or "best practices"
> - **Quick scan:** Read only "The Perfect Pattern" section and "Why This Pattern is Perfect" headers
> - **Deep dive:** Load full file when user needs detailed example of component organization
> - **Always cite:** Reference "Gold Standard Pattern" or "Progressive Extraction Strategy"
> - **Key takeaway:** Start inline, extract to inline function, move to file only when reused 2+ times

This document demonstrates the gold standard for organizing Vue components with `<script setup>` and extracting reusable composables. This pattern exemplifies clean architecture, functional decomposition, and maintainable code structure.

## The Perfect Pattern

The ideal Vue component with `<script setup>` follows this structure:

1. **Import Organization** - External dependencies, GraphQL, utilities
2. **Composable Extraction** - Focused, single-responsibility functions
3. **Inline Composables** - Component-specific logic extracted to inline functions
4. **Clear Separation** - Reusable functions vs. component-specific logic

## Gold Standard Example

This real-world example from a production Vue application demonstrates the perfect way to structure a complex component:

```vue
<script setup>
import { useQuery, mutate } from 'vue-apollo'
import { ref, reactive, watch, nextTick } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

// ============================================
// REUSABLE FUNCTIONS (NOT COMPONENT-SPECIFIC)
// ============================================
// These are general-purpose utilities that could be used anywhere
import { useNetworkState } from '@/functions/network'
import { usePathUtils } from '@/functions/path'
import { resetCwdOnLeave, useCwdUtils } from '@/functions/cwd'

// ============================================
// GRAPHQL QUERIES/MUTATIONS
// ============================================
import FOLDER_CURRENT from '@/graphql/folder/folderCurrent.gql'
import FOLDERS_FAVORITE from '@/graphql/folder/favoriteFolders.gql'
import FOLDER_OPEN from '@/graphql/folder/folderOpen.gql'
import FOLDER_OPEN_PARENT from '@/graphql/folder/folderOpenParent.gql'
import FOLDER_SET_FAVORITE from '@/graphql/folder/folderSetFavorite.gql'
import PROJECT_CWD_RESET from '@/graphql/project/projectCwdReset.gql'
import FOLDER_CREATE from '@/graphql/folder/folderCreate.gql'

// ============================================
// UTILITIES
// ============================================
import { isValidMultiName } from '@/util/folders'
const SHOW_HIDDEN = 'vue-ui.show-hidden-folders'

// ============================================
// COMPOSABLES - COMPONENT-LEVEL ORCHESTRATION
// ============================================

// Network state (reusable)
const { networkState } = useNetworkState()

// Folder management (inline composables below)
const { folders, currentFolderData } = useCurrentFolderData(networkState)
const folderNavigation = useFolderNavigation({ networkState, currentFolderData })
const { favoriteFolders, toggleFavorite } = useFavoriteFolders(currentFolderData)
const { showHiddenFolders } = useHiddenFolders()
const createFolder = useCreateFolder(folderNavigation.openFolder)

// Current working directory
resetCwdOnLeave()
const { updateOnCwdChanged } = useCwdUtils()

// Path utilities
const { slicePath } = usePathUtils()

// ============================================
// INLINE COMPOSABLES (COMPONENT-SPECIFIC)
// ============================================
// These are extracted functions that are specific to THIS component
// They're defined inline but structured as composables for clarity

/**
 * Manages current folder data and GraphQL query
 *
 * This composable handles:
 * - Folder list ref
 * - Current folder query with Apollo
 * - Scroll reset on data change
 */
function useCurrentFolderData (networkState) {
  const folders = ref(null)

  const currentFolderData = useQuery({
    query: FOLDER_CURRENT,
    fetchPolicy: 'network-only',
    networkState,
    async result () {
      await nextTick()
      folders.scrollTop = 0
    }
  }, {})

  return {
    folders,
    currentFolderData
  }
}

/**
 * Handles folder navigation and path editing
 *
 * This composable manages:
 * - Path editing UI state
 * - Folder opening/navigation
 * - Parent folder navigation
 * - Folder refresh
 */
function useFolderNavigation ({ networkState, currentFolderData }) {
  // Path editing state
  const pathEditing = reactive({
    editingPath: false,
    editedPath: '',
  })

  // DOM ref
  const pathInput = ref(null)

  async function openPathEdit () {
    pathEditing.editedPath = currentFolderData.path
    pathEditing.editingPath = true
    await nextTick()
    pathInput.focus()
  }

  function submitPathEdit () {
    openFolder(pathEditing.editedPath)
  }

  // Folder opening
  const openFolder = async (path) => {
    pathEditing.editingPath = false
    networkState.error = null
    networkState.loading++
    try {
      await mutate({
        mutation: FOLDER_OPEN,
        variables: { path },
        update: (store, { data: { folderOpen } }) => {
          store.writeQuery({
            query: FOLDER_CURRENT,
            data: { currentFolderData: folderOpen }
          })
        }
      })
    } catch (e) {
      networkState.error = e
    }
    networkState.loading--
  }

  async function openParentFolder () {
    pathEditing.editingPath = false
    networkState.error = null
    networkState.loading++
    try {
      await mutate({
        mutation: FOLDER_OPEN_PARENT,
        update: (store, { data: { folderOpenParent } }) => {
          store.writeQuery({
            query: FOLDER_CURRENT,
            data: { currentFolderData: folderOpenParent }
          })
        }
      })
    } catch (e) {
      networkState.error = e
    }
    networkState.loading--
  }

  function refreshFolder () {
    openFolder(currentFolderData.path)
  }

  return {
    pathInput,
    pathEditing,
    openPathEdit,
    submitPathEdit,
    openFolder,
    openParentFolder,
    refreshFolder
  }
}

/**
 * Manages favorite folders
 *
 * This composable handles:
 * - Fetching favorite folders
 * - Toggling favorite status
 * - Cache updates after mutations
 */
function useFavoriteFolders (currentFolderData) {
  const favoriteFolders = useQuery(FOLDERS_FAVORITE, [])

  async function toggleFavorite () {
    await mutate({
      mutation: FOLDER_SET_FAVORITE,
      variables: {
        path: currentFolderData.path,
        favorite: !currentFolderData.favorite
      },
      update: (store, { data: { folderSetFavorite } }) => {
        // Update current folder cache
        store.writeQuery({
          query: FOLDER_CURRENT,
          data: { currentFolderData: folderSetFavorite }
        })

        // Update favorites list cache
        let data = store.readQuery({ query: FOLDERS_FAVORITE })
        // Workaround for Apollo cache immutability
        data = {
          favoriteFolders: data.favoriteFolders.slice()
        }

        if (folderSetFavorite.favorite) {
          data.favoriteFolders.push(folderSetFavorite)
        } else {
          const index = data.favoriteFolders.findIndex(
            f => f.path === folderSetFavorite.path
          )
          index !== -1 && data.favoriteFolders.splice(index, 1)
        }

        store.writeQuery({ query: FOLDERS_FAVORITE, data })
      }
    })
  }

  return {
    favoriteFolders,
    toggleFavorite
  }
}

/**
 * Manages hidden folder visibility preference
 *
 * This composable handles:
 * - Reading localStorage preference
 * - Toggling hidden folder visibility
 * - Persisting preference to localStorage
 */
function useHiddenFolders () {
  const showHiddenFolders = ref(localStorage.getItem(SHOW_HIDDEN) === 'true')

  watch(showHiddenFolders, value => {
    if (value) {
      localStorage.setItem(SHOW_HIDDEN, 'true')
    } else {
      localStorage.removeItem(SHOW_HIDDEN)
    }
  }, { lazy: true })

  return {
    showHiddenFolders
  }
}

/**
 * Handles folder creation
 *
 * This composable manages:
 * - New folder UI state
 * - Folder name validation
 * - Creating folder via GraphQL
 * - Navigating to created folder
 */
function useCreateFolder (openFolder) {
  const showNewFolder = ref(false)
  const newFolderName = ref('')
  const newFolderValid = computed(() => isValidMultiName(newFolderName.value))

  async function createFolder () {
    if (!newFolderValid.value) return

    const result = await mutate({
      mutation: FOLDER_CREATE,
      variables: {
        name: newFolderName.value
      }
    })

    openFolder(result.data.folderCreate.path)
    newFolderName.value = ''
    showNewFolder.value = false
  }

  return {
    showNewFolder,
    newFolderName,
    newFolderValid,
    createFolder
  }
}
</script>

<template>
  <!-- Component template here -->
</template>
```

## Why This Pattern is Perfect

### 1. Clear Import Organization

```typescript
// External dependencies first
import { useQuery, mutate } from 'vue-apollo'
import { ref, reactive } from 'vue'

// Reusable domain functions (not component-specific)
import { useNetworkState } from '@/functions/network'

// GraphQL grouped together
import FOLDER_CURRENT from '@/graphql/folder/folderCurrent.gql'
import FOLDER_OPEN from '@/graphql/folder/folderOpen.gql'

// Utilities and constants
import { isValidMultiName } from '@/util/folders'
const SHOW_HIDDEN = 'vue-ui.show-hidden-folders'
```

**Benefits:**
- Easy to find what you need
- Clear separation of concerns
- Import paths reveal architecture
- Constants defined near imports

### 2. Inline Composable Functions

Instead of mixing everything in the script setup, extract focused functions:

```typescript
// ❌ BAD: Everything mixed together
const folders = ref(null)
const currentFolderData = useQuery({ query: FOLDER_CURRENT })
const pathEditing = reactive({ editingPath: false })
const pathInput = ref(null)
async function openPathEdit() { /* ... */ }
function submitPathEdit() { /* ... */ }
const openFolder = async (path) => { /* ... */ }
// ... 200+ more lines of mixed concerns

// ✅ GOOD: Extracted to focused inline composables
const { folders, currentFolderData } = useCurrentFolderData(networkState)
const folderNavigation = useFolderNavigation({ networkState, currentFolderData })
const { favoriteFolders, toggleFavorite } = useFavoriteFolders(currentFolderData)
```

**Benefits:**
- Each composable has single responsibility
- Related state and logic grouped together
- Easy to understand component structure at a glance
- Composables are self-documenting with JSDoc comments

### 3. Function-Level Decomposition

Each inline composable is focused on ONE concern:

```typescript
// Folder data management
function useCurrentFolderData(networkState) {
  const folders = ref(null)
  const currentFolderData = useQuery({ /* ... */ })
  return { folders, currentFolderData }
}

// Navigation logic
function useFolderNavigation({ networkState, currentFolderData }) {
  // All navigation-related state and methods
  return { openFolder, openParentFolder, refreshFolder /* ... */ }
}

// Favorites management
function useFavoriteFolders(currentFolderData) {
  // All favorites-related state and methods
  return { favoriteFolders, toggleFavorite }
}

// Hidden folders preference
function useHiddenFolders() {
  // All hidden folder visibility logic
  return { showHiddenFolders }
}

// Folder creation
function useCreateFolder(openFolder) {
  // All folder creation logic
  return { showNewFolder, newFolderName, createFolder }
}
```

**Benefits:**
- Single Responsibility Principle
- Easy to test individually
- Can be moved to separate files if reused
- Clear dependencies between composables

### 4. Explicit Dependencies

Composables receive dependencies as parameters:

```typescript
// ✅ GOOD: Dependencies are explicit
function useFolderNavigation({ networkState, currentFolderData }) {
  // Can only access what's passed in
  // Makes testing easy - just mock the parameters
}

function useCreateFolder(openFolder) {
  // Depends on openFolder function from navigation composable
  // Dependency is clear and explicit
}

// ❌ BAD: Implicit dependencies
function useFolderNavigation() {
  // Where does networkState come from? Module scope? Import?
  // Hard to test, unclear dependencies
}
```

**Benefits:**
- Clear dependency graph
- Easy to test with mocked dependencies
- No hidden coupling
- Makes refactoring safer

### 5. Progressive Extraction Strategy

This component demonstrates the perfect extraction strategy:

```
Level 1: Start inline in component
         ↓
Level 2: Extract to inline composable functions
         ↓ (if reused across multiple components)
Level 3: Move to separate file in /composables
         ↓ (if generic enough)
Level 4: Move to shared /functions directory
```

In this example:
- `useNetworkState`, `usePathUtils`, `useCwdUtils` → Shared across app (in `/functions`)
- `useCurrentFolderData`, `useFolderNavigation`, etc. → Specific to this component (inline)

### 6. Comprehensive JSDoc Comments

Each inline composable has clear documentation:

```typescript
/**
 * Manages favorite folders
 *
 * This composable handles:
 * - Fetching favorite folders
 * - Toggling favorite status
 * - Cache updates after mutations
 */
function useFavoriteFolders(currentFolderData) {
  // Implementation
}
```

**Benefits:**
- Self-documenting code
- IDE tooltips show documentation
- Easy for new developers to understand
- Explains the "why" not just the "what"

## When to Use This Pattern

### Use Inline Composables When:

✅ Logic is complex enough to deserve separation
✅ Multiple pieces of related state/methods should be grouped
✅ Component has 5+ pieces of state or 10+ methods
✅ You want better organization without premature file extraction
✅ Logic is specific to this component (not reused elsewhere)

### Move to Separate File When:

✅ Composable is reused across 2+ components
✅ Composable is generic enough to be in shared directory
✅ Composable has its own test file
✅ Composable is complex enough (100+ lines)

## Pattern Variations

### Option A: Group by Concern (Recommended)

```typescript
// All folder-related state and logic together
const { folders, currentFolderData } = useCurrentFolderData(networkState)
const folderNavigation = useFolderNavigation({ networkState, currentFolderData })

// All favorites-related logic together
const { favoriteFolders, toggleFavorite } = useFavoriteFolders(currentFolderData)

// All UI preferences together
const { showHiddenFolders } = useHiddenFolders()
```

### Option B: Group by Layer

```typescript
// Data layer
const { folders, currentFolderData } = useCurrentFolderData(networkState)
const { favoriteFolders } = useFavoriteFolders(currentFolderData)

// Actions layer
const folderNavigation = useFolderNavigation({ networkState, currentFolderData })
const { toggleFavorite } = useFavoriteActions(currentFolderData)

// UI layer
const { showHiddenFolders } = useHiddenFolders()
```

## Common Mistakes to Avoid

### ❌ Mistake 1: Everything in Script Setup

```vue
<script setup>
const folders = ref(null)
const currentFolderData = useQuery(FOLDER_CURRENT)
const pathEditing = reactive({ editingPath: false })
const pathInput = ref(null)
const favoriteFolders = useQuery(FOLDERS_FAVORITE)
const showHiddenFolders = ref(localStorage.getItem(SHOW_HIDDEN) === 'true')
const showNewFolder = ref(false)
const newFolderName = ref('')
// ... 50 more state variables
// ... 30 more functions
// Impossible to understand structure!
</script>
```

**Problem:** No organization, hard to understand, hard to maintain

### ❌ Mistake 2: Premature File Extraction

```typescript
// Before even using it in ONE component, you create:
// composables/useCurrentFolderData.ts
// composables/useFolderNavigation.ts
// composables/useFavoriteFolders.ts
// composables/useHiddenFolders.ts
// composables/useCreateFolder.ts
```

**Problem:** File explosion, over-engineering, harder to navigate

### ❌ Mistake 3: No Clear Dependencies

```typescript
// Where does this come from?
function useFolderNavigation() {
  const openFolder = async (path) => {
    // Where is networkState defined?
    networkState.loading++
  }
}
```

**Problem:** Hidden dependencies, hard to test, unclear coupling

### ✅ Solution: Use the Gold Standard Pattern

```typescript
// Clear structure at component level
const { networkState } = useNetworkState()
const { folders, currentFolderData } = useCurrentFolderData(networkState)
const folderNavigation = useFolderNavigation({ networkState, currentFolderData })

// Inline composables with explicit dependencies
function useCurrentFolderData(networkState) { /* ... */ }
function useFolderNavigation({ networkState, currentFolderData }) { /* ... */ }
```

## Testing This Pattern

### Testing Inline Composables

You can test inline composables by moving them to a separate file temporarily, or testing through the component:

```typescript
// Component test
import { render, screen } from '@testing-library/vue'
import FolderBrowser from './FolderBrowser.vue'

describe('FolderBrowser', () => {
  it('should open folder when path is submitted', async () => {
    const { user } = render(FolderBrowser)

    await user.click(screen.getByRole('button', { name: /edit path/i }))
    await user.type(screen.getByRole('textbox'), '/new/path{enter}')

    expect(screen.getByText('/new/path')).toBeInTheDocument()
  })
})
```

### Testing Extracted Composables

Once moved to separate files, test directly:

```typescript
import { describe, it, expect } from 'vitest'
import { useFolderNavigation } from './useFolderNavigation'

describe('useFolderNavigation', () => {
  it('should update edited path when opening path edit', async () => {
    const networkState = { loading: 0, error: null }
    const currentFolderData = { path: '/current/path' }

    const { pathEditing, openPathEdit } = useFolderNavigation({
      networkState,
      currentFolderData
    })

    await openPathEdit()

    expect(pathEditing.editingPath).toBe(true)
    expect(pathEditing.editedPath).toBe('/current/path')
  })
})
```

## Summary

This pattern represents the **perfect balance** between:

✅ Organization and clarity
✅ Flexibility and maintainability
✅ Simplicity and power
✅ Inline composables vs. file extraction

**Key Principles:**

1. **Start inline** - Don't create separate files prematurely
2. **Extract by concern** - Group related state and logic
3. **Explicit dependencies** - Pass everything as parameters
4. **Document with JSDoc** - Explain what each composable does
5. **Progressive extraction** - Move to files only when reused

**This is the gold standard for Vue component organization with `<script setup>`.**
