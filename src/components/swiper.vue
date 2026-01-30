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
import { getClosestSnapPosition, getSnapPositions } from "~/utils/snap";
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

const startDragging = (e: MouseEvent) => {
  isDragging.value = true;
  lastMouseX = e.clientX;
  document.addEventListener("mousemove", handleDrag);
  document.onmouseup = stopDragging;
};

const handleDrag = (e: MouseEvent) => {
  if (isDragging.value) {
    const delta = lastMouseX - e.clientX;
    xPos.value += delta;
    lastMouseX = e.clientX;
  }
};

const stopDragging = () => {
  if (!slidesRef.value?.[0]) {
    xPos.value = 0;
    isDragging.value = false;
    document.onmouseup = null;
    document.removeEventListener("mousemove", handleDrag);
    return;
  }

  const { snapPositions, maxPos } = getSnapPositions(
    { swiperRef, slidesRef, stripRef },
    props.slidesPerSwipe,
  );

  xPos.value = getClosestSnapPosition(xPos.value, maxPos, snapPositions);

  isDragging.value = false;
  document.onmouseup = null;
  document.removeEventListener("mousemove", handleDrag);
};

const next = () => {
  const { snapPositions } = getSnapPositions(
    { swiperRef, slidesRef, stripRef },
    props.slidesPerSwipe,
  );

  const index = snapPositions.findIndex((item) => item === xPos.value);

  if (index === -1) return;

  const nextPos = snapPositions?.[index + 1];

  if (nextPos) {
    xPos.value = nextPos;
  }
};

const previous = () => {
  const { snapPositions } = getSnapPositions(
    { swiperRef, slidesRef, stripRef },
    props.slidesPerSwipe,
  );

  const index = snapPositions.findIndex((item) => item === xPos.value);

  const prevPos = snapPositions?.[index - 1];

  if (prevPos !== undefined) {
    xPos.value = prevPos;
  }
};

defineExpose({
  next,
  previous,
});

/**
 * We can create a common utility function that get the closes snap position to by current delta
 * and use it for both mouse swipe and programmatic swipe
 *
 * FIXME: the only thing i hate about this is that it has O(n) complexity because we calculate all possible snap positions on every
 * swipe this won't scale properly.
 *
 * FIXME: I weird bug appeared when i increase the number of slides per swipe the reach that end i can't go back to 0 (first) slide
 *
 * Number of possible swipes = slides/slides_per_swipe (useful when creating pagination component)
 * Create next and previous functions to navigate the swiper programmatically
 */
</script>
