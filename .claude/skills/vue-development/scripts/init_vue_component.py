#!/usr/bin/env python3
"""
Vue Component Initializer - Creates a new Vue component with test file

Usage:
    init_vue_component.py <component-name> --path <path> [--type <type>]

Examples:
    init_vue_component.py UserProfile --path src/features/user/components
    init_vue_component.py BaseButton --path src/shared/components --type base
    init_vue_component.py TodoList --path src/features/todos/components --type feature
"""

import sys
from pathlib import Path


COMPONENT_TEMPLATE = '''<script setup lang="ts">
// {component_name}.vue - {description}

// Props
interface Props {{
  // TODO: Define props
}}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{{
  // TODO: Define emits
}}>()

// State
// TODO: Add component state

// Computed
// TODO: Add computed properties

// Methods
// TODO: Add methods
</script>

<template>
  <div class="{css_class}">
    <!-- TODO: Add template content -->
    <p>{{ component_name }} works!</p>
  </div>
</template>

<style scoped>
.{css_class} {{
  /* TODO: Add component styles */
}}
</style>
'''

TEST_TEMPLATE = '''import {{ describe, it, expect }} from 'vitest'
import {{ render, screen }} from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import {component_name} from '../{component_name}.vue'

describe('{component_name}', () => {{
  // Test naming: "should [verb] [expected outcome] when [trigger event]"

  it('should render successfully', () => {{
    // Arrange
    render({component_name}, {{
      props: {{
        // TODO: Add required props
      }},
    }})

    // Assert - Query by role/label, not implementation details
    // TODO: Add assertions using getByRole, getByText, etc.
    expect(screen.getByText('{component_name} works!')).toBeInTheDocument()
  }})

  // TODO: Add more tests following user behavior patterns
  // Example test structure:
  //
  // it('should update counter when increment button is clicked', async () => {{
  //   const user = userEvent.setup()
  //   render({component_name})
  //
  //   const button = screen.getByRole('button', {{ name: /increment/i }})
  //   await user.click(button)
  //
  //   expect(screen.getByText('Count: 1')).toBeInTheDocument()
  // }})
}})

// Page Object Pattern (optional, for complex components)
// const get{component_name}Elements = () => ({{
//   container: screen.getByTestId('{css_class}'),
//   button: screen.getByRole('button', {{ name: /action/i }}),
//   input: screen.getByLabelText(/label/i),
// }})
'''


def to_kebab_case(name: str) -> str:
    """Convert PascalCase or camelCase to kebab-case."""
    import re
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1-\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1-\2', s1).lower()


def init_component(component_name: str, path: str, comp_type: str = 'feature'):
    """
    Initialize a new Vue component with test file.

    Args:
        component_name: Name of the component (PascalCase)
        path: Path where the component should be created
        comp_type: Type of component ('feature', 'base', 'shared')

    Returns:
        Path to created component, or None if error
    """
    # Validate component name is PascalCase
    if not component_name[0].isupper():
        print(f"❌ Error: Component name must be PascalCase (e.g., 'UserProfile', not '{component_name}')")
        return None

    # Determine paths
    component_dir = Path(path).resolve()
    component_file = component_dir / f"{component_name}.vue"

    # Create tests directory at the same level as components
    tests_dir = component_dir.parent / 'tests'
    test_file = tests_dir / f"{component_name}.test.ts"

    # Check if component already exists
    if component_file.exists():
        print(f"❌ Error: Component already exists: {component_file}")
        return None

    # Create component directory if needed
    try:
        component_dir.mkdir(parents=True, exist_ok=True)
        tests_dir.mkdir(parents=True, exist_ok=True)
    except Exception as e:
        print(f"❌ Error creating directories: {e}")
        return None

    # Generate CSS class name
    css_class = to_kebab_case(component_name)

    # Determine description based on type
    descriptions = {
        'base': 'Base component for reusable UI elements',
        'feature': 'Feature-specific component',
        'shared': 'Shared component used across features'
    }
    description = descriptions.get(comp_type, 'Vue component')

    # Create component file
    component_content = COMPONENT_TEMPLATE.format(
        component_name=component_name,
        css_class=css_class,
        description=description
    )

    try:
        component_file.write_text(component_content)
        print(f"✅ Created component: {component_file}")
    except Exception as e:
        print(f"❌ Error creating component file: {e}")
        return None

    # Create test file
    test_content = TEST_TEMPLATE.format(
        component_name=component_name,
        css_class=css_class
    )

    try:
        test_file.write_text(test_content)
        print(f"✅ Created test file: {test_file}")
    except Exception as e:
        print(f"❌ Error creating test file: {e}")
        return None

    # Print next steps
    print(f"\n✅ Component '{component_name}' initialized successfully!")
    print("\nNext steps:")
    print("1. Implement the component props, emits, and template")
    print("2. Write tests following Testing Library best practices")
    print("3. Test user behavior, not implementation details")
    print("4. Use getByRole/getByLabelText to query elements")
    print(f"\nFiles created:")
    print(f"  - {component_file}")
    print(f"  - {test_file}")

    return component_file


def main():
    if len(sys.argv) < 4 or sys.argv[2] != '--path':
        print("Usage: init_vue_component.py <component-name> --path <path> [--type <type>]")
        print("\nComponent name requirements:")
        print("  - PascalCase (e.g., 'UserProfile', 'BaseButton', 'TodoList')")
        print("\nComponent types:")
        print("  - feature: Feature-specific component (default)")
        print("  - base: Reusable base component")
        print("  - shared: Shared across features")
        print("\nExamples:")
        print("  init_vue_component.py UserProfile --path src/features/user/components")
        print("  init_vue_component.py BaseButton --path src/shared/components --type base")
        print("  init_vue_component.py TodoList --path src/features/todos/components")
        sys.exit(1)

    component_name = sys.argv[1]
    path = sys.argv[3]

    # Parse optional --type flag
    comp_type = 'feature'
    if len(sys.argv) > 4 and sys.argv[4] == '--type' and len(sys.argv) > 5:
        comp_type = sys.argv[5]

    print(f"🚀 Initializing Vue component: {component_name}")
    print(f"   Location: {path}")
    print(f"   Type: {comp_type}")
    print()

    result = init_component(component_name, path, comp_type)

    if result:
        sys.exit(0)
    else:
        sys.exit(1)


if __name__ == "__main__":
    main()
