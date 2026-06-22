<template>
  <!-- Swiper -->
  <div
    class="vls"
    ref="swiper"
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
        v-for="(entry, index) in displaySlides"
        :key="entry.order"
        class="vls-slide"
        ref="slides"
      >
        <slot :item="entry.item" :index="entry.order" />
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

const xPos = ref(0);
const isDragging = ref(false);

const swiperRef = useTemplateRef("swiper");
const slidesRef = useTemplateRef("slides");
const stripRef = useTemplateRef("strip");

const {
  displaySlides,
  canLoop,
  rotateForward,
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
let dragStartIndex = 0;
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
      { swiperRef },
      displaySlides.value.length,
      props.slideWidth,
      props.slidesPerSwipe,
      props.gap,
    );
  } else {
    swiperCalcs.value = getSnapPositions(
      { swiperRef, slidesRef, stripRef },
      props.slidesPerSwipe,
      xPos.value,
    );
  }

  const snaps = swiperCalcs.value.snapPositions;
  const op: Record<number, number> = {};
  if (snaps.length === 0) return;
  if (props.mode === "fixed" && props.slideWidth !== undefined) {
    const stride = props.slideWidth + props.gap;
    displaySlides.value.forEach((entry, visualIdx) => {
      const visualPos = Math.round(visualIdx * stride);
      const snap = snaps.reduce((closest, p) =>
        Math.abs(p - visualPos) < Math.abs(closest - visualPos) ? p : closest,
      );
      op[entry.order] = snap;
    });
  } else {
    displaySlides.value.forEach((entry, visualIdx) => {
      const snapIdx = Math.min(
        Math.floor(visualIdx / props.slidesPerSwipe),
        snaps.length - 1,
      );
      op[entry.order] = snaps[snapIdx];
    });
  }
  orderPositions.value = op;
};

const startDragging = (e: MouseEvent | TouchEvent) => {
  isDragging.value = true;
  lastMouseX = getClientX(e);
  dragStartIndex = swiperCalcs.value.snapPositions.findIndex(
    (p) => p === xPos.value,
  );

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
      const forwardThreshold =
        snapPositions[snapPositions.length - 2] ?? swiperCalcs.value.maxPos;

      if (xPos.value + delta < 0) {
        const s = rotateBackward();
        if (s > 0) {
          await nextTick();
          preCalc();
          xPos.value += s;
        }
      } else if (xPos.value + delta > forwardThreshold) {
        const s = rotateForward();
        if (s > 0) {
          await nextTick();
          preCalc();
          xPos.value -= s;
        }
      }
    }
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

  const endIndex = snapPositions.findIndex((p) => p === xPos.value);
  if (endIndex !== -1) {
    const entry = displaySlides.value[endIndex];
    if (entry) current.value = entry.order;
  }

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

const orderPositions = ref<Record<number, number>>({});

const { current, total, next, previous, goToIndex } = usePagination({
  xPos,
  swiperCalcs,
  orderPositions,
  displaySlides,
  canLoop,
  isDragging,
  stripRef,
  rotateForward,
  rotateBackward,
  preCalc,
});

const { start: startAutoPlay, stop: stopAutoPlay } = useAutoPlay({
  canLoop,
  current,
  total,
  next,
  goToIndex,
  enabled: () => !!props.autoPlay,
  interval: props.autoPlayInterval,
});

onMounted(async () => {
  initLoop();

  await nextTick();
  preCalc();

  resizeObserver = new ResizeObserver(() => {
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
  current,
  total,
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
  cursor: grab;
  user-select: none;
}

.vls-strip:active {
  cursor: grabbing;
}

.vls-slide {
  display: flex;
  flex-shrink: 0;
  user-select: none;
  pointer-events: none;
}
</style>
