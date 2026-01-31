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
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";

const props = withDefaults(
  defineProps<{
    slidesNum: number;
    slidesPerSwipe?: number;
    autoPlay?: boolean;
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
let autoPlayIntervalId: number;

const swiperCalcs = computed(() =>
  getSnapPositions({ swiperRef, slidesRef, stripRef }, props.slidesPerSwipe),
);

const pagination = computed(() => {
  const { snapPositions } = swiperCalcs.value;

  return {
    current: snapPositions.findIndex((item) => item === xPos.value),
    total: snapPositions.length,
  };
});

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

  const { maxPos, snapPositions } = swiperCalcs.value;

  xPos.value = getClosestSnapPosition(xPos.value, maxPos, snapPositions);

  isDragging.value = false;
  document.onmouseup = null;
  document.removeEventListener("mousemove", handleDrag);
};

const next = () => {
  const { snapPositions } = swiperCalcs.value;

  const nextPos = snapPositions?.[pagination.value.current + 1];

  if (nextPos !== undefined) {
    xPos.value = nextPos;
  }
};

const previous = () => {
  const { snapPositions } = swiperCalcs.value;

  const prevPos = snapPositions?.[pagination.value.current - 1];

  if (prevPos !== undefined) {
    xPos.value = prevPos;
  }
};

const goToIndex = (index: number) => {
  const { snapPositions } = swiperCalcs.value;

  const pos = snapPositions?.[index];
  if (pos !== undefined) {
    xPos.value = pos;
  } else {
    throw new Error(`index [${index}] is out of bound`);
  }
};

const startAutoPlay = () => {
  autoPlayIntervalId = setInterval(() => {
    if (pagination.value.current === pagination.value.total - 1) {
      goToIndex(0);
    } else {
      next();
    }
  }, 500);
};

const stoptAutoPlay = () => {
  clearInterval(autoPlayIntervalId);
};

watch(
  () => props.autoPlay,
  (newValue) => {
    if (newValue) {
      startAutoPlay();
    } else {
      stoptAutoPlay();
    }
  },
);

onMounted(() => {
  if (props.autoPlay) {
    startAutoPlay();
  }
});

defineExpose({
  pagination,
  next,
  previous,
  goToIndex,
});

/**
 * Number of possible swipes = slides/slides_per_swipe (useful when creating pagination component)
 * Create next and previous functions to navigate the swiper programmatically
 *
 * if the slides reached the end what do i do?
 * loop we need loop option i imaging it will be unshift then shift and adjust current index
 * loop back until you reach the start
 * reset go back to start then continue auto play
 */
</script>
