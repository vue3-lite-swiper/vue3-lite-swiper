<template>
  <div class="flex flex-col items-center gap-5">
    <h1 class="text-6xl">Vue3 Swiper Playground</h1>
    <!-- container -->
    <div
      class="flex h-52 w-[450px] overflow-hidden bg-blue-500 py-10"
      ref="swiper"
    >
      <!-- Strip -->
      <div
        class="flex cursor-grab gap-5 active:cursor-grabbing"
        ref="strip"
        :style="{
          transform: `translateX(${-1 * xDelta}px)`,
          transition: isDragging ? 'none' : 'transform 75ms ease-out',
        }"
        @mousedown="startDragging"
      >
        <!-- Slides -->
        <div
          v-for="i in num"
          :key="i"
          class="block w-32 shrink-0 rounded bg-pink-200 p-5 select-none"
          ref="slides"
        >
          {{ i }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

const xDelta = ref(0);
const num = ref(12);
const slidesPerSwipe = ref(4);
const isDragging = ref(false);
const swiperRef = useTemplateRef("swiper");
const slidesRef = useTemplateRef("slides");
const stripRef = useTemplateRef("strip");

let lastMouseX = 0;

// Generalize slides count and slide width

const startDragging = (e: MouseEvent) => {
  isDragging.value = true;
  lastMouseX = e.clientX;
  document.addEventListener("mousemove", handleDrag);
  document.onmouseup = stopDragging;
};

const handleDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    xDelta.value += lastMouseX - e.clientX;
    lastMouseX = e.clientX;
  }
};

const stopDragging = () => {
  // signs are inverted which causes some confusion
  const swiperViewRect = swiperRef.value?.getBoundingClientRect();

  const SLIDE_STEP =
    (slidesRef.value?.[1]?.getBoundingClientRect().x ?? 0) -
    (slidesRef.value?.[0]?.getBoundingClientRect().x ?? 0);

  if (!isDragging.value) return;
  isDragging.value = false;

  const snapPosition = Math.round(xDelta.value / SLIDE_STEP) * SLIDE_STEP;
  const slidesPerView = (swiperViewRect?.width ?? 0) / SLIDE_STEP;

  if (snapPosition < 0 || slidesPerView > num.value) {
    xDelta.value = 0;
  } else if (snapPosition > SLIDE_STEP * (num.value - slidesPerView)) {
    xDelta.value = SLIDE_STEP * (num.value - slidesPerView);
  } else {
    xDelta.value = snapPosition;
  }

  document.onmouseup = null;
};
</script>
