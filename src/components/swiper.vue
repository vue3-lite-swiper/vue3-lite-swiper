<template>
  <!-- Swiper -->
  <div
    class="vls"
    ref="swiper"
    :class="{ 'vls--auto': mode === 'auto' }"
    @mouseenter="props.pauseOnHover && stopAutoPlay()"
    @mouseleave="props.pauseOnHover && props.autoPlay && startAutoPlay()"
  >
    <!-- Strip -->
    <div
      ref="strip"
      class="vls-strip"
      :style="{
        display: mode === 'fixed' ? 'grid' : 'flex',
        gridAutoFlow: 'column',
        gap: `${gap}px`,
        transform: `translateX(${-xPos}px)`,
        transition:
          isDragging || disableTransition
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
        v-for="(item, index) in displaySlides"
        class="vls-slide"
        ref="slides"
        :style="
          mode === 'auto' && autoSlideWidth
            ? { width: `${autoSlideWidth}px` }
            : {}
        "
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
import { nextTick, onMounted, ref, useTemplateRef, onBeforeUnmount } from "vue";
import { getClientX } from "~/utils/client";
import { useAutoPlay } from "~/composables/useAutoPlay";
import { usePagination } from "~/composables/usePagination";
import { useLoop } from "~/composables/useLoop";

const props = withDefaults(
  defineProps<{
    slides: T[];
    slidesPerSwipe?: number;
    autoPlay?: boolean;
    autoPlayInterval?: number;
    pauseOnHover?: boolean;
    loop?: boolean;
    mode?: "fixed" | "auto";
    slideWidth?: number;
    gap?: number;
  }>(),
  {
    slidesPerSwipe: 1,
    mode: "fixed",
    gap: 20,
    autoPlayInterval: 3000,
    pauseOnHover: true,
  },
);

const autoSlideWidth = ref<number | undefined>(undefined);
const xPos = ref(0);
const isDragging = ref(false);
const disableTransition = ref(false);

const swiperRef = useTemplateRef("swiper");
const slidesRef = useTemplateRef("slides");
const stripRef = useTemplateRef("strip");

const {
  displaySlides,
  canLoop,
  rotateForward,
  rotationCount,
  rotateBackward,
  init: initLoop,
} = useLoop({
  slides: props.slides,
  loop: !!props.loop,
  mode: () => props.mode,
  slideWidth: () => props.slideWidth,
  gap: () => props.gap,
  swiperRef,
  slidesRef,
});

let lastMouseX = 0;
let resizeObserver: ResizeObserver | null = null;

const swiperCalcs = ref<{ snapPositions: number[]; maxPos: number }>({
  snapPositions: [0],
  maxPos: 0,
});

const preCalc = () => {
  if (props.mode === "fixed") {
    if (props.slideWidth === undefined) {
      console.error('Swiper: `slideWidth` is required when `mode` is "fixed".');
      swiperCalcs.value = { snapPositions: [0], maxPos: 0 };
      return;
    }
    swiperCalcs.value = getFixedSnapPositions(
      { swiperRef, stripRef },
      displaySlides.value.length,
      props.slideWidth,
      props.slidesPerSwipe,
    );
    return;
  }

  const swiperEl = swiperRef.value;
  const slideEls = slidesRef.value;
  if (swiperEl && slideEls) {
    const swiperRect = swiperEl.getBoundingClientRect();
    const style = getComputedStyle(swiperEl);
    const viewportWidth =
      swiperRect.width -
      parseFloat(style.paddingLeft) -
      parseFloat(style.paddingRight);
    for (const slide of slideEls) {
      slide.style.maxWidth = `${viewportWidth}px`;
    }
  }

  swiperCalcs.value = getSnapPositions(
    { swiperRef, slidesRef, stripRef },
    props.slidesPerSwipe,
    xPos.value,
  );
};

const startDragging = (e: MouseEvent | TouchEvent) => {
  if (swiperCalcs.value.maxPos <= 0) preCalc();
  isDragging.value = true;
  lastMouseX = getClientX(e);

  if (e instanceof MouseEvent) {
    document.addEventListener("mousemove", handleDrag);
    document.addEventListener("mouseup", stopDragging);
  } else {
    document.addEventListener("touchmove", handleDrag);
    document.addEventListener("touchend", stopDragging);
    document.addEventListener("touchcancel", stopDragging);
  }
};

const handleDrag = async (e: MouseEvent | TouchEvent) => {
  if (isDragging.value) {
    const currentMouseX = getClientX(e);

    const delta = lastMouseX - currentMouseX;
    if (canLoop.value) {
      const { snapPositions } = swiperCalcs.value;
      const canRotate =
        swiperCalcs.value.maxPos > 0 && snapPositions.length > 2;
      const forwardThreshold =
        snapPositions[snapPositions.length - 2] ?? swiperCalcs.value.maxPos;

      if (canRotate && xPos.value + delta < 0) {
        const s = rotateBackward();
        if (s > 0) {
          await nextTick();
          preCalc();
          xPos.value += s;
        }
      } else if (canRotate && xPos.value + delta > forwardThreshold) {
        const s = rotateForward();
        if (s > 0) {
          await nextTick();
          preCalc();
          xPos.value -= s;
        }
      }
      xPos.value += delta;
    } else {
      const { maxPos } = swiperCalcs.value;
      xPos.value = Math.max(0, Math.min(xPos.value + delta, maxPos));
    }
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

  preCalc();

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

const { pagination, next, previous, goToIndex } = usePagination({
  xPos,
  swiperCalcs,
  canLoop,
  rotationCount,
  isDragging,
  disableTransition,
  stripRef,
  rotateForward,
  rotateBackward,
  preCalc,
});

const { start: startAutoPlay, stop: stopAutoPlay } = useAutoPlay({
  canLoop,
  pagination,
  next,
  goToIndex,
  enabled: () => !!props.autoPlay,
  interval: props.autoPlayInterval,
});

onMounted(async () => {
  initLoop();

  await nextTick();
  preCalc();

  if (props.mode === "auto") {
    autoSlideWidth.value = swiperRef.value?.clientWidth ?? 0; // ✅ not getBoundingClientRect
  }

  resizeObserver = new ResizeObserver(() => {
    if (props.mode === "auto") {
      autoSlideWidth.value = swiperRef.value?.clientWidth ?? 0;
    }
    if (isDragging.value) return;
    preCalc();
  });
  if (stripRef.value) resizeObserver.observe(stripRef.value);

  if (props.autoPlay) startAutoPlay();
});

onBeforeUnmount(() => {
  stopAutoPlay();
  resizeObserver?.disconnect();
});

defineExpose({
  pagination,
  next,
  previous,
  goToIndex,
});
</script>

<style scoped>
.vls {
  display: flex;
  overflow: hidden;
}

.vls-strip {
  flex-shrink: 0;
  cursor: grab;
  user-select: none;
}

.vls-strip:active {
  cursor: grabbing;
}

.vls-slide {
  display: flex;
  flex-shrink: 0;
  min-width: 0;
  user-select: none;
  pointer-events: none;
}
</style>
