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

Move to the snap mapped to an original slide index.

```ts
swiper.value?.goToIndex(0); // first slide
swiper.value?.goToIndex(3); // fourth slide
```

| Parameter | Type     | Description                                                   |
| --------- | -------- | ------------------------------------------------------------- |
| `index`   | `number` | Zero-based original slide index. Invalid indices are ignored. |

::: info Slide indices
`goToIndex` and slot `index` use zero-based indices from the original `slides` array. `current` is a navigation index: with the default `slidesPerSwipe="1"`, it matches the active original slide; with larger values, it reflects the internal snap-array position and may not identify the leading visible slide.
:::

## `current` / `total`

Two reactive properties available on the component instance. Use them to build custom navigation UI.

```ts
swiper.value?.current; // number — current navigation index
swiper.value?.total; // number — number of addressable slides
```

| Property  | Type     | Description                                                                                   |
| --------- | -------- | --------------------------------------------------------------------------------------------- |
| `current` | `number` | Current navigation index. With `slidesPerSwipe="1"`, this is the active original slide index. |
| `total`   | `number` | Number of addressable original slides.                                                        |

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

This pattern assumes `loop` is disabled and `slides-per-swipe` is left at its default of `1`.

```vue
<template>
  <button :disabled="swiper?.current === 0" @click="swiper?.previous()">
    Prev
  </button>

  <button
    :disabled="swiper?.current === (swiper?.total ?? 1) - 1"
    @click="swiper?.next()"
  >
    Next
  </button>
</template>
```
