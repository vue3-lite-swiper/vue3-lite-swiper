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
        class="flex cursor-grab gap-5 px-5 select-none active:cursor-grabbing"
        ref="strip"
        :style="{
          transform: `translateX(${-xDelta}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 200ms cubic-bezier(0.33, 1, 0.68, 1)',
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
const slidesPerSwipe = ref(1);
const isDragging = ref(false);
const firstSlideIndex = ref(0);

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
  const swiperViewRect = swiperRef.value?.getBoundingClientRect();

  const firstSlideRect =
    slidesRef.value?.[firstSlideIndex.value]?.getBoundingClientRect();
  const targetSlideRect =
    slidesRef.value?.[
      firstSlideIndex.value + slidesPerSwipe.value
    ]?.getBoundingClientRect();

  if (!firstSlideRect || !targetSlideRect) {
    console.warn(
      "slides per swipe exceeds number of slides",
      firstSlideIndex.value + slidesPerSwipe.value,
    );

    xDelta.value = 0;

    isDragging.value = false;

    document.onmouseup = null;
    document.removeEventListener("mousemove", handleDrag);

    return;
  }

  const SLIDE_STEP = targetSlideRect.x - firstSlideRect.x;

  if (!isDragging.value) return;
  isDragging.value = false;

  const snapPosition = Math.round(xDelta.value / SLIDE_STEP) * SLIDE_STEP;

  const stripRect = stripRef.value?.getBoundingClientRect();
  const maxScroll = (stripRect?.width ?? 0) - (swiperViewRect?.width ?? 0);

  // avoid overflowing min
  if (snapPosition < 0 || maxScroll < 0) {
    xDelta.value = 0;
    console.log("too small");
  }
  // avoid over flowing max
  else if (snapPosition >= maxScroll) {
    xDelta.value = maxScroll;
    console.log("too large");
  }
  // snap to next or previous slide
  else if (
    (snapPosition / SLIDE_STEP) * slidesPerSwipe.value !==
    firstSlideIndex.value
  ) {
    console.log(
      "snap ",
      firstSlideIndex.value,
      "to: ",
      (snapPosition / SLIDE_STEP) * slidesPerSwipe.value,
    );

    firstSlideIndex.value = (snapPosition / SLIDE_STEP) * slidesPerSwipe.value;

    xDelta.value = snapPosition;
  }
  // snap back into place
  else {
    console.log(
      "snap back",
      firstSlideIndex.value,
      (snapPosition / SLIDE_STEP) * slidesPerSwipe.value,
    );

    xDelta.value = snapPosition;
  }

  document.onmouseup = null;
  document.removeEventListener("mousemove", handleDrag);
};
</script>
