# Infinite Loop

Enable `loop` to scroll endlessly in both directions. Vue3 Lite Swiper uses **array rotation** — DOM items are moved from one end of the strip to the other — so there is no clone flicker or position jump.

<script setup>
import LoopDemo from '../components/LoopDemo.vue'
</script>

<ClientOnly>
  <LoopDemo />
</ClientOnly>

## Usage

Add the `loop` prop. Everything else works the same.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const swiper = useTemplateRef("swiper");

const slides = [
  { label: "Slide A", color: "#60a5fa" },
  { label: "Slide B", color: "#34d399" },
  { label: "Slide C", color: "#a78bfa" },
  { label: "Slide D", color: "#f87171" },
  { label: "Slide E", color: "#fbbf24" },
  { label: "Slide F", color: "#e879f9" },
];
</script>

<template>
  <div class="demo">
    <Swiper
      ref="swiper"
      mode="fixed"
      loop
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
      <span class="hint">Loops infinitely in both directions</span>
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
  font-size: 1.1rem;
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

.hint {
  font-size: 0.8rem;
  color: var(--vp-c-text-3);
  font-style: italic;
}
</style>
```

## How it works

When navigating forward and the next position would be the end of the strip:

1. `rotateForward()` moves the first slide element to the end of the DOM strip.
2. `xPos` is shifted back by the moved item's width, keeping the visible frame stable.
3. Snap positions are recalculated for the new order.
4. The carousel advances to the next snap in the updated layout.

Backward navigation mirrors this with `rotateBackward()`.

## Minimum slides

Looping is active when the slide count is at least the number of slides that fit in the viewport. With fewer slides, `loop` is silently ignored and the swiper behaves as non-looping.

::: tip Works with both modes
`loop` is compatible with both `mode="fixed"` and `mode="auto"`. In auto mode the rotation stride is measured from the DOM at rotation time.
:::
