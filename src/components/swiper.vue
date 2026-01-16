<template>
  <!-- Swiper -->
  <div class="flex overflow-hidden" ref="swiper">
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
import { computed, ref, useTemplateRef } from "vue";

const props = withDefaults(
  defineProps<{
    slidesNum: number;
    slidesPerSwipe?: number;
  }>(),
  {
    slidesPerSwipe: 1,
  },
);

const xPos = ref(0);
const isDragging = ref(false);

const swiperRef = useTemplateRef("swiper");
const slidesRef = useTemplateRef("slides");
const stripRef = useTemplateRef("strip");

let lastMouseX = 0;
let firstSlideIndex = 0;
let isForward = true;

// Generalize slides count and slide width

const startDragging = (e: MouseEvent) => {
  isDragging.value = true;
  lastMouseX = e.clientX;
  document.addEventListener("mousemove", handleDrag);
  document.onmouseup = stopDragging;
};

const handleDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    const delta = lastMouseX - e.clientX;
    isForward = delta > 0;
    xPos.value += delta;
    lastMouseX = e.clientX;
  }
};

const stopDragging = () => {
  const swiperViewRect = swiperRef.value?.getBoundingClientRect();
  const slidesRects = slidesRef.value?.map((slide) =>
    slide.getBoundingClientRect(),
  );

  if (!slidesRects?.[0]) {
    xPos.value = 0;
    isDragging.value = false;
    document.onmouseup = null;
    document.removeEventListener("mousemove", handleDrag);
    return;
  }

  // Compute absolute left positions of each slide relative to the strip's start
  // Since getBoundingClientRect() is relative to viewport, we need a common reference.
  // We'll use the first slide's x as origin (or strip's x if available)
  const stripRect = stripRef.value?.getBoundingClientRect();
  const stripLeft = stripRect?.x ?? slidesRects[0].x; // fallback to first slide

  // Build array of actual scroll offsets where each slide starts
  const slideScrollOffsets = slidesRects.map((rect) => rect.x - stripLeft);

  // Determine valid snap positions: every `slidesPerSwipe`-th slide
  const snapPositions: number[] = [];
  for (let i = 0; i < slideScrollOffsets.length; i += props.slidesPerSwipe) {
    const pos = slideScrollOffsets[i];
    if (pos) snapPositions.push(pos);
  }

  console.log(snapPositions);

  // Also allow snapping to the end if needed (optional but safe)
  const maxScroll = Math.max(
    0,
    (stripRect?.width ?? 0) - (swiperViewRect?.width ?? 0),
  );

  const lastPos = snapPositions[snapPositions.length - 1];
  if (snapPositions.length === 0 || (lastPos && lastPos < maxScroll)) {
    // Ensure we can snap to the very end if content overflows
    snapPositions.push(maxScroll);
  }

  // Find the closest snap position to current xPos
  let closestSnap = 0;
  let minDistance = Infinity;
  for (const pos of snapPositions) {
    const dist = Math.abs(pos - xPos.value);
    if (dist < minDistance) {
      minDistance = dist;
      closestSnap = pos;
    }
  }

  // Clamp to valid range [0, maxScroll]
  closestSnap = Math.min(maxScroll, Math.max(0, closestSnap));

  // Update state
  xPos.value = closestSnap;

  // Optional: update firstSlideIndex based on snapped position
  // Find which group we snapped to
  const snappedGroupIndex = snapPositions.indexOf(closestSnap);
  if (
    snappedGroupIndex !== -1 &&
    snappedGroupIndex * props.slidesPerSwipe < slidesRects.length
  ) {
    firstSlideIndex = snappedGroupIndex * props.slidesPerSwipe;
  }

  isDragging.value = false;
  document.onmouseup = null;
  document.removeEventListener("mousemove", handleDrag);
};
</script>
