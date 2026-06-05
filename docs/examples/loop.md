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

const slides = [
  { label: "Slide A", color: "#60a5fa" },
  { label: "Slide B", color: "#34d399" },
  { label: "Slide C", color: "#a78bfa" },
  { label: "Slide D", color: "#f87171" },
  { label: "Slide E", color: "#fbbf24" },
  { label: "Slide F", color: "#e879f9" },
];

const swiper = useTemplateRef("swiper");
</script>

<template>
  <Swiper ref="swiper" :slides="slides" :slide-width="220" :gap="16" loop>
    <template #default="{ item }">
      <div class="slide" :style="{ background: item.color }">
        {{ item.label }}
      </div>
    </template>
  </Swiper>

  <div class="controls">
    <button @click="swiper?.previous()">← Prev</button>
    <button @click="swiper?.next()">Next →</button>
  </div>
</template>
```

## How it works

When navigating forward and the next position would be the end of the strip:

1. `rotateForward()` moves the first slide element to the end of the DOM strip.
2. `xPos` is shifted back by the moved item's width, keeping the visible frame stable.
3. Snap positions are recalculated for the new order.
4. The carousel advances to the next snap in the updated layout.

Backward navigation mirrors this with `rotateBackward()`.

## Minimum slides

The loop requires at least **one more slide than fits in the viewport**. If the slide count is too low, `loop` is silently ignored and the swiper behaves as non-looping.

::: tip Works with both modes
`loop` is compatible with both `mode="fixed"` and `mode="auto"`. In auto mode the rotation stride is measured from the DOM at rotation time.
:::
