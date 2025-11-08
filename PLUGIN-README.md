# Vue Development Plugin for Claude Code

Modern Vue 3 development skill that enforces TypeScript-first patterns, Composition API best practices, and user-behavior testing.

## Overview

This plugin provides a comprehensive skill for building Vue 3 applications with:

- **TypeScript-first patterns** using generics instead of runtime validation
- **Modern Composition API** with `defineModel()` for v-model bindings
- **User-behavior testing** with Testing Library (not implementation details)
- **API mocking** with MSW for realistic test scenarios
- **File-based routing** patterns with Nuxt/unplugin-vue-router
- **Composable best practices** with clear SRP and error handling

## Installation

### From Local Repository

```bash
# Add the marketplace
/plugin marketplace add /path/to/vue-development-skill

# Install the plugin
/plugin install vue-development@vue-development-marketplace
```

### From GitHub (once published)

```bash
# Add the marketplace
/plugin marketplace add alexanderopalic/vue-development-skill

# Install the plugin
/plugin install vue-development@vue-development-marketplace
```

## Usage

Once installed, Claude Code will automatically invoke this skill when you're working on Vue 3 projects. The skill activates for tasks like:

- Creating Vue 3 components
- Implementing v-model bindings
- Defining props and emits
- Setting up routes
- Writing component tests
- Creating composables

You can also manually invoke the skill:

```
Skill: vue-development
```

## Required Permissions

This plugin requires the following permissions to function properly. Add to your `.claude/settings.json`:

```json
{
  "allowedSkills": ["vue-development"],
  "allowedBashCommands": {
    "npm": ["install", "run", "test"]
  }
}
```

## Features

### Red Flags Detection

The skill automatically catches 12 common anti-patterns:

- Runtime validation via PropType/withDefaults instead of TypeScript generics
- Manual v-model implementation instead of `defineModel()`
- Testing implementation details instead of user behavior
- Inline event handlers in templates
- And more...

### Component Development Workflow

Structured TodoWrite checklist ensures:

1. Props defined with TypeScript generics
2. V-model uses `defineModel()`
3. Events use `defineEmits<TypedSignature>()`
4. Tests written with Testing Library
5. API calls mocked with MSW

### Comprehensive References

Access detailed patterns via `@references/`:

- `component-patterns.md` - Props, emits, v-model, templates, naming
- `composable-patterns.md` - Naming, anatomy, SRP, error handling
- `routing-patterns.md` - File-based routing, params, navigation, guards
- `testing-patterns.md` - Testing Library, MSW, async testing
- `testing-composables.md` - Independent vs dependent composable testing

## What This Skill Enforces

### ✅ DO

```typescript
// TypeScript generics for props
const props = defineProps<{ userId: string }>()

// defineModel for v-model
const modelValue = defineModel<string>()

// Testing Library for user behavior
await user.click(screen.getByRole('button', { name: /submit/i }))

// MSW for API mocking
server.use(http.get('/api/users', () => HttpResponse.json(users)))
```

### ❌ DON'T

```typescript
// Runtime validation
const props = defineProps({
  userId: { type: String, required: true }
})

// Manual v-model
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

// Testing implementation details
expect(wrapper.vm.internalState).toBe(true)

// Real API calls in tests
await fetch('/api/users')
```

## Architecture

The skill uses a **reference architecture** for optimal performance:

- **Main SKILL.md** (1,216 words) - Quick rules, red flags, workflows
- **Reference docs** (5,465 words) - Detailed patterns loaded on-demand
- **On-demand loading** - Large content only accessed when needed

This ensures fast skill invocation while maintaining comprehensive guidance.

## Real-World Impact

Verified metrics from production usage:

- **Before skill:** 37.5% compliance (3/8 components followed patterns)
- **With skill:** 100% compliance (8/8 components correct)
- **Key improvement:** Eliminated all manual v-model implementations
- **Secondary wins:** Consistent TypeScript usage, proper test patterns

## Version History

### 0.1.0 (Initial Plugin Release)

- Converted from standalone skill to Claude Code plugin
- Added marketplace distribution
- Preserved all skill functionality and references
- Added plugin metadata and installation instructions

## Requirements

- Claude Code installed
- Vue 3 project (Composition API)
- TypeScript
- Node.js and npm

## Support

- **Issues:** [GitHub Issues](https://github.com/alexanderopalic/vue-development-skill/issues)
- **Repository:** [vue-development-skill](https://github.com/alexanderopalic/vue-development-skill)

## License

MIT - See LICENSE file for details

## Author

Alexander Opalic

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the skill with real Vue projects
5. Submit a pull request

## See Also

- [Claude Code Plugins Documentation](https://docs.claude.com/en/plugins)
- [Vue 3 Documentation](https://vuejs.org/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [MSW Documentation](https://mswjs.io/)
