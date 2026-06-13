# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`vue3-lite-swiper` is a published npm package: a single Vue 3 carousel component (`Swiper`) with zero runtime dependencies (Vue is a peer dependency). It handles touch/mouse drag, snap positioning, infinite looping, and autoplay. SSR-safe. The source of truth for public behavior is `README.md` and the VitePress docs in `docs/`.

The package manager is **bun**. Node >= 22.18 is required.

## Commands

```sh
bun install              # install deps
bun run dev              # local playground (src/App.vue) at http://localhost:3000
bun run build            # build the library to dist/ via tsdown
bun run type-check       # vue-tsc --build (no test suite exists)
bun run format           # prettier over src/
bun run docs:dev         # VitePress docs dev server
bun run docs:build       # build docs (deployed to GitHub Pages on push to main)
```

There are **no automated tests**. Verify changes by running `bun run dev` and exercising the playground in a browser. The `chrome-devtools` MCP server is the established way to debug live swiper behavior (console logs, DOM measurement, screenshots).

### Three separate build targets — don't conflate them

- **Library build** (`tsdown`, config in `tsdown.config.ts`) — bundles `src/index.ts` → `dist/`, ESM only, Vue externalized. This is what ships to npm.
- **Dev playground** (`vite`, config in `vite.config.ts`) — serves `index.html` + `src/main.ts` + `src/App.vue`. Not part of the published package; it's a sandbox for the component.
- **Docs** (`vitepress`, in `docs/`) — the public documentation site.

The `~` alias maps to `src/` in **both** `vite.config.ts` and `tsdown.config.ts`; keep them in sync if you change it. Releasing is automated via `.github/workflows/release.yml` (manual `workflow_dispatch`, version bump → PR → npm publish) — do not hand-edit `package.json` version or `CHANGELOG.md`.

## Architecture

The public surface is tiny — `src/index.ts` exports `Swiper` (and a Vue plugin `install`). All logic lives in `src/components/swiper.vue`, which is the **orchestrator** that wires together three composables and the snap math. Understanding the data flow between them is the key to working here.

### The central state (owned by `swiper.vue`)

- `xPos` — the strip's `translateX` offset in pixels. Everything ultimately moves this value.
- `isDragging` — when true, the CSS transition is disabled. Also deliberately toggled on/off during loop repositioning to **suppress the transition during a silent jump** (see looping below).
- `swiperCalcs` — `{ snapPositions: number[], maxPos: number }`. Recomputed by `preCalc()`.

### `src/utils/snap.ts` — pure snap-position math

Computes where the strip is allowed to rest. Two strategies driven by the `mode` prop:

- `getFixedSnapPositions` (`mode="fixed"`) — purely mathematical from `slideWidth` + gap; **never measures the DOM**. Fast. `slideWidth` is required in this mode or snap navigation is disabled.
- `getSnapPositions` (`mode="auto"`) — measures each slide's rendered width via `getBoundingClientRect()`. Use when slide widths vary.
- `getClosestSnapPosition` — snap-back target after a drag release.

`preCalc()` in `swiper.vue` picks the right function based on `mode`. In auto mode it must run **after `nextTick()`** so the DOM reflects the current `displaySlides`.

### `src/composables/useLoop.ts` — the rotated-array model

Looping is implemented by **rotating a copy of the slides array** (`displaySlides`), not by cloning slides at both ends. `canLoop` gates whether looping is active (decided in `init()` based on how many slides fit in view — too few slides → `canLoop` stays false, which is the flicker/buffer edge case from past sessions).

- `rotateForward()` shifts the first slide to the end and **returns its stride** (slide width + gap).
- `rotateBackward()` pops the last slide to the front and returns its stride.

The returned stride is the linchpin: the caller adjusts `xPos` by exactly that amount so the slide that just moved stays visually in place. **Rotation + xPos compensation = a seamless loop with no visible jump.**

### `src/composables/usePagination.ts` — `next` / `previous` / `goToIndex` / `pagination`

The hard part of the whole codebase. `next()` and `previous()` cross loop boundaries by: rotating `displaySlides`, setting `isDragging = true` (to kill the transition), compensating `xPos` by the stride, `await nextTick()`, calling `preCalc()` to rebuild `swiperCalcs`, then resolving the real target snap and re-enabling the transition. `next()` retries up to 4 times to handle landing on a penultimate/boundary snap. When editing here, the invariant to preserve is: **the visible position must never jump; only the underlying array index and xPos change silently.** `current` can change mid-`next()` because rotation reindexes the snap array.

### `src/composables/useAutoPlay.ts`

`setInterval`-driven. Calls `next()` each tick; when `canLoop` is false and we're at the last snap, it jumps back to index 0 instead. Pauses on hover when `pauseOnHover` is set.

### Imperative API

`swiper.vue` exposes `{ pagination, next, previous, goToIndex }` via `defineExpose`. Consumers reach it with `useTemplateRef` (Vue 3.5+).

## Conventions

- Composables take an options object of refs/getters (props passed as `() => props.x` getters so they stay reactive across the composable boundary). Follow that pattern rather than passing raw values.
- Keep snap calculations as pure functions in `src/utils/`; keep stateful/reactive logic in `src/composables/`.
- Styling in the component is plain scoped CSS with `vls-` prefixed classes. Tailwind is only used in the playground/docs, not the shipped component.
