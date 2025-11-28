# CLAUDE.md — Rackarr

**Project:** Rackarr — Rack Layout Designer for Homelabbers
**Version:** 0.1.0

---

## Planning Docs

Full planning documentation is symlinked in `.claude/context/`:

```
.claude/context/
├── spec.md              → Technical specification
├── prompt_plan.md       → Implementation prompts
├── todo.md              → Progress checklist
├── roadmap.md           → Version planning
└── CLAUDE-planning.md   → Full project instructions
```

**Read `.claude/context/CLAUDE-planning.md` for complete instructions including scope guard.**

---

## Quick Reference

### Tech Stack

- Svelte 5 with runes (`$state`, `$derived`, `$effect`)
- TypeScript strict mode
- Vitest + @testing-library/svelte + Playwright
- CSS custom properties (no Tailwind)
- SVG rendering

### Svelte 5 Runes (Required)

```svelte
<!-- ✅ CORRECT -->
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);
</script>

<!-- ❌ WRONG: Svelte 4 stores -->
<script lang="ts">
  import { writable } from 'svelte/store';
</script>
```

### TDD Protocol

1. Write tests FIRST
2. Run tests (should fail)
3. Implement to pass
4. Commit

### Commands

```bash
npm run dev          # Dev server
npm run test         # Unit tests (watch)
npm run test:run     # Unit tests (CI)
npm run test:e2e     # Playwright E2E
npm run build        # Production build
```

---

## Repository

| Location | URL                                              |
| -------- | ------------------------------------------------ |
| Primary  | https://git.falcon-wahoe.ts.net/ggfevans/rackarr |
| Mirror   | https://github.com/ggfevans/rackarr              |
