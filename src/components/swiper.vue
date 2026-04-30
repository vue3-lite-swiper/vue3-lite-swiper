<template>
  <!-- Swiper -->
  <div class="flex overflow-hidden" ref="swiper">
    <!-- Strip -->
    <div
      ref="strip"
      :class="[
        'cursor-grab gap-5 select-none active:cursor-grabbing',
        mode === 'fixed' ? 'grid grid-flow-col' : 'flex',
      ]"
      :style="{
        transform: `translateX(${-xPos}px)`,
        transition: isDragging
          ? 'none'
          : 'transform 200ms cubic-bezier(0.33, 1, 0.68, 1)',
        ...(mode === 'fixed' && slideWidth !== undefined
          ? { gridAutoColumns: `${slideWidth}px` }
          : {}),
      }"
      @mousedown="startDragging"
      @touchstart="startDragging"
    >
      <!-- Slides -->
      <div
        v-for="(item, index) in slides"
        class="flex shrink-0 select-none"
        ref="slides"
      >
        <slot :item :index />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T">
import {
  getClosestSnapPosition,
  getFixedSnapPositions,
  getSnapPositions,
} from "~/utils/snap";
import { computed, onMounted, ref, useTemplateRef, watch } from "vue";
import { getClientX } from "~/utils/client";

const props = withDefaults(
  defineProps<{
    slides: T[];
    slidesPerSwipe?: number;
    autoPlay?: boolean;
    mode?: "fixed" | "auto";
    slideWidth?: number;
  }>(),
  {
    slidesPerSwipe: 1,
    mode: "fixed",
  },
);

const xPos = ref(0);
const isDragging = ref(false);

const swiperRef = useTemplateRef("swiper");
const slidesRef = useTemplateRef("slides");
const stripRef = useTemplateRef("strip");

let lastMouseX = 0;
let autoPlayIntervalId: number;

const swiperCalcs = computed(() => {
  if (props.mode === "fixed") {
    if (props.slideWidth === undefined) {
      console.error('Swiper: `slideWidth` is required when `mode` is "fixed".');
      return { snapPositions: [0], maxPos: 0 };
    }
    return getFixedSnapPositions(
      { swiperRef, stripRef },
      props.slides.length,
      props.slideWidth,
      props.slidesPerSwipe,
    );
  }
  return getSnapPositions(
    { swiperRef, slidesRef, stripRef },
    props.slidesPerSwipe,
  );
});

const pagination = computed(() => {
  const { snapPositions } = swiperCalcs.value;

  return {
    current: snapPositions.findIndex((item) => item === xPos.value),
    total: snapPositions.length,
  };
});

const startDragging = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  lastMouseX = getClientX(e) ?? 0;

  if (e instanceof MouseEvent) {
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDragging);
  } else {
    document.addEventListener("touchmove", handleDrag);
    document.addEventListener("touchend", stopDragging);
    document.addEventListener("touchcancel", stopDragging);
  }
};

const handleDrag = (e: MouseEvent | TouchEvent) => {
  if (isDragging.value) {
    const currentMouseX = getClientX(e) ?? 0;

    const delta = lastMouseX - currentMouseX;
    xPos.value += delta;
    lastMouseX = currentMouseX;
  }
};

const stopDragging = () => {
  if (!slidesRef.value?.[0]) {
    xPos.value = 0;
    isDragging.value = false;
    removeAllEventListeners();
    return;
  }

  const { maxPos, snapPositions } = swiperCalcs.value;

  xPos.value = getClosestSnapPosition(xPos.value, maxPos, snapPositions);

  isDragging.value = false;
  removeAllEventListeners();
};

const removeAllEventListeners = () => {
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDragging);
  document.removeEventListener("touchmove", handleDrag);
  document.removeEventListener("touchend", stopDragging);
  document.removeEventListener("touchcancel", stopDragging);
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
