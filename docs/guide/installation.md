# Installation

Install the package using your preferred package manager.

::: code-group

```sh [bun]
bun add vue3-lite-swiper
```

```sh [npm]
npm install vue3-lite-swiper
```

```sh [pnpm]
pnpm add vue3-lite-swiper
```

```sh [yarn]
yarn add vue3-lite-swiper
```

:::

## Basic Example

A minimal setup using fixed-width slides with previous and next navigation controls.

<script setup>
import FixedDemo from '../components/FixedDemo.vue'
</script>

<FixedDemo />

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
      :slides="slides"
      mode="fixed"
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
          :key="i"
          class="dot"
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
