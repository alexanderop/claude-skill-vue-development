# Vue Starter Project

A minimal Vite + Vue 3 + TypeScript project demonstrating best practices from the vue-development skill.

## Features

- **Vite** - Fast build tool and dev server
- **Vue 3** with Composition API and `<script setup>`
- **TypeScript** - Full type safety
- **Pinia** - State management with Composition API
- **Vue Router** - Client-side routing
- **Testing Library** - Component testing (Vitest)
- **Playwright** - E2E testing
- **Feature-based architecture** - Organized by features, not file types

## Project Structure

```
src/
├── features/           # Feature-based organization
│   └── counter/        # Example feature
│       ├── components/ # Feature-specific components
│       ├── composables/# Feature composables
│       ├── stores/     # Feature stores
│       └── tests/      # Feature tests
├── shared/            # Shared code
│   ├── components/    # Shared UI components
│   ├── composables/   # Shared composables
│   └── utils/         # Utility functions
├── router/            # Vue Router configuration
├── App.vue            # Root component
└── main.ts            # Application entry point
```

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Build for production
npm run test       # Run unit/component tests
npm run test:ui    # Run tests with UI
npm run test:e2e   # Run E2E tests
```

## Key Patterns

This starter demonstrates:

1. **Feature-based architecture** - Code organized by feature
2. **Functional core/imperative shell** - See counter example
3. **Pinia with Composition API** - Type-safe state management
4. **Testing Library** - Test user behavior, not implementation
5. **Composable best practices** - Single responsibility, explicit errors
6. **TypeScript patterns** - Type guards, discriminated unions

## Learning Resources

Check the vue-development skill references/ directory for detailed patterns and examples.
