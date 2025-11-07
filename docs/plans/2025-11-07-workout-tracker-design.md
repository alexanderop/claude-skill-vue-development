# Workout Tracker App - Design Document

**Date:** 2025-11-07
**Type:** Minimalistic strength training tracker for personal use
**Tech Stack:** Vue 3 + TypeScript + Vite + Pinia

---

## Overview

A minimalistic workout tracker focused on strength training that allows users to:
- Log workouts freestyle (no rigid program structure)
- Easily repeat past workouts with pre-filled data
- Track progression over time by viewing weight increases
- Add custom exercises for any equipment type (barbell, dumbbell, machine, cable)

**Core Philosophy:** Simple, fast logging with powerful progression insights.

---

## User Flow

### 1. Home Screen
Two primary actions:
- **"Start New Workout"** button (prominent)
- **"Recent Workouts"** list showing last 5-10 workouts (clickable to repeat)

### 2. Active Workout Screen
- Add exercises one by one via search/autocomplete
- For each exercise: log multiple sets (weight + reps per set)
- If repeating a past workout: exercises pre-filled with previous weights/reps (fully editable)
- **"Finish Workout"** button saves with timestamp

### 3. Exercise Library
- Browse all available exercises
- Add new custom exercises (name + equipment type)
- Pre-populated with 20-30 common exercises (bench press, squat, deadlift, etc.)
- Searchable and filterable by equipment type

### 4. Exercise History/Progression
- Accessible by tapping any exercise
- Table view: Past performances (date, all sets with weight × reps)
- Chart view: Line graph showing weight progression over time
- Flexible date range filter: 7 days, 30 days, 90 days, all time

---

## Architecture

### Tech Stack
- **Vue 3** with Composition API
- **TypeScript** (required)
- **Vite** (build tooling)
- **Pinia** with Composition API (state management)
- **LocalStorage** for data persistence (no backend needed)
- **Vitest + Vue Testing Library** (unit/component tests)
- **Playwright** (E2E tests)

### Feature-Based Structure

```
src/
├── features/
│   ├── workout/
│   │   ├── components/
│   │   │   ├── WorkoutHome.vue          # Main screen
│   │   │   ├── ActiveWorkout.vue        # Logging in progress
│   │   │   ├── ExerciseSelector.vue     # Search/add exercises
│   │   │   ├── SetLogger.vue            # Log sets (weight/reps)
│   │   │   └── WorkoutCard.vue          # Past workout summary
│   │   ├── composables/
│   │   │   └── useActiveWorkout.ts      # Manage current session
│   │   └── stores/
│   │       └── workoutStore.ts
│   │
│   ├── exercises/
│   │   ├── components/
│   │   │   ├── ExerciseLibrary.vue      # Browse/manage exercises
│   │   │   ├── AddExerciseForm.vue      # Create custom exercise
│   │   │   └── ExerciseHistory.vue      # Progression view
│   │   ├── composables/
│   │   │   └── useExerciseProgression.ts # Calculate progression
│   │   └── stores/
│   │       └── exerciseStore.ts
│   │
│   └── shared/
│       ├── components/
│       │   ├── ProgressChart.vue        # Line chart component
│       │   └── UnitToggle.vue           # Switch kg/lbs
│       └── composables/
│           └── useLocalStorage.ts       # Persistence layer
```

---

## Data Structure

### Pinia Stores (Composition API)

**1. Workout Store** (`stores/workouts.ts`)
- State: `activeWorkout`, `workoutHistory[]`
- Actions:
  - `startNewWorkout()` - Initialize empty workout
  - `startFromPrevious(workoutId)` - Pre-fill from past workout
  - `addExercise(exerciseId)` - Add exercise to active workout
  - `logSet(exerciseId, weight, reps)` - Add set to exercise
  - `finishWorkout()` - Save and clear active workout

**2. Exercise Store** (`stores/exercises.ts`)
- State: `exercises[]` (custom + pre-populated)
- Actions:
  - `addExercise(name, equipment)` - Create custom exercise
  - `searchExercises(query)` - Filter by name/equipment
  - `getExerciseHistory(exerciseId)` - All past performances

### Core TypeScript Types

```typescript
type Workout = {
  id: string
  date: Date
  exercises: WorkoutExercise[]
  duration?: number // optional: track workout length
}

type WorkoutExercise = {
  exerciseId: string
  exerciseName: string
  sets: Set[]
}

type Set = {
  weight: number
  reps: number
  unit: 'kg' | 'lbs'
}

type Exercise = {
  id: string
  name: string
  equipment: 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'other'
  isCustom: boolean
}
```

### Data Persistence
- **LocalStorage** with JSON serialization
- Auto-save on every change during active workout
- Store rehydration on app load
- Namespace: `workout-tracker:*`

---

## Key Components

### WorkoutHome.vue
- Large "Start New Workout" button
- List of recent workouts (shows date, exercise count, summary)
- Tap workout card to repeat with pre-filled data

### ActiveWorkout.vue
- Current exercises list (collapsible per exercise)
- "Add Exercise" button (opens ExerciseSelector)
- Set logging interface per exercise (SetLogger component)
- "Finish Workout" button (shows summary before saving)

### ExerciseSelector.vue
- Search input with autocomplete
- Filter by equipment type (chips/tags)
- "Add Custom Exercise" link
- Tap exercise to add to active workout

### SetLogger.vue
- Simple form: weight input + reps input
- "Add Set" button
- Shows all logged sets for current exercise with delete option (swipe)
- If repeating workout: shows "Last time: 100kg × 8" hint

### ExerciseHistory.vue
- Table: Date | Sets (e.g., "3 × 100kg × 8") | sortable
- Chart: Line graph of highest weight over time
- Date range selector: "7D", "30D", "90D", "All"
- Shows trend indicator (↑ improving, → plateau, ↓ declining)

### ProgressChart.vue
- Reusable line chart component (could use Chart.js or lightweight alternative)
- X-axis: Dates, Y-axis: Weight
- Each point = highest weight lifted that day for that exercise
- Responsive, touch-friendly

---

## UX Details

### Minimalistic Design Principles
- **Single-page app feel**: Minimal navigation, smooth transitions
- **Quick logging**: Under 5 seconds per set
- **Large touch targets**: Mobile-first design
- **Numeric keyboards**: Auto-trigger for weight/reps inputs
- **Visual feedback**: Green highlight if you beat previous weight

### Smart Pre-filling
When repeating a workout:
- Each exercise shows last performed weights/reps per set
- Editable before/during logging
- Visual indicator: "Last time: 100kg × 8" next to input fields
- Helps user know what to beat

### Key Interactions
- **Swipe to delete** a set (if logged incorrectly)
- **Long-press exercise** in active workout to see quick history preview
- **Tap exercise name** anywhere to open full progression view
- **Tap "Finish Workout"** → shows summary with total volume/exercises

### Visual Feedback
- Green highlight on set if weight > previous best
- Progress badge on exercise cards (e.g., "+5kg since last time")
- Simple animations for adding/removing sets

---

## Progression Visualization

### Table View
- Chronological list (most recent first)
- Columns: Date | Sets Summary (e.g., "3 × 100kg × 8")
- Tap row to see detailed set-by-set breakdown

### Chart View
- Line graph with date range filter
- **X-axis:** Dates (auto-scaled based on range)
- **Y-axis:** Weight (auto-scaled, always starts at 0)
- **Data point:** Highest weight lifted that day for the exercise
- **Tooltip on tap:** Shows date, weight, reps

### Date Range Filters
- Quick select: "7D", "30D", "90D", "All"
- Default: Last 30 days

---

## Error Handling & Edge Cases

### Error Handling
- **LocalStorage full**: Toast notification + fallback to session-only mode
- **Invalid inputs**: Weight/reps must be positive numbers (inline validation)
- **Empty workouts**: Can't finish workout with zero exercises
- **Duplicate exercise names**: Case-insensitive check, prevent duplicates

### Edge Cases
- **First-time user**: Pre-populate 20-30 common exercises on first load
- **No internet**: Fully offline-capable (no backend)
- **Unit switching (kg ↔ lbs)**: Convert all historical data on-the-fly for display
- **Deleting exercises**: Warn if exercise has history; soft-delete (hide from library, preserve workout history)
- **Long workout sessions**: Auto-save every change to prevent data loss
- **Date/time edge cases**: Use ISO 8601 format, handle timezone correctly

---

## Testing Strategy

### Unit Tests (Vitest)
- Pure functions for progression calculations
- Weight/unit conversion utilities
- Date range filtering logic
- Store actions/getters

**Examples:**
- `calculateMaxWeight(sets: Set[]): number`
- `convertWeight(value: number, from: 'kg' | 'lbs', to: 'kg' | 'lbs'): number`
- `filterWorkoutsByDateRange(workouts: Workout[], range: string): Workout[]`

### Component Tests (Vue Testing Library)
- User interactions: add set, finish workout, repeat workout
- Form validation: invalid weight/reps inputs
- Pre-filling behavior when repeating workouts
- Exercise search/filtering

**Key tests:**
- User can log a complete workout and see it in history
- Pre-filled data appears correctly when repeating workout
- Validation prevents negative weights/reps
- Unit toggle updates displayed values

### E2E Tests (Playwright)
- Complete user journey: Start → add exercises → log sets → finish → view progression
- Repeat previous workout flow
- Add custom exercise → use in workout → verify in history
- Progression chart displays correctly with filtered date ranges

---

## MVP Exclusions (YAGNI)

These features are explicitly **NOT** included in the MVP:
- Social features, sharing workouts
- Workout plans/programs (structured routines)
- Timers or rest period tracking
- Body weight tracking
- Progress photos/videos
- Nutrition tracking
- Workout reminders/notifications
- Cloud sync or multi-device support
- Exercise form videos/instructions
- Personal records (PR) badges
- Workout templates (user can repeat past workouts instead)

---

## Implementation Notes

### Pre-populated Exercises
Include these common exercises on first load:
- **Barbell:** Bench Press, Squat, Deadlift, Overhead Press, Barbell Row
- **Dumbbell:** Dumbbell Press, Dumbbell Row, Dumbbell Curl, Lateral Raise
- **Machine:** Leg Press, Lat Pulldown, Chest Press, Leg Curl, Leg Extension
- **Cable:** Cable Fly, Cable Row, Tricep Pushdown, Cable Curl
- **Other:** Pull-up, Chin-up, Dip, Push-up

### LocalStorage Structure
```json
{
  "workout-tracker:workouts": [...],
  "workout-tracker:exercises": [...],
  "workout-tracker:settings": {
    "unit": "kg"
  }
}
```

### Functional Core, Imperative Shell
- **Core logic** (pure functions): progression calculations, weight conversions, date filtering
- **Shell** (Vue composables): reactive wrappers around core logic, localStorage integration

---

## Success Criteria

The MVP is successful if a user can:
1. Start a new workout and log exercises with sets (weight + reps)
2. Finish workout and see it in history
3. Repeat a previous workout with pre-filled data
4. Add custom exercises and use them immediately
5. View progression for any exercise over flexible date ranges
6. See at a glance if they're getting stronger (chart trend + weight comparison)

All of this should feel **fast, simple, and clutter-free**.
