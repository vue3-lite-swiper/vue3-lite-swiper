# Accessibility

`Swiper` handles pointer dragging only. Provide visible, keyboard-focusable controls outside the swiper so people can navigate with a keyboard or assistive technology.

<script setup>
import AccessibilityDemo from '../components/AccessibilityDemo.vue'
</script>

<ClientOnly>
  <AccessibilityDemo />
</ClientOnly>

## Accessible navigation

Use native buttons, clear labels, and a live status message. This example uses the default `slides-per-swipe="1"`, for which `current` identifies the active slide.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const swiper = useTemplateRef("swiper");

const slides = [
  {
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
    alt: "A mountain range reflected in a lake",
  },
  {
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
    alt: "A sunlit trail through a forest",
  },
];
</script>

<template>
  <Swiper ref="swiper" :slides="slides" :slide-width="300">
    <template #default="{ item }">
      <img :src="item.src" :alt="item.alt" />
    </template>
  </Swiper>

  <nav class="controls" aria-label="Carousel controls">
    <button
      type="button"
      aria-label="Show previous slide"
      :disabled="swiper?.current === 0"
      @click="swiper?.previous()"
    >
      Previous
    </button>
    <button
      type="button"
      aria-label="Show next slide"
      :disabled="swiper?.current === (swiper?.total ?? 1) - 1"
      @click="swiper?.next()"
    >
      Next
    </button>
  </nav>

  <p class="sr-only" aria-live="polite">
    Slide {{ (swiper?.current ?? 0) + 1 }} of {{ swiper?.total }}
  </p>
</template>

<style scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
```

## Guidelines

- Use descriptive `alt` text for meaningful images. Use `alt=""` for decorative images.
- Keep controls outside the default slot. Slide content has `pointer-events: none` while dragging is enabled, so links and buttons inside a slide are not interactive.
- Use native `<button type="button">` elements for previous, next, and pagination controls. They receive keyboard focus and work with Enter and Space automatically.
- Give icon-only controls an `aria-label`, such as `aria-label="Show next slide"`.
- When using pagination dots, set `aria-current="true"` on the active dot and give every dot a descriptive label, such as `aria-label="Show slide 3"`.
- `Swiper` does not provide built-in keyboard-arrow navigation or live announcements. Add them through your external controls when your interface needs them.
- The component does not currently reduce its transition for `prefers-reduced-motion`. Avoid autoplay for motion-sensitive content, or disable it based on your app's motion preference.

## Pagination dots

```vue
<button
  v-for="(_, index) in swiper?.total"
  :key="index"
  type="button"
  :aria-label="`Show slide ${index + 1}`"
  :aria-current="swiper?.current === index ? 'true' : undefined"
  @click="swiper?.goToIndex(index)"
/>
```
