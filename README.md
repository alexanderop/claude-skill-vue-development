# Vue Development Plugin for Claude Code

A comprehensive, test-driven Vue 3 development skill that enforces modern best practices with 100% compliance under pressure.

**Now available as a Claude Code plugin!** See [PLUGIN-README.md](PLUGIN-README.md) for installation and usage instructions.

## Overview

This skill teaches Claude agents to write production-quality Vue 3 code using:
- **TypeScript-first** patterns (no runtime validation)
- **Modern Composition API** (defineModel, not manual props)
- **User-behavior testing** (Testing Library, not implementation details)
- **Clean composables** (single responsibility, no UI logic)

## Plugin Structure

```
.claude-plugin/
├── plugin.json (Plugin manifest)
├── marketplace.json (Marketplace configuration)
└── skills/
    └── vue-development/
        ├── SKILL.md (1,216 words)
        │   ├── Red flags (12 anti-patterns)
        │   ├── Quick rules (components, testing, routing, composables)
        │   ├── Essential patterns with examples
        │   ├── Rationalization table (11 excuses countered)
        │   └── Quick checklists (4 domains)
        └── references/
            ├── component-patterns.md (616 words)
            ├── composable-patterns.md (1,848 words)
            ├── routing-patterns.md (589 words)
            ├── testing-composables.md (1,627 words)
            └── testing-patterns.md (785 words)

Total: 6,681 words (1,216 main + 5,465 references)
```

**Legacy Structure:** The original skill files remain in `.claude/skills/vue/` for backward compatibility during migration.

## What It Covers

### Components (`component-patterns.md`)
- Props: `defineProps<{ }>()` with TypeScript, no `const` unless needed
- Emits: `const emit = defineEmits<{ event: [args] }>()`
- V-model: `defineModel<type>()` (NOT manual modelValue)
- Templates: `:prop` shorthand, `#slot` shorthand, explicit `<template>` tags
- Naming: PascalCase or kebab-case, general → specific

### Composables (`composable-patterns.md`)
- Naming: `useFeatureName.ts` with PascalCase
- Structure: Primary state → Metadata → Methods
- Single responsibility principle
- Error exposure (no console.error only)
- NO UI logic (toasts/alerts belong in components)
- Functional core, imperative shell pattern

### Testing Components (`testing-patterns.md`)
- PRIMARY: `@testing-library/vue` for user behavior
- API mocking: MSW (`msw`)
- NEVER: `setTimeout()` in tests, testing internal state
- Async: `findBy*` queries or `waitFor()`
- Query priority: accessibility > test IDs

### Testing Composables (`testing-composables.md`)
- **Independent composables**: Test directly (no lifecycle/inject)
- **Dependent composables**: Use `withSetup` helper (lifecycle hooks)
- **Inject composables**: Use `useInjectedSetup` helper (provide/inject)
- Patterns for async, localStorage, document title, etc.

### Routing (`routing-patterns.md`)
- File-based routing with unplugin-vue-router
- AVOID: `index.vue` → use route groups `(name).vue`
- Explicit params: `[userId]` not `[id]`
- Navigation: Named routes with typed params
- Route guards and meta fields

## Effectiveness

### Before Skill: 37.5% compliance
- Props: 0/3 correct (used const unnecessarily, runtime validation)
- Emits: 0/1 correct (array syntax, no types)
- V-model: 0/1 correct (manual modelValue)
- Testing: 3/4 correct (rejected setTimeout but missed Testing Library)

### After Skill: 100% compliance
- Props: ✅ TypeScript generics, no const when unused
- Emits: ✅ Typed event signatures
- V-model: ✅ defineModel() usage
- Testing: ✅ Proper async, no setTimeout
- Composables: ✅ Correct naming, structure, error handling

**Improvement: 167% increase**

## Key Features

### Red Flags (Auto-Detection)
Agents STOP when they catch themselves:
- "For speed" / "quick demo" → shortcuts
- Manual modelValue → use defineModel()
- setTimeout() in tests → proper async
- UI logic in composables → expose error state
- Generic `[id]` params → explicit names

### Rationalization Table
Counters 11 common excuses:
- "TypeScript is too verbose" → It's actually LESS code
- "We can clean it up later" → Write it right the first time
- "Composables can show toasts" → UI belongs in components
- "counter.ts is fine" → Must use 'use' prefix

### Reference Architecture
Heavy content loads on-demand:
- Components → 616 words
- Composables → 1,848 words
- Routing → 589 words
- Testing (components) → 785 words
- Testing (composables) → 1,627 words

Main skill stays small (1,216 words) for fast initial load.

## Installation

### As a Plugin (Recommended)

See [PLUGIN-README.md](PLUGIN-README.md) for detailed installation instructions.

**Quick Start:**

```bash
# Add the marketplace
/plugin marketplace add alexanderopalic/vue-development-skill

# Install the plugin
/plugin install vue-development@vue-development-marketplace
```

### Legacy Installation (Direct Skill)

1. Place skill files in `.claude/skills/vue/`
2. The skill auto-loads when:
   - Creating Vue 3 components
   - Implementing v-model
   - Defining props/emits
   - Setting up routes
   - Writing Vue tests
   - Creating composables

Or invoke manually:
```
Skill: vue-development
```

## Testing Methodology

Created using **Test-Driven Development for Documentation**:

1. **RED Phase**: Created 8 pressure scenarios, ran baseline tests without skill
2. **GREEN Phase**: Wrote minimal skill addressing observed failures
3. **REFACTOR Phase**: Closed loopholes, achieved 100% compliance

All rationalizations captured from real agent behavior under:
- Time pressure ("ASAP", "ship tonight")
- Authority pressure ("just make it work")
- Exhaustion pressure ("debugging for 2 hours")
- Confusion pressure ("I think I need to...")

## Documentation

- `SKILL-CREATION-SUMMARY.md` - TDD methodology and results
- `OPTIMIZATION-SUMMARY.md` - Reference architecture details
- `FINAL-STATUS.md` - Complete status and metrics
- `test-scenarios/` - All baseline and with-skill test results

## Usage Examples

### Component Creation
**Without skill:** Used runtime validation, `const props =` unnecessarily, no emits types
**With skill:** TypeScript generics, correct const usage, fully typed emits

### V-Model Implementation
**Without skill:** Manual modelValue prop + update:modelValue emit
**With skill:** `defineModel<string>()` for clean two-way binding

### Testing
**Without skill:** setTimeout(1000), testing internal state
**With skill:** findBy* queries, user-visible behavior only

### Composables
**Without skill:** UI logic in composables, missing 'use' prefix, console.error only
**With skill:** Proper naming, error exposure, no UI logic, single responsibility

## Requirements

- Vue 3.4+ (for defineModel)
- TypeScript
- Vitest (recommended for testing)
- @testing-library/vue
- msw (for API mocking)
- unplugin-vue-router (for file-based routing)

## Contributing

The skill enforces best practices from:
- Official Vue 3 documentation
- Vue Composition API RFC
- Testing Library principles
- Kent C. Dodds testing philosophy
- Community best practices from alexop.dev

## Status

✅ **PRODUCTION-READY**

- 100% compliance rate in testing
- 25% smaller main file (1,216 vs original 1,618 words)
- 312% more comprehensive (6,681 total words)
- Tested under multiple pressure scenarios
- Zero new rationalizations after optimization

## License

Created following Claude Code superpowers methodology.
