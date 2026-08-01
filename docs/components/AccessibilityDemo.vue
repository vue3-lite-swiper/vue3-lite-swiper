<template>
  <div class="demo">
    <Swiper ref="swiper" :slides="slides" :slide-width="260" :gap="16">
      <template #default="{ item }">
        <div class="slide" :style="{ background: item.color }">
          {{ item.title }}
        </div>
      </template>
    </Swiper>

    <nav class="controls" aria-label="Carousel controls">
      <button
        class="btn"
        type="button"
        aria-label="Show previous slide"
        :disabled="swiper?.current === 0"
        @click="swiper?.previous()"
      >
        ← Previous
      </button>
      <span class="counter" aria-hidden="true">
        Slide {{ (swiper?.current ?? 0) + 1 }} of {{ swiper?.total }}
      </span>
      <button
        class="btn"
        type="button"
        aria-label="Show next slide"
        :disabled="swiper?.current === (swiper?.total ?? 1) - 1"
        @click="swiper?.next()"
      >
        Next →
      </button>
    </nav>

    <p class="sr-only" aria-live="polite">
      Slide {{ (swiper?.current ?? 0) + 1 }} of {{ swiper?.total }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import Swiper from "../../src/components/swiper.vue";

const swiper = useTemplateRef("swiper");

const slides = [
  { title: "Slide 1", color: "#2563eb" },
  { title: "Slide 2", color: "#059669" },
  { title: "Slide 3", color: "#7c3aed" },
  { title: "Slide 4", color: "#dc2626" },
];
</script>

<style scoped>
.demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  background: var(--vp-c-bg-soft);
}

.slide {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 260px;
  height: 160px;
  border-radius: 10px;
  color: #fff;
  font-weight: 700;
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
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.counter {
  color: var(--vp-c-text-2);
  font-size: 0.875rem;
}

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
