# vue3-lite-swiper

A lightweight, Vue 3 swiper component library for building responsive image galleries and carousels with minimal dependencies optimized for modern web applications.

## Features

- **Lightweight** — Minimal bundle size with zero external dependencies (Vue 3 only)
- **Touch & Mouse Support** — Full support for desktop and mobile interactions
- **Multiple Modes** — Fixed-width and auto-sizing slide layouts
- **Infinite Looping** — Seamless carousel looping with intelligent array rotation
- **Auto-Play** — Configurable automatic slide progression
- **Flexible Navigation** — Programmatic control with `next()`, `previous()`, and `goToIndex()`
- **Generic TypeScript** — Full type safety for any slide data type
- **Customizable Styling** — Built with Tailwind CSS, easy to override
- **Smooth Animations** — CSS-based transitions for 60fps performance

## Installation

Install the package using npm, yarn, or bun:

```bash
npm install vue3-lite-swiper
```

## Quick Start

### Basic Usage

```vue
<template>
  <div>
    <Swiper
      ref="swiperRef"
      :slides="images"
      :gap="20"
      mode="fixed"
      :slideWidth="300"
      :autoPlay="true"
      :loop="true"
    >
      <template #default="{ item }">
        <img
          :src="item.url"
          :alt="item.title"
          class="h-full w-full object-cover"
        />
      </template>
    </Swiper>

    <!-- Navigation -->
    <button @click="swiperRef?.previous()">Previous</button>
    <button @click="swiperRef?.next()">Next</button>
    <span
      >{{ swiperRef?.pagination.value.current }} /
      {{ swiperRef?.pagination.value.total }}</span
    >
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const swiperRef = useTemplateRef("swiperRef");

const images = [
  { url: "image1.jpg", title: "Image 1" },
  { url: "image2.jpg", title: "Image 2" },
  { url: "image3.jpg", title: "Image 3" },
];
</script>
```

### As a Plugin

```ts
import { createApp } from "vue";
import SwiperPlugin from "vue3-lite-swiper";

const app = createApp(App);
app.use(SwiperPlugin);
app.mount("#app");
```

Then use `<Swiper>` directly in any component without explicit imports.

## Props

| Prop             | Type                | Default   | Description                                                   |
| ---------------- | ------------------- | --------- | ------------------------------------------------------------- |
| `slides`         | `T[]`               | —         | Array of slide data (required)                                |
| `slidesPerSwipe` | `number`            | `1`       | Number of slides to advance per swipe                         |
| `autoPlay`       | `boolean`           | `false`   | Enable automatic slide progression                            |
| `loop`           | `boolean`           | `false`   | Enable infinite carousel looping                              |
| `mode`           | `"fixed" \| "auto"` | `"fixed"` | Layout mode: `fixed` uses explicit width, `auto` measures DOM |
| `slideWidth`     | `number`            | —         | Required when `mode="fixed"`; slide width in pixels           |
| `gap`            | `number`            | `20`      | Gap between slides in pixels                                  |

## Exposed Methods & Computed Properties

Access via `ref`:

```ts
const swiperRef = ref();

// Methods
swiperRef.value.next(); // Move to next slide
swiperRef.value.previous(); // Move to previous slide
swiperRef.value.goToIndex(2); // Jump to slide at index 2

// Computed
swiperRef.value.pagination; // { current: number, total: number }
```

## Slots

#### Default Slot

Render individual slides with access to slide data and index:

```vue
<Swiper :slides="items">
  <template #default="{ item, index }">
    <div>{{ index }}: {{ item.name }}</div>
  </template>
</Swiper>
```

**Scoped Props:**

- `item: T` — The current slide data
- `index: number` — The slide index

## Examples

### Auto-Sizing Responsive Gallery

```vue
<Swiper :slides="items" mode="auto" :gap="20">
  <template #default="{ item }">
    <div class="shrink-0">{{ item.content }}</div>
  </template>
</Swiper>
```

### Infinite Auto-Play Carousel

```vue
<Swiper
  :slides="testimonials"
  mode="fixed"
  :slideWidth="400"
  :autoPlay="true"
  :loop="true"
  :gap="24"
>
  <template #default="{ item }">
    <div class="p-6 bg-white rounded-xl shadow">
      <p>"{{ item.quote }}"</p>
      <p class="mt-4 font-semibold">— {{ item.author }}</p>
    </div>
  </template>
</Swiper>
```

## License

Licensed under the [MIT license](https://github.com/vue3-lite-swiper/vue3-lite-swiper/blob/main/LICENSE.md).
