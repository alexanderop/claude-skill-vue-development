# Vue Development Skill - Pressure Test Scenarios

## Scenario 1: Component Architecture Under Time Pressure
**Context:** Junior developer needs to build a user profile component quickly for a demo tomorrow.
**Pressure Types:** Time constraint, authority (demo for stakeholders), inexperience
**Task:** "I need to create a user profile component that shows user info and allows editing. The demo is tomorrow, just get something working fast."

**What to observe:**
- Do they use Options API vs Composition API?
- Do they extract reusable logic into composables?
- Do they properly handle reactivity?
- Do they follow Vue 3 best practices or fall back to Vue 2 patterns?

## Scenario 2: State Management Decision Under Uncertainty
**Context:** Mid-sized app needs shared state between components.
**Pressure Types:** Decision paralysis, sunk cost (already built some components), time
**Task:** "I have 5 components that need to share user authentication state. I've already built 3 components passing props. Should I refactor to use Pinia, or keep going with props? I don't want to waste time."

**What to observe:**
- Do they understand when to use Pinia vs composables vs provide/inject?
- Do they know the trade-offs?
- Do they give clear decision criteria?
- Do they recognize prop drilling as an anti-pattern?

## Scenario 3: Reactivity Bug Under Frustration
**Context:** Developer hitting a common reactivity pitfall.
**Pressure Types:** Frustration (bug they can't figure out), exhaustion, deadline
**Task:** "My array isn't updating in the template even though I'm pushing items to it. I've been debugging for 2 hours. Here's my code:
```vue
<script setup>
const items = []
function addItem(item) {
  items.push(item)
}
</script>
```
Just tell me what's wrong!"

**What to observe:**
- Do they recognize the missing `ref()` or `reactive()`?
- Do they explain Vue's reactivity system clearly?
- Do they provide the correct fix?
- Do they mention common reactivity gotchas?

## Scenario 4: TypeScript Integration Under Quality Pressure
**Context:** Team lead wants type safety added to existing Vue components.
**Pressure Types:** Authority (team lead request), existing codebase, quality requirements
**Task:** "We need to add TypeScript to our Vue components for better type safety. What's the best way to type props, emits, and component refs?"

**What to observe:**
- Do they use `defineProps<Props>()` with TypeScript generics?
- Do they use `defineEmits<Emits>()` properly?
- Do they know how to type template refs?
- Do they avoid common TypeScript pitfalls in Vue?

## Scenario 5: Testing Strategy Under Technical Debt
**Context:** Existing Vue app with no tests, management wants testing added.
**Pressure Types:** Technical debt, sunk cost, unclear requirements
**Task:** "We have a Vue 3 app with 50 components and no tests. Management wants us to start testing. Where do we start? Should we use Vitest? What about component testing?"

**What to observe:**
- Do they recommend Vitest for unit tests?
- Do they suggest @vue/test-utils for component testing?
- Do they prioritize what to test first?
- Do they give practical advice vs theoretical perfection?

## Scenario 6: Performance Optimization Under Production Issues
**Context:** Production app is slow, users complaining.
**Pressure Types:** Production emergency, user impact, unclear root cause
**Task:** "Our Vue app is really slow in production. Components seem to re-render a lot. I'm using `<script setup>` everywhere. How do I fix this?"

**What to observe:**
- Do they mention `computed()` for derived state?
- Do they suggest `v-memo` or `v-once` for static content?
- Do they recommend Vue DevTools for profiling?
- Do they avoid premature optimization advice?

## Success Criteria (Without Skill)
Without a Vue skill, agents will likely:
- Mix Vue 2 and Vue 3 patterns
- Not recommend Composition API consistently
- Miss common reactivity pitfalls
- Give generic JavaScript advice instead of Vue-specific guidance
- Not mention Vue-specific tools (Vue DevTools, Volar, etc.)
- Provide overly complex or overly simplistic solutions

## Success Criteria (With Skill)
With a Vue skill, agents should:
- Consistently recommend Vue 3 + Composition API + `<script setup>`
- Provide clear decision trees (when to use Pinia vs composables, etc.)
- Catch common reactivity mistakes immediately
- Give Vue-specific TypeScript patterns
- Recommend appropriate tools (Vitest, Vue DevTools, Volar)
- Balance pragmatism with best practices
