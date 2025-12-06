<template>
  <div class="flex flex-col items-center gap-5">
    <h1 class="text-6xl">Vue3 Swiper Playground</h1>
    <!-- container -->
    <div class="flex h-52 w-[450px] gap-5 overflow-hidden bg-blue-500 p-5">
      <div
        class="flex cursor-grab gap-5 active:cursor-grabbing"
        ref="strip"
        :style="{
          transform: `translateX(${xDelta}px)`,
          transition: isDragging ? 'none' : 'transform 75ms ease-out',
        }"
        @mousedown="startDragging"
      >
        <div
          v-for="i in 10"
          :key="i"
          class="block w-52 shrink-0 rounded bg-pink-200 p-5 select-none"
          ref="slides"
        >
          {{ i }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const xDelta = ref(0);
const isDragging = ref(false);

let lastMouseX = 0;

// Slide width = 208px (w-52 = 13rem = 208px), gap = 20px (gap-5) --> total = 228px
// Generalize slides count and slide width
const SLIDE_STEP = 228;

const startDragging = (e: MouseEvent) => {
  isDragging.value = true;
  lastMouseX = e.clientX;
  document.addEventListener("mousemove", handleDrag);
  document.onmouseup = stopDragging;
};

const handleDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    xDelta.value += e.clientX - lastMouseX;
    lastMouseX = e.clientX;
  }
};

const stopDragging = () => {
  if (!isDragging.value) return;
  isDragging.value = false;

  const snapPosition = Math.round(xDelta.value / SLIDE_STEP) * SLIDE_STEP;
  if (snapPosition > 0) {
    xDelta.value = 0;
  } else if (snapPosition < SLIDE_STEP * -9) {
    xDelta.value = SLIDE_STEP * -9;
  } else {
    xDelta.value = snapPosition;
  }
  document.onmouseup = null;
};
</script>
