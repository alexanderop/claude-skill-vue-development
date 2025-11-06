// [ComponentName].test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import [ComponentName] from './[ComponentName].vue'

/**
 * Test naming convention:
 * should [verb] [expected outcome] when [trigger event]
 *
 * Page Object Pattern:
 * - Define render[ComponentName] function at the end of the file
 * - Return queries (get*, query*, find*) and actions (async functions)
 * - Tests use these functions instead of screen queries directly
 */

describe('[ComponentName]', () => {
  // ============================================
  // SETUP (if needed)
  // ============================================
  beforeEach(() => {
    // Reset mocks, clear state, etc.
  })

  // ============================================
  // RENDERING TESTS
  // ============================================
  describe('Rendering', () => {
    it('should display component when rendered', () => {
      const { getHeading, getExpectedText, getInputByLabel } = render[ComponentName]()

      expect(getHeading()).toBeInTheDocument()
      expect(getExpectedText()).toBeInTheDocument()
      expect(getInputByLabel()).toBeInTheDocument()
    })

    it('should display items when data is provided', () => {
      const items = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' }
      ]

      const { getItemByName } = render[ComponentName]({ items })

      expect(getItemByName('Item 1')).toBeInTheDocument()
      expect(getItemByName('Item 2')).toBeInTheDocument()
    })

    it('should display empty state when no data', () => {
      const { getEmptyState } = render[ComponentName]({ items: [] })

      expect(getEmptyState()).toBeInTheDocument()
    })
  })

  // ============================================
  // USER INTERACTION TESTS
  // ============================================
  describe('User Interactions', () => {
    it('should call handler when button is clicked', async () => {
      const onClick = vi.fn()
      const { clickSubmit } = render[ComponentName]({ onClick })

      await clickSubmit()

      expect(onClick).toHaveBeenCalledOnce()
    })

    it('should update input value when user types', async () => {
      const { fillEmail, getEmailInput } = render[ComponentName]()

      await fillEmail('test@example.com')

      expect(getEmailInput()).toHaveValue('test@example.com')
    })

    it('should submit form when user clicks submit button', async () => {
      const onSubmit = vi.fn()
      const { fillName, fillEmail, submitForm } = render[ComponentName]({ onSubmit })

      await fillName('John Doe')
      await fillEmail('john@example.com')
      await submitForm()

      expect(onSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com'
      })
    })

    it('should toggle item selection when user clicks checkbox', async () => {
      const { toggleItem, getItemCheckbox } = render[ComponentName]()

      expect(getItemCheckbox('Item 1')).not.toBeChecked()

      await toggleItem('Item 1')

      expect(getItemCheckbox('Item 1')).toBeChecked()
    })
  })

  // ============================================
  // ASYNC BEHAVIOR TESTS
  // ============================================
  describe('Async Behavior', () => {
    it('should display data after loading', async () => {
      // Mock API response
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ name: 'Test User' })
      })

      const { getLoadingSpinner, findUserName, queryLoadingSpinner } = render[ComponentName]()

      // Initially loading
      expect(getLoadingSpinner()).toBeInTheDocument()

      // Wait for data to load
      expect(await findUserName('Test User')).toBeInTheDocument()

      // Loading should be gone
      expect(queryLoadingSpinner()).not.toBeInTheDocument()
    })

    it('should hide loading spinner after data loads', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ items: [] })
      })

      const { waitForLoadingToFinish } = render[ComponentName]()

      await waitForLoadingToFinish()
    })

    it('should update display after multiple async operations', async () => {
      const { waitForStepsComplete } = render[ComponentName]()

      await waitForStepsComplete()
    })
  })

  // ============================================
  // ERROR HANDLING TESTS
  // ============================================
  describe('Error Handling', () => {
    it('should display error message when API fails', async () => {
      // Mock API error
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

      const { findErrorMessage } = render[ComponentName]()

      expect(await findErrorMessage('Failed to load data')).toBeInTheDocument()
    })

    it('should show validation error when input is invalid', async () => {
      const { submitForm, getValidationError } = render[ComponentName]()

      // Submit without filling required field
      await submitForm()

      expect(getValidationError('Email is required')).toBeInTheDocument()
    })

    it('should clear error when user dismisses', async () => {
      const { getError, dismissError, queryError } = render[ComponentName]({
        error: 'Something went wrong'
      })

      expect(getError()).toBeInTheDocument()

      await dismissError()

      expect(queryError()).not.toBeInTheDocument()
    })
  })

  // ============================================
  // ROUTER TESTS (if using router)
  // ============================================
  describe('Navigation', () => {
    it('should navigate to detail page when clicking item', async () => {
      // Create real router with memory history
      const router = createRouter({
        history: createMemoryHistory(),
        routes: [
          { path: '/', component: [ComponentName] },
          { path: '/item/:id', component: ItemDetail }
        ]
      })

      await router.push('/')
      await router.isReady()

      const { clickItem, getItemDetails } = render[ComponentName]({
        router
      })

      await clickItem('Item 1')

      // Check URL changed
      expect(router.currentRoute.value.path).toBe('/item/1')

      // Check new content rendered
      expect(getItemDetails()).toBeInTheDocument()
    })
  })

  // ============================================
  // STORE TESTS (if using Pinia)
  // ============================================
  describe('Store Integration', () => {
    beforeEach(() => {
      // Create fresh Pinia instance for each test
      setActivePinia(createPinia())
    })

    it('should display data from store', () => {
      const store = use[Name]Store()

      // Set up store state
      store.dispatch({ type: 'ADD_ITEM', item: { id: '1', name: 'Test' } })

      const { getItemByName } = render[ComponentName]()

      expect(getItemByName('Test')).toBeInTheDocument()
    })

    it('should update store when user adds item', async () => {
      const store = use[Name]Store()

      const { fillItemName, addItem } = render[ComponentName]()

      await fillItemName('New item')
      await addItem()

      expect(store.model.items).toHaveLength(1)
      expect(store.model.items[0].name).toBe('New item')
    })
  })

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================
  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const { getSubmitButton } = render[ComponentName]()

      expect(getSubmitButton()).toHaveAttribute('aria-label', 'Submit')
    })

    it('should be keyboard navigable', async () => {
      const { tabToButton, pressEnter, getClickMessage } = render[ComponentName]()

      await tabToButton()
      await pressEnter()

      expect(getClickMessage()).toBeInTheDocument()
    })
  })
})

// ============================================
// PAGE OBJECT
// ============================================
/**
 * Page Object Pattern:
 * Encapsulates all component interactions and queries.
 * Tests use these functions instead of screen queries directly.
 *
 * Benefits:
 * - DRY: Reuse queries and actions across tests
 * - Maintainability: Update selectors in one place
 * - Readability: Tests read like user stories
 * - Type Safety: TypeScript autocomplete for all interactions
 */
function render[ComponentName](props = {}) {
  const user = userEvent.setup()

  // Support custom plugins (router, pinia)
  const options = {
    props,
    ...(props.router && { global: { plugins: [props.router] } })
  }

  render([ComponentName], options)

  return {
    // ============================================
    // QUERIES (synchronous - element should exist)
    // ============================================
    getHeading: () => screen.getByRole('heading'),
    getExpectedText: () => screen.getByText('Expected text'),
    getInputByLabel: () => screen.getByLabelText('Input label'),
    getItemByName: (name: string) => screen.getByText(name),
    getEmptyState: () => screen.getByText('No items found'),
    getSubmitButton: () => screen.getByRole('button', { name: 'Submit' }),
    getEmailInput: () => screen.getByRole('textbox', { name: 'Email' }),
    getItemCheckbox: (name: string) => screen.getByRole('checkbox', { name }),
    getLoadingSpinner: () => screen.getByText('Loading...'),
    getValidationError: (message: string) => screen.getByText(message),
    getError: () => screen.getByText('Something went wrong'),
    getItemDetails: () => screen.getByText('Item 1 Details'),
    getClickMessage: () => screen.getByText('Button clicked'),

    // ============================================
    // QUERY VARIANTS (return null if not found)
    // ============================================
    queryLoadingSpinner: () => screen.queryByText('Loading...'),
    queryError: () => screen.queryByText('Something went wrong'),

    // ============================================
    // FIND QUERIES (async - wait for element)
    // ============================================
    findUserName: async (name: string) => screen.findByText(name),
    findErrorMessage: async (message: string) => screen.findByText(message),

    // ============================================
    // ACTIONS (async - user interactions)
    // ============================================
    clickSubmit: async () => {
      await user.click(screen.getByRole('button', { name: 'Submit' }))
    },
    fillEmail: async (email: string) => {
      await user.type(screen.getByRole('textbox', { name: 'Email' }), email)
    },
    fillName: async (name: string) => {
      await user.type(screen.getByLabelText('Name'), name)
    },
    submitForm: async () => {
      await user.click(screen.getByRole('button', { name: 'Submit' }))
    },
    toggleItem: async (name: string) => {
      await user.click(screen.getByRole('checkbox', { name }))
    },
    dismissError: async () => {
      await user.click(screen.getByRole('button', { name: 'Dismiss' }))
    },
    clickItem: async (name: string) => {
      await user.click(screen.getByText(name))
    },
    fillItemName: async (name: string) => {
      await user.type(screen.getByLabelText('Item name'), name)
    },
    addItem: async () => {
      await user.click(screen.getByRole('button', { name: 'Add' }))
    },
    tabToButton: async () => {
      await user.tab()
    },
    pressEnter: async () => {
      await user.keyboard('{Enter}')
    },

    // ============================================
    // COMPLEX WAIT OPERATIONS
    // ============================================
    waitForLoadingToFinish: async () => {
      await waitFor(() => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      })
    },
    waitForStepsComplete: async () => {
      await waitFor(() => {
        expect(screen.getByText('Step 1 complete')).toBeInTheDocument()
        expect(screen.getByText('Step 2 complete')).toBeInTheDocument()
      })
    }
  }
}

// ============================================
// QUERY REFERENCE
// ============================================
/*
Finding Elements (Priority order):

1. Accessible queries (best):
   - getByRole('button', { name: 'Submit' })
   - getByLabelText('Email')
   - getByPlaceholderText('Enter email')
   - getByText('Welcome')

2. Semantic queries:
   - getByAltText('Profile picture')
   - getByTitle('Close')

3. Test IDs (last resort):
   - getByTestId('custom-element')

Query variants:
- getBy*    - Throws if not found (element should exist)
- queryBy*  - Returns null if not found (element shouldn't exist)
- findBy*   - Returns promise, waits for element (async)
- getAllBy* - Returns array of elements

User interactions:
- await user.click(element)
- await user.type(input, 'text')
- await user.clear(input)
- await user.selectOptions(select, 'value')
- await user.upload(input, file)
- await user.keyboard('{Enter}')
- await user.tab()
- await user.hover(element)
*/

// ============================================
// ANTI-PATTERNS TO AVOID
// ============================================
/*
❌ Don't test implementation details:
   wrapper.vm.someMethod()
   wrapper.find('.internal-class')
   expect(wrapper.vm.data).toBe('value')

✅ Test user-visible behavior:
   screen.getByRole('button')
   await user.click(button)
   expect(screen.getByText('Success')).toBeInTheDocument()

❌ Don't overuse test IDs:
   getByTestId('submit-button')

✅ Use accessible queries:
   getByRole('button', { name: 'Submit' })

❌ Don't use fireEvent:
   fireEvent.click(button)

✅ Use userEvent:
   await user.click(button)
*/
