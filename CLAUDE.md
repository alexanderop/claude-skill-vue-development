# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Claude Code Agent Skill** for Vue.js development. It provides expert guidance on building high-quality Vue.js applications with TypeScript, emphasizing testing-first development, functional patterns, and maintainable architecture.

**Key Concept:** This is NOT a Vue.js application itself - it's documentation and templates that Claude Code reads to provide better guidance when helping users build Vue applications.

## Repository Structure

```
.claude/skills/vue-development/     # The actual skill that Claude reads
├── SKILL.md                        # Main skill instructions (entry point)
├── PATTERNS.md                     # Functional core/imperative shell, feature-based architecture
├── STATE-MANAGEMENT.md             # Pinia with Composition API patterns
├── TESTING.md                      # Testing Library best practices
├── TYPESCRIPT.md                   # Advanced TypeScript patterns
└── templates/                      # Code templates
    ├── component.template.vue      # Vue component template
    ├── composable.template.ts      # Composable template
    ├── store.template.ts           # Pinia store with Composition API
    └── test.template.ts            # Component test template

README.md                           # Installation and usage guide for users
CONTRIBUTING.md                     # Contribution guidelines
USAGE.md                            # Practical examples of skill in action
INSTALL.md                          # Quick installation instructions
```

## How This Skill Works

### Skill Architecture

1. **Entry Point:** `.claude/skills/vue-development/SKILL.md`
   - Contains YAML frontmatter with `name` and `description`
   - Claude uses the description to decide when to invoke this skill
   - Links to other markdown files for detailed guidance

2. **Progressive Loading:**
   - Claude loads SKILL.md first
   - Supporting files (PATTERNS.md, TESTING.md, etc.) are loaded only when needed
   - Keeps context usage efficient

3. **Templates:**
   - Provide concrete examples of best practices
   - Used as reference when creating new components, composables, stores, tests

### Core Principles Taught by This Skill

1. **Testing-First Mindset**
   - Test user behavior, never implementation details
   - Use Testing Library (never `wrapper.vm`)
   - Stack: Vitest + Vue Testing Library + Playwright

2. **Functional Core, Imperative Shell**
   - Pure business logic in separate files (no Vue dependencies)
   - Reactive wrappers in composables
   - Makes testing trivial, framework-agnostic

3. **Feature-Based Architecture**
   - Organize by features, not file types
   - Structure: `src/features/{feature}/{components,composables,stores,tests}`

4. **Composables Best Practices**
   - Single Responsibility Principle
   - Explicit error state (return `{ data, error, loading }`)
   - No UI logic (no toast/alert calls)
   - Use readonly() to prevent mutations

5. **State Management**
   - Single Responsibility - Each action does ONE thing
   - Explicit Error Handling - Return `{ data, error }`, never throw
   - No UI Logic - Store never calls toast/alert
   - Use Pinia with Composition API for global state
   - Server state → pinia-colada / TanStack Query
   - Cross-component → Composables or provide/inject

## Making Changes to This Skill

### Editing Skill Files

When modifying the skill documentation:

1. **Main skill file:** `.claude/skills/vue-development/SKILL.md`
   - Must have valid YAML frontmatter
   - `description` field determines when Claude uses the skill
   - Keep concise, link to supporting files for details

2. **Supporting files:** PATTERNS.md, TESTING.md, STATE-MANAGEMENT.md, TYPESCRIPT.md
   - Provide detailed guidance on specific topics
   - Use code examples extensively
   - Show both ✅ good and ❌ bad examples

3. **Templates:** `.claude/skills/vue-development/templates/`
   - Must be complete, runnable examples
   - Include comprehensive comments
   - Follow all best practices taught by the skill

### Documentation Files

- **README.md:** User-facing guide (installation, what the skill does, core principles)
- **USAGE.md:** Practical examples of the skill in action
- **INSTALL.md:** Quick installation instructions
- **CONTRIBUTING.md:** Guidelines for contributors

### Testing Changes

After editing skill files:

```bash
# No build step needed - skills are markdown files
# Claude reads them directly

# Verify YAML frontmatter is valid
head -n 5 .claude/skills/vue-development/SKILL.md

# Restart Claude Code to load changes
# Skills are loaded when Claude Code starts
```

### Common Tasks

**Add a new pattern:**
1. Edit `.claude/skills/vue-development/PATTERNS.md` or create a new .md file
2. Link to it from SKILL.md if it's a major new topic
3. Update README.md if it's a user-facing change

**Add a new template:**
1. Create template in `.claude/skills/vue-development/templates/`
2. Follow naming: `{type}.template.{ext}` (e.g., `form.template.vue`)
3. Include comprehensive comments
4. Reference it from relevant .md files

**Update installation instructions:**
1. Edit `INSTALL.md` for quick reference
2. Edit `README.md` "Installation" section for full details

## Design Decisions

### Why Markdown Files?

- Claude reads markdown natively
- Easy to version control and review
- No build step required
- Portable and human-readable

### Why Separate Files (PATTERNS.md, TESTING.md, etc.)?

- **Progressive loading:** Claude only loads what's needed
- **Maintainability:** Each file focuses on one topic
- **Context efficiency:** Prevents loading entire skill every time

### Why Templates Directory?

- Concrete examples are more valuable than abstract descriptions
- Templates serve as both documentation and reference
- Users can copy-paste and modify for their needs

### Why Feature-Based Architecture Emphasis?

- Scales better than organizing by file type
- Related code stays together
- Easier to understand and modify features
- Teams can work on features independently

### Why Functional Core, Imperative Shell?

- Business logic becomes framework-agnostic
- Testing is trivial (pure functions, no mocking)
- Easier to migrate if framework changes
- Forces separation of concerns

## Stack Requirements

This skill assumes projects use:

- **Vue 3** with Composition API
- **TypeScript** (required)
- **Vite** (build tooling)
- **Vitest** + **Vue Testing Library** (unit/component tests)
- **Pinia** (state management)
- **Playwright** (E2E tests)

## Key Anti-Patterns

The skill explicitly teaches to avoid:

- ❌ Testing implementation details (`wrapper.vm`)
- ❌ Event buses for state management
- ❌ Throwing from composables (return error state instead)
- ❌ UI logic in composables (toasts, alerts)
- ❌ `as` type assertions (use type guards)
- ❌ `any` type (use generics or `unknown`)

## Resources Referenced

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Testing Library](https://testing-library.com/docs/vue-testing-library/intro/)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)
- [Claude Code Agent Skills Documentation](https://docs.claude.com/en/docs/claude-code/agent-skills)

## Contributing Guidelines

See [CONTRIBUTING.md](CONTRIBUTING.md) for:
- How to report issues
- Suggesting enhancements
- Pull request process
- Documentation standards
- Code of conduct
