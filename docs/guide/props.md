# Props

The `<Swiper>` component is generic — the type parameter `T` is inferred from the `:slides` prop, so your slot props are fully typed with no casting.

```vue
<script setup lang="ts">
import { Swiper } from "vue3-lite-swiper";

const slides = [
  { id: 1, title: "First" },
  { id: 2, title: "Second" },
  { id: 3, title: "Third" },
];
</script>

<template>
  <Swiper :slides="slides" :slide-width="300" :gap="16">
    <template #default="{ item }">
      <!-- item is typed as { id: number; title: string } -->
      <div class="slide">{{ item.title }}</div>
    </template>
  </Swiper>
</template>
```

## Props reference

| Prop               | Type                | Default   | Description                                                                         |
| ------------------ | ------------------- | --------- | ----------------------------------------------------------------------------------- |
| `slides`           | `T[]`               | —         | **Required.** The data array. Each element is passed as `item` in the default slot. |
| `mode`             | `"fixed" \| "auto"` | `"fixed"` | How slide widths and snap positions are resolved. [See below](#mode).               |
| `slideWidth`       | `number`            | —         | Slide width in pixels. **Required when `mode="fixed"`.**                            |
| `gap`              | `number`            | `20`      | Horizontal gap between slides, in pixels.                                           |
| `slidesPerSwipe`   | `number`            | `1`       | Slides to advance per navigation step.                                              |
| `loop`             | `boolean`           | `false`   | Enable seamless infinite looping.                                                   |
| `autoPlay`         | `boolean`           | `false`   | Advance automatically at a fixed interval.                                          |
| `autoPlayInterval` | `number`            | `3000`    | Milliseconds between autoplay advances.                                             |
| `pauseOnHover`     | `boolean`           | `true`    | Pause autoplay while the pointer is over the swiper.                                |

## `mode`

The `mode` prop controls how the swiper figures out each slide's width and where the snap positions land.

**`"fixed"`** — You provide `slideWidth`. Snap positions are computed mathematically without measuring the DOM. This is the fastest option and the right choice whenever every slide is the same width.

```vue
<Swiper :slides="slides" mode="fixed" :slide-width="300" />
```

**`"auto"`** — The component measures each slide's rendered width via `getBoundingClientRect()` after mount. Use this when slide widths differ or are driven by CSS rather than a fixed pixel value.

```vue
<Swiper :slides="slides" mode="auto" />
```

::: warning slideWidth is required in fixed mode
Omitting `slideWidth` while `mode="fixed"` logs an error and disables all snap navigation. Either pass `slideWidth` or switch to `mode="auto"`.
:::

## Slots

### `default`

Renders a single slide. It receives the typed slide data and that item's original array index.

```vue
<Swiper :slides="items">
  <template #default="{ item, index }">
    <!-- item is typed as T -->
    <!-- index is the item's original index in items -->
  </template>
</Swiper>
```

| Slot prop | Type     | Description                                                                                                            |
| --------- | -------- | ---------------------------------------------------------------------------------------------------------------------- |
| `item`    | `T`      | The slide's data, typed from your array.                                                                               |
| `index`   | `number` | The item's zero-based index in the original `slides` array. It stays with the item while looping rotates render order. |

::: warning Slotted content is not pointer-interactive
The component disables pointer events inside slides so dragging works reliably. Put links, buttons, and other interactive controls outside the swiper.
:::

::: tip Need an imperative handle?
Pair these props with the [methods API](/guide/methods) to build pagination dots, prev/next buttons, or autoplay controls.
:::
