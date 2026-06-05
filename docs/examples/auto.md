# Auto Mode

Use `mode="auto"` when slides have **different widths**. The component measures each slide after mount using `getBoundingClientRect()` and builds snap positions from those measurements.

<script setup>
import AutoDemo from '../components/AutoDemo.vue'
</script>

<ClientOnly>
  <AutoDemo />
</ClientOnly>

## Usage

Omit `slide-width` and size your slides with CSS. The component handles the rest.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const slides = [
  { label: "Narrow", width: 130 },
  { label: "Wide slide card", width: 260 },
  { label: "Medium", width: 190 },
  { label: "Extra wide", width: 300 },
  { label: "Tiny", width: 110 },
];

const swiper = useTemplateRef("swiper");
</script>

<template>
  <Swiper ref="swiper" :slides="slides" mode="auto" :gap="12">
    <template #default="{ item }">
      <div class="slide" :style="{ width: item.width + 'px' }">
        {{ item.label }}
      </div>
    </template>
  </Swiper>

  <div class="controls">
    <button @click="swiper?.previous()">← Prev</button>
    <span
      >{{ (swiper?.pagination.current ?? 0) + 1 }} /
      {{ swiper?.pagination.total }}</span
    >
    <button @click="swiper?.next()">Next →</button>
  </div>
</template>

<style scoped>
.slide {
  height: 140px;
  border-radius: 10px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
</style>
```

## CSS-driven widths

Slide widths can come entirely from a stylesheet — no inline style needed:

```vue
<template>
  <Swiper :slides="cards" mode="auto" :gap="16">
    <template #default="{ item }">
      <div class="product-card">
        <img :src="item.image" />
        <h3>{{ item.name }}</h3>
      </div>
    </template>
  </Swiper>
</template>

<style scoped>
/* width controlled purely by CSS */
.product-card {
  width: 200px;
  flex-shrink: 0;
}
</style>
```

## Fixed vs Auto

|                    | `fixed`            | `auto`                      |
| ------------------ | ------------------ | --------------------------- |
| Slide widths       | All equal          | Variable / CSS-driven       |
| Snap calculation   | Math only (faster) | DOM measurement after mount |
| `slide-width` prop | Required           | Not used                    |
