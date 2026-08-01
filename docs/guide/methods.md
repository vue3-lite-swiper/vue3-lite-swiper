# Component Ref

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

## Methods

### `next()`

Advance to the next snap position. When `loop` is enabled and the swiper is at the boundary, the strip rotates to maintain seamless infinite scrolling.

```ts
swiper.value?.next();
```

### `previous()`

Move to the previous snap position. When `loop` is enabled and the swiper is at the start, the strip rotates backward.

```ts
swiper.value?.previous();
```

### `goToIndex(index)`

Jump directly to a snap position by index.

```ts
swiper.value?.goToIndex(0); // first slide
swiper.value?.goToIndex(3); // fourth snap position
```

| Parameter | Type     | Description                                     |
| --------- | -------- | ----------------------------------------------- |
| `index`   | `number` | Zero-based snap index. Throws if out of bounds. |

::: info Snap positions vs slides
`goToIndex` operates on **snap positions**, not the raw slides array. With `slidesPerSwipe: 2` and 8 slides, there are 4 snap positions (indices 0–3).
:::

## `current` / `total`

Two reactive properties available on the component instance. Use them to build custom navigation UI.

```ts
swiper.value?.current; // number — active snap index
swiper.value?.total; // number — total snap positions
```

| Property  | Type     | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `current` | `number` | Zero-based index of the active snap position.  |
| `total`   | `number` | Total number of snap positions.                |

## Examples

### Pagination dots

```vue
<template>
  <Swiper ref="swiper" :slides="slides" :slide-width="300">
    <template #default="{ item }">
      <div class="slide">{{ item }}</div>
    </template>
  </Swiper>

  <div class="dots">
    <button
      v-for="(_, i) in swiper?.total"
      :key="i"
      :class="{ active: swiper?.current === i }"
      @click="swiper?.goToIndex(i)"
    />
  </div>
</template>
```

### Disabled boundary buttons

```vue
<template>
  <button
    :disabled="swiper?.current === 0"
    @click="swiper?.previous()"
  >
    Prev
  </button>

  <button
    :disabled="
      swiper?.current === (swiper?.total ?? 1) - 1
    "
    @click="swiper?.next()"
  >
    Next
  </button>
</template>
```
