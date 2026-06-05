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
];
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
      <div :style="{ background: item.color }">{{ item.label }}</div>
    </template>
  </Swiper>

  <button @click="swiper?.previous()">Prev</button>
  <button @click="swiper?.next()">Next</button>
</template>
```
