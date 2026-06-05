<template>
  <div class="demo">
    <Swiper ref="swiper" :slides="slides" mode="auto" :gap="12">
      <template #default="{ item }">
        <div
          class="slide"
          :style="{ width: item.width + 'px', background: item.color }"
        >
          <span>{{ item.label }}</span>
        </div>
      </template>
    </Swiper>

    <div class="controls">
      <button class="btn" @click="swiper?.previous()">← Prev</button>
      <span class="counter">
        {{ (swiper?.pagination.current ?? 0) + 1 }} /
        {{ swiper?.pagination.total }}
      </span>
      <button class="btn" @click="swiper?.next()">Next →</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import Swiper from "../../src/components/swiper.vue";

const swiper = useTemplateRef("swiper");

const slides = [
  { label: "Narrow", width: 130, color: "#60a5fa" },
  { label: "Wide slide card", width: 260, color: "#34d399" },
  { label: "Medium", width: 190, color: "#a78bfa" },
  { label: "Extra wide content", width: 300, color: "#f87171" },
  { label: "Tiny", width: 110, color: "#fbbf24" },
  { label: "Regular", width: 200, color: "#2dd4bf" },
  { label: "Long label here", width: 240, color: "#e879f9" },
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
  height: 140px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  user-select: none;
  flex-shrink: 0;
  padding: 0 12px;
  text-align: center;
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

.counter {
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
