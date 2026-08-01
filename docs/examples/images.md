# Image Gallery

A fixed-width photo gallery with accessible external navigation controls. The photos are served by [Unsplash](https://unsplash.com/) and can be replaced with your own image URLs.

<script setup>
import ImageGalleryDemo from '../components/ImageGalleryDemo.vue'
</script>

<ClientOnly>
  <ImageGalleryDemo />
</ClientOnly>

## Usage

Keep `slide-width` equal to the card width. Navigation controls are outside the swiper because slotted slide content is reserved for dragging.

```vue
<script setup lang="ts">
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const swiper = useTemplateRef("swiper");

const slides = [
  {
    title: "Mountain lake",
    alt: "A mountain range reflected in a lake",
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Forest trail",
    alt: "A sunlit trail through a forest",
    src: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Desert road",
    alt: "A winding road through a desert landscape",
    src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Coastal camp",
    alt: "A tent beside a lake at sunset",
    src: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Alpine valley",
    alt: "A green valley below snow-capped mountains",
    src: "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80",
  },
];
</script>

<template>
  <div class="demo">
    <Swiper
      ref="swiper"
      :slides="slides"
      mode="fixed"
      :slide-width="300"
      :gap="16"
    >
      <template #default="{ item }">
        <figure class="slide">
          <img :src="item.src" :alt="item.alt" />
          <figcaption>{{ item.title }}</figcaption>
        </figure>
      </template>
    </Swiper>

    <div class="controls">
      <button
        class="btn"
        type="button"
        aria-label="Show previous photo"
        @click="swiper?.previous()"
      >
        ← Prev
      </button>
      <span class="counter">
        Photo {{ (swiper?.current ?? 0) + 1 }} of {{ swiper?.total }}
      </span>
      <button
        class="btn"
        type="button"
        aria-label="Show next photo"
        @click="swiper?.next()"
      >
        Next →
      </button>
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
  position: relative;
  width: 300px;
  height: 200px;
  margin: 0;
  overflow: hidden;
  border-radius: 10px;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide figcaption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 28px 16px 12px;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.btn {
  padding: 6px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.15s;
}

.btn:hover {
  background: var(--vp-c-brand-soft);
}

.counter {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}
</style>
```
