<template>
  <div
    class="flex h-52 w-[450px] overflow-hidden bg-blue-500 py-10"
    ref="swiper"
  >
    <!-- Strip -->
    <div
      class="flex cursor-grab gap-5 select-none active:cursor-grabbing"
      ref="strip"
      :style="{
        transform: `translateX(${-xPos}px)`,
        transition: isDragging
          ? 'none'
          : 'transform 200ms cubic-bezier(0.33, 1, 0.68, 1)',
      }"
      @mousedown="startDragging"
    >
      <!-- Slides -->
      <div
        v-for="index in slidesNum"
        class="flex shrink-0 select-none"
        ref="slides"
      >
        <slot :index />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";

withDefaults(
  defineProps<{
    slidesNum: number;
    slidesPerSwipe?: number;
  }>(),
  {
    slidesPerSwipe: 1,
  },
);

const xPos = ref(0);
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
    xPos.value += lastMouseX - e.clientX;
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

    xPos.value = 0;

    isDragging.value = false;

    document.onmouseup = null;
    document.removeEventListener("mousemove", handleDrag);

    return;
  }

  const SLIDE_STEP = targetSlideRect.x - firstSlideRect.x;

  console.log(SLIDE_STEP);

  if (!isDragging.value) return;
  isDragging.value = false;

  const snapPosition = Math.round(xPos.value / SLIDE_STEP) * SLIDE_STEP;

  const stripRect = stripRef.value?.getBoundingClientRect();
  const maxScroll = (stripRect?.width ?? 0) - (swiperViewRect?.width ?? 0);

  // avoid overflowing min
  if (snapPosition < 0 || maxScroll < 0) {
    xPos.value = 0;
    console.log("too small");
  }
  // avoid over flowing max
  else if (snapPosition >= maxScroll) {
    xPos.value = maxScroll;
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

    xPos.value = snapPosition;
  }
  // snap back into place
  else {
    console.log(
      "snap back",
      firstSlideIndex.value,
      (snapPosition / SLIDE_STEP) * slidesPerSwipe.value,
    );

    xPos.value = snapPosition;
  }

  document.onmouseup = null;
  document.removeEventListener("mousemove", handleDrag);
};
</script>
