# vue3-lite-swiper

**Vue3 Lite Swiper** is a lightweight Vue 3 carousel component with zero runtime dependencies. It handles touch and mouse drag, snap positioning, infinite looping, and autoplay — all without a single external package.

📖 **[Read the full documentation →](https://vue3-lite-swiper.vuedoo.org)**

## Why Vue3 Lite Swiper?

Most carousel libraries ship with their own animation engine, event system, and DOM abstractions. Vue3 Lite Swiper keeps things simple:

- **Lightweight** — No runtime dependencies, small bundle footprint
- **SSR Compatible** — Safe to use in Nuxt and other SSR frameworks out of the box
- **Looping** — Smooth infinite looping without visual jumps or layout shifts
- **TypeScript** — Fully typed slot props with your own data shape
- **Touch & Mouse** — Native drag support works seamlessly on desktop and mobile
- **Two Layout Modes** — Fixed-width grids or fluid auto-sizing to fit any design

## Installation

Install the package using your preferred package manager.

```sh
# bun
bun add vue3-lite-swiper

# npm
npm install vue3-lite-swiper

# pnpm
pnpm add vue3-lite-swiper

# yarn
yarn add vue3-lite-swiper
```

## Basic Example

A minimal setup using fixed-width slides with previous and next navigation controls.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const swiper = useTemplateRef("swiper");

const slides = [
  { label: "Slide 1", color: "#60a5fa" },
  { label: "Slide 2", color: "#34d399" },
  { label: "Slide 3", color: "#a78bfa" },
  { label: "Slide 4", color: "#f87171" },
  { label: "Slide 5", color: "#fbbf24" },
  { label: "Slide 6", color: "#e879f9" },
  { label: "Slide 7", color: "#2dd4bf" },
  { label: "Slide 8", color: "#fb923c" },
];
</script>

<template>
  <div class="demo">
    <Swiper
      ref="swiper"
      mode="fixed"
      :slides="slides"
      :slide-width="220"
      :gap="16"
    >
      <template #default="{ item }">
        <div class="slide" :style="{ background: item.color }">
          <span>{{ item.label }}</span>
        </div>
      </template>
    </Swiper>

    <div class="controls">
      <button class="btn" @click="swiper?.previous()">← Prev</button>
      <div class="dots">
        <button
          v-for="(_, i) in swiper?.pagination.total"
          class="dot"
          :key="i"
          :class="{ active: swiper?.pagination.current === i }"
          @click="swiper?.goToIndex(i)"
        />
      </div>
      <button class="btn" @click="swiper?.next()">Next →</button>
    </div>
  </div>
</template>

<style scoped>
.demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  background: var(--vp-c-bg-soft);
}

.slide {
  width: 220px;
  height: 140px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  user-select: none;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}

.btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.15s;
}

.btn:hover {
  background: var(--vp-c-brand-soft);
}

.dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: var(--vp-c-divider);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}

.dot.active {
  background: var(--vp-c-brand-1);
}

.flex {
  display: flex;
}
</style>
```

## Props

The `<Swiper>` component is generic — the type parameter `T` is inferred from the `:slides` prop, giving you fully typed slot props with no casting.

| Prop             | Type                | Default   | Description                                                                         |
| ---------------- | ------------------- | --------- | ----------------------------------------------------------------------------------- |
| `slides`         | `T[]`               | —         | **Required.** The data array. Each element is passed as `item` in the default slot. |
| `mode`           | `"fixed" \| "auto"` | `"fixed"` | How slide widths and snap positions are resolved (see below).                       |
| `slideWidth`     | `number`            | —         | Slide width in pixels. **Required when `mode="fixed"`.**                            |
| `gap`            | `number`            | `20`      | Horizontal gap between slides, in pixels.                                           |
| `slidesPerSwipe` | `number`            | `1`       | Slides to advance per navigation step.                                              |
| `loop`           | `boolean`           | `false`   | Enable seamless infinite looping.                                                   |
| `autoPlay`       | `boolean`           | `false`   | Advance automatically at a fixed interval.                                          |

### `mode`

The `mode` prop controls how the swiper figures out each slide's width and where the snap positions land.

- **`"fixed"`** — You provide `slideWidth`. Snap positions are computed mathematically without measuring the DOM. This is the fastest option and the right choice whenever every slide is the same width. Omitting `slideWidth` in this mode logs an error and disables all snap navigation.
- **`"auto"`** — The component measures each slide's rendered width via `getBoundingClientRect()` after mount. Use this when slide widths differ or are driven by CSS rather than a fixed pixel value.

## Slots

### `default`

Renders a single slide. It receives the typed slide data and its render index.

```vue
<Swiper :slides="items">
  <template #default="{ item, index }">
    <!-- item is typed as T -->
    <!-- index is the render position (may differ from the original when loop is active) -->
  </template>
</Swiper>
```

| Slot prop | Type     | Description                                                                                                                         |
| --------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `item`    | `T`      | The slide's data, typed from your array.                                                                                            |
| `index`   | `number` | Render position. When `loop` is enabled the component rotates the array internally, so this may not match the original array index. |

## Component Ref

Vue3 Lite Swiper exposes an imperative API via a template ref. Get a reference to the component instance with `useTemplateRef` (Vue 3.5+):

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const swiper = useTemplateRef("swiper");
</script>

<template>
  <Swiper ref="swiper" :slides="slides" :slide-width="300" />
</template>
```

| Method             | Description                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------ |
| `next()`           | Advance to the next snap position. When `loop` is enabled and at the boundary, the strip rotates seamlessly. |
| `previous()`       | Move to the previous snap position. When `loop` is enabled and at the start, the strip rotates backward.     |
| `goToIndex(index)` | Jump directly to a snap position by zero-based index. Throws if out of bounds.                               |

```ts
swiper.value?.next();
swiper.value?.previous();
swiper.value?.goToIndex(0); // first slide
```

> **Snap positions vs slides** — `goToIndex` operates on **snap positions**, not the raw slides array. With `slidesPerSwipe: 2` and 8 slides, there are 4 snap positions (indices 0–3).

### `current` / `total`

Two reactive properties available on the component instance. Use them to build custom navigation UI.

```ts
swiper.value?.current; // number — active snap index
swiper.value?.total; // number — total snap positions
```

| Property  | Type     | Description                                   |
| --------- | -------- | --------------------------------------------- |
| `current` | `number` | Zero-based index of the active snap position. |
| `total`   | `number` | Total number of snap positions.               |

## Examples

Live demos for every mode are in the [Examples](https://vue3-lite-swiper.vuedoo.org/examples/fixed) section of the docs.

### [Fixed Mode](https://vue3-lite-swiper.vuedoo.org/examples/fixed)

Use `mode="fixed"` (the default) when all slides share the same width. Snap positions are computed mathematically — no DOM measurement needed. Set `slides-per-swipe` to jump several slides per step (with 8 slides and `slides-per-swipe="3"`, the snap positions are `[0, 3, 6]`).

```vue
<Swiper mode="fixed" :slides="slides" :slide-width="220" :gap="16" />
```

### [Auto Mode](https://vue3-lite-swiper.vuedoo.org/examples/auto)

Use `mode="auto"` when slides have **different widths**. The component measures each slide after mount using `getBoundingClientRect()` and builds snap positions from those measurements. Omit `slide-width` and size your slides with CSS.

```vue
<Swiper mode="auto" :slides="slides" :gap="12" />
```

### [Infinite Loop](https://vue3-lite-swiper.vuedoo.org/examples/loop)

Enable `loop` to scroll endlessly in both directions. Vue3 Lite Swiper uses **array rotation** — DOM items are moved from one end of the strip to the other — so there is no clone flicker or position jump. The loop requires at least one more slide than fits in the viewport; otherwise it is silently ignored. Compatible with both `fixed` and `auto` modes.

```vue
<Swiper loop :slides="slides" :slide-width="220" :gap="16" />
```

### [Auto Play](https://vue3-lite-swiper.vuedoo.org/examples/autoplay)

Set `:auto-play="true"` to advance slides automatically. Toggle it reactively to pause and resume at any time. With `loop`, it advances indefinitely; without `loop`, it resets to the first slide each time it reaches the end.

```vue
<Swiper
  loop
  :slides="slides"
  :slide-width="220"
  :gap="16"
  :auto-play="playing"
/>
```

## License

Licensed under the [MIT license](https://github.com/vue3-lite-swiper/vue3-lite-swiper/blob/main/LICENSE.md).
