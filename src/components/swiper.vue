<template>
  <!-- Swiper -->
  <div class="flex overflow-hidden" ref="swiper">
    <!-- Strip -->
    <div
      ref="strip"
      :class="[
        'cursor-grab select-none active:cursor-grabbing',
        mode === 'fixed' ? 'grid grid-flow-col' : 'flex',
      ]"
      :style="{
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
        v-for="(item, index) in displaySlides"
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
import {
  nextTick,
  onMounted,
  ref,
  useTemplateRef,
  onBeforeUnmount,
} from "vue";
import { getClientX } from "~/utils/client";
import { useAutoPlay } from "~/composables/useAutoPlay";
import { usePagination } from "~/composables/usePagination";

const props = withDefaults(
  defineProps<{
    slides: T[];
    slidesPerSwipe?: number;
    autoPlay?: boolean;
    loop?: boolean;
    mode?: "fixed" | "auto";
    slideWidth?: number;
    gap?: number;
  }>(),
  {
    slidesPerSwipe: 1,
    mode: "fixed",
    gap: 20,
  },
);

const xPos = ref(0);
const isDragging = ref(false);
const canLoop = ref(false);
const displaySlides = ref<T[]>([...props.slides]);

const swiperRef = useTemplateRef("swiper");
const slidesRef = useTemplateRef("slides");
const stripRef = useTemplateRef("strip");

let lastMouseX = 0;

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
  swiperCalcs.value = getSnapPositions(
    { swiperRef, slidesRef, stripRef },
    props.slidesPerSwipe,
  );
};

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

const handleDrag = async (e: MouseEvent | TouchEvent) => {
  if (isDragging.value) {
    const currentMouseX = getClientX(e) ?? 0;

    const delta = lastMouseX - currentMouseX;
    if (canLoop.value) {
      if (xPos.value + delta < 0) {
        // pop last item
        const s = lastSlideStride();
        const last = displaySlides.value.pop();

        if (last !== undefined) {
          // add it to the start of the array
          displaySlides.value.unshift(last);
          await nextTick();
          preCalc();
          // adjust x-position to account for the item being prepended
          xPos.value += s;
        }
      } else if (xPos.value + delta > swiperCalcs.value.maxPos) {
        // shift first item
        const s = firstSlideStride();
        const first = displaySlides.value.shift();
        if (first !== undefined) {
          // add it to the end of the array
          displaySlides.value.push(first);
          await nextTick();
          preCalc();
          // adjust x-position to account for the item being removed from the start
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

const firstSlideStride = (): number => {
  if (props.mode === "fixed") {
    return (props.slideWidth ?? 0) + props.gap;
  }
  const slide = slidesRef.value?.at(0);
  if (!slide) return props.gap;
  return slide.getBoundingClientRect().width + props.gap;
};

const lastSlideStride = (): number => {
  if (props.mode === "fixed") {
    return (props.slideWidth ?? 0) + props.gap;
  }
  const slide = slidesRef.value?.at(-1);
  if (!slide) return props.gap;
  return slide.getBoundingClientRect().width + props.gap;
};

const { pagination, next, previous, goToIndex } = usePagination({
  xPos,
  swiperCalcs,
  canLoop,
  displaySlides,
  isDragging,
  stripRef,
  firstSlideStride,
  lastSlideStride,
  preCalc,
});

const { start: startAutoPlay, stop: stopAutoPlay } = useAutoPlay({
  canLoop,
  pagination,
  next,
  goToIndex,
  enabled: () => !!props.autoPlay,
});

const computeSlidesPerView = () => {
  const swiperWidth = swiperRef.value?.getBoundingClientRect().width ?? 0;
  if (!swiperWidth) return 1;

  if (props.mode === "fixed" && props.slideWidth) {
    return Math.floor(swiperWidth / firstSlideStride());
  }

  // auto mode: count slides until they fill the viewport
  const slides = slidesRef.value ?? [];
  let acc = 0;
  let count = 0;
  for (const s of slides) {
    acc += s.getBoundingClientRect().width + props.gap;
    count++;
    if (acc >= swiperWidth) break;
  }
  return count || 1;
};

onMounted(async () => {
  if (props.loop) {
    const spv = computeSlidesPerView();

    if (props.slides.length < spv) {
      // not enough slides to loop visually — keep canLoop false
    } else if (props.slides.length <= spv + 1) {
      // barely enough — append spv slides as off-screen buffer for rotation
      displaySlides.value = [...props.slides, ...props.slides.slice(0, spv)];
      canLoop.value = true;
    } else {
      canLoop.value = true;
    }
  }

  await nextTick();
  preCalc();

  if (props.autoPlay) startAutoPlay();
});

onBeforeUnmount(() => {
  stopAutoPlay();
});

defineExpose({
  pagination,
  next,
  previous,
  goToIndex,
});
</script>
