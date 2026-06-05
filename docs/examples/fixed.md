# Fixed Mode

Use `mode="fixed"` (the default) when all slides share the same width. Snap positions are computed mathematically — no DOM measurement needed.

<script setup>
import FixedDemo from '../components/FixedDemo.vue'
</script>

<ClientOnly>
  <FixedDemo />
</ClientOnly>

## Usage

Provide `slide-width` in pixels. The component uses this to calculate the scroll distance per step. Your slide element must have that exact rendered width.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const slides = Array.from({ length: 8 }, (_, i) => ({
  label: `Slide ${i + 1}`,
  color: `hsl(${i * 45}, 80%, 65%)`,
}));

const swiper = useTemplateRef("swiper");
</script>

<template>
  <Swiper
    ref="swiper"
    :slides="slides"
    mode="fixed"
    :slide-width="220"
    :gap="16"
  >
    <template #default="{ item }">
      <div class="slide" :style="{ background: item.color }">
        {{ item.label }}
      </div>
    </template>
  </Swiper>

  <div class="controls">
    <button @click="swiper?.previous()">← Prev</button>
    <button
      v-for="(_, i) in swiper?.pagination.total"
      :key="i"
      @click="swiper?.goToIndex(i)"
    >
      {{ i + 1 }}
    </button>
    <button @click="swiper?.next()">Next →</button>
  </div>
</template>

<style scoped>
.slide {
  width: 220px;
  height: 140px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
}
</style>
```

## Advance multiple slides at once

Set `slides-per-swipe` to jump several slides per navigation step:

```vue
<Swiper :slides="slides" :slide-width="220" :gap="16" :slides-per-swipe="3" />
```

With 8 slides and `slides-per-swipe="3"`, the snap positions are `[0, 3, 6]`.

::: tip
`slide-width` must match the actual rendered width. If your slide has `padding: 0 12px`, account for it or switch to `mode="auto"`.
:::
