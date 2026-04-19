<template>
  <div
    class="flex h-52 w-[940px] overflow-hidden bg-blue-500 py-10"
    ref="swiperRef"
  >
    <!-- Strip -->
    <div
      class="flex cursor-grab select-none active:cursor-grabbing"
      ref="stripRef"
      :style="{
        gap: `${gap}px`,
        transform: `translateX(${-xPos}px)`,
        transition: isDragging
          ? 'none'
          : 'transform 200ms cubic-bezier(0.33, 1, 0.68, 1)',
      }"
      @mousedown="startDragging"
    >
      <!-- Leading clones -->
      <template v-if="loop">
        <div
          v-for="cloneIndex in leadingCloneIndices"
          class="flex shrink-0 select-none"
          :key="`clone-lead-${cloneIndex}`"
        >
          <slot :index="cloneIndex" :slide="slides[cloneIndex]" />
        </div>
      </template>

      <!-- Real slides -->
      <div
        v-for="(slide, index) in slides"
        class="flex shrink-0 select-none"
        ref="slidesRef"
        :key="`slide-${index}`"
      >
        <slot :index :slide />
      </div>

      <!-- Trailing clones -->
      <template v-if="loop">
        <div
          v-for="cloneIndex in trailingCloneIndices"
          class="flex shrink-0 select-none"
          :key="`clone-trail-${cloneIndex}`"
        >
          <slot :index="cloneIndex" :slide="slides[cloneIndex]" />
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, useTemplateRef, computed } from "vue";

const props = withDefaults(
  defineProps<{
    slides: number[];
    slidesPerSwipe?: number;
    loop?: boolean;
    gap?: number;
  }>(),
  {
    slidesPerSwipe: 1,
    gap: 20,
  },
);

const xPos = ref(0);
const isDragging = ref(false);
const isWidthFixed = ref(false);

const swiperRef = useTemplateRef<HTMLElement>("swiperRef");
const slidesRef = useTemplateRef<HTMLElement[]>("slidesRef");
const stripRef = useTemplateRef<HTMLElement>("stripRef");

let lastMouseX = 0;

const cloneCount = Math.min(props.slidesPerSwipe + 1, props.slides.length - 1);
const leadingCloneIndices = Array.from(
  { length: cloneCount },
  (_, i) => props.slides.length - cloneCount + i,
);
const trailingCloneIndices = Array.from({ length: cloneCount }, (_, i) => i);

// Width of one slide step (slide + gap)
const slideStep = computed(() => {
  if (!slidesRef.value || slidesRef.value.length < 2) return 0;
  if (!isWidthFixed.value) return 0;
  const s0 = slidesRef.value[0];
  const s1 = slidesRef.value[1];
  if (!s0 || !s1) return 0;
  return s1.getBoundingClientRect().x - s0.getBoundingClientRect().x;
});

// Pixel offset from strip's left edge to the first real slide equaling the leading clone block width.
const loopOffset = computed(() => {
  if (!props.loop || !slidesRef.value?.length) return 0;
  const stripLeft = stripRef.value?.getBoundingClientRect().x ?? 0;
  return (slidesRef.value[0]?.getBoundingClientRect().x ?? 0) - stripLeft;
});

const startDragging = (e: MouseEvent) => {
  isDragging.value = true;
  lastMouseX = e.clientX;
  document.addEventListener("mousemove", handleDrag);
  document.addEventListener("mouseup", stopDragging);
};

const handleDrag = (e: MouseEvent) => {
  if (!isDragging.value) return;
  xPos.value += lastMouseX - e.clientX;
  lastMouseX = e.clientX;

  // Keep xPos inside the real-slide zone + clone buffer while dragging.
  if (props.loop) shiftRealSlides();
};

const stopDragging = () => {
  if (!isDragging.value) return;
  isDragging.value = false;

  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDragging);

  if (props.loop) {
    snapLoop();
  } else {
    const swiperRect = swiperRef.value?.getBoundingClientRect();
    const stripRect = stripRef.value?.getBoundingClientRect();
    if (!swiperRect || !stripRect) return;

    snapNormal(swiperRect, stripRect);
  }
};

function snapNormal(swiperRect: DOMRect, stripRect: DOMRect) {
  const maxScroll = stripRect.width - swiperRect.width;

  if (isWidthFixed.value) {
    const snapPosition =
      Math.round(xPos.value / slideStep.value) * slideStep.value;

    if (snapPosition < 0 || maxScroll < 0) {
      xPos.value = 0;
    } else if (snapPosition >= maxScroll) {
      xPos.value = maxScroll;
    } else {
      xPos.value = snapPosition;
    }
  } else {
    const positions = measureSlidePositions();
    if (!positions.length) return;

    const idx = nearestSlideIndex(positions);
    const snapPosition = positions[idx] ?? 0;

    if (snapPosition <= 0 || maxScroll < 0) {
      xPos.value = 0;
    } else if (snapPosition >= maxScroll) {
      xPos.value = maxScroll;
    } else {
      xPos.value = snapPosition;
    }
  }
}

function snapLoop() {
  if (isWidthFixed.value) {
    // Snap to nearest slide boundary.
    const totalRealWidth = slideStep.value * props.slides.length;
    const snapPosition =
      Math.round(xPos.value / slideStep.value) * slideStep.value;

    if (snapPosition < loopOffset.value) {
      xPos.value = snapPosition + totalRealWidth;
    } else if (snapPosition > loopOffset.value + totalRealWidth) {
      xPos.value = snapPosition - totalRealWidth;
    } else {
      xPos.value = snapPosition;
    }
  } else {
    // Find the nearest real-slide position in that range and update xPos.
    const positions = measureSlidePositions();
    if (positions.length < 2) return;

    const idx = nearestSlideIndex(positions);
    xPos.value = positions[idx];
  }
}

function shiftRealSlides() {
  if (!props.loop) return;

  if (isWidthFixed.value) {
    const totalRealWidth = slideStep.value * props.slides.length;

    if (xPos.value < slideStep.value) {
      xPos.value += totalRealWidth;
    } else if (
      xPos.value >
      loopOffset.value + totalRealWidth - slideStep.value
    ) {
      xPos.value -= totalRealWidth;
    }
  } else {
    // TODO: move to start drag and use a state for it
    const positions = measureSlidePositions();
    if (positions.length < 2) return;

    const totalRealWidth = positions[positions.length - 1] - positions[0];

    // Compute the rendered pixel width of the leading clone block.
    const cloneStartPos = positions[props.slides.length - cloneCount];
    const cloneWidth =
      cloneStartPos !== undefined
        ? totalRealWidth - (cloneStartPos - positions[0])
        : totalRealWidth;

    if (xPos.value < loopOffset.value - cloneWidth) {
      xPos.value += totalRealWidth;
    } else if (xPos.value > loopOffset.value + totalRealWidth - cloneWidth) {
      xPos.value -= totalRealWidth;
    }
  }
}

// Measures and returns the xPos value that would place each real slide flush
// at the left edge of the viewport, for all `slides.length` real slides.
function measureSlidePositions() {
  if (!slidesRef.value?.length || !stripRef.value) return [];
  const stripLeft = stripRef.value.getBoundingClientRect().x;
  const positions = slidesRef.value.map(
    (el) => el.getBoundingClientRect().x - stripLeft + loopOffset.value,
  );

  const lastRect =
    slidesRef.value[slidesRef.value.length - 1].getBoundingClientRect();

  const lastPos =
    positions[positions.length - 1] +
    lastRect.width +
    (props.loop ? props.gap : 0);

  positions.push(lastPos);
  return positions;
}

// find the index of the real slide whose position is closest to the current xPos.
function nearestSlideIndex(positions: number[]) {
  let best = 0;
  let bestDist = Infinity;
  // Exclude the sentinel (last element) from the search.
  for (let i = 0; i < positions.length - 1; i++) {
    const dist = Math.abs(xPos.value - positions[i]);
    if (dist < bestDist) {
      bestDist = dist;
      best = i;
    }
  }
  return best;
}

onMounted(() => {
  // Position to loopOffset so first slide is in view.
  xPos.value = loopOffset.value;

  // Detect if all slides have the same width
  if (slidesRef.value?.length) {
    const firstAmount = slidesRef.value[0].getBoundingClientRect().width;
    isWidthFixed.value = slidesRef.value.every(
      (item) => item.getBoundingClientRect().width === firstAmount,
    );
  }
});

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", handleDrag);
  document.removeEventListener("mouseup", stopDragging);
});
</script>
