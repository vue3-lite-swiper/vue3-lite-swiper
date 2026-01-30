import type { ShallowRef } from "vue";

type SwiperRefs = {
  swiperRef: Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>>;
  slidesRef: Readonly<
    ShallowRef<HTMLDivElement[] | null, HTMLDivElement[] | null>
  >;
  stripRef: Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>>;
};

export function getSnapPositions(
  swiperRefs: SwiperRefs,
  slidesPerSwipe: number,
) {
  const { slidesRef, stripRef, swiperRef } = swiperRefs;

  if (!slidesRef.value || !stripRef.value || !swiperRef.value) {
    console.error("one of the swiper refs are undefined", {
      slidesRef: slidesRef.value,
      stripRef: stripRef.value,
      swiperRef: swiperRef.value,
    });
    return { snapPositions: [0], maxPos: 0 };
  }

  // Compute absolute left positions of each slide relative to the strip's start
  // Since getBoundingClientRect() is relative to viewport, we need a common reference.
  // We'll use the first slide's x as origin (or strip's x if available)

  const stripLeft = slidesRef.value[0]?.getBoundingClientRect().x ?? 0;

  const swiperViewRect = swiperRef.value.getBoundingClientRect();
  const stripRect = stripRef.value.getBoundingClientRect();

  // Build array of actual scroll offsets where each slide starts
  const slideScrollOffsets = slidesRef.value.map((slide) =>
    Math.round(slide.getBoundingClientRect().x - stripLeft),
  );

  // Determine valid snap positions: every `slidesPerSwipe`-th slide
  const snapPositions: number[] = [0];
  for (let i = 0; i < slideScrollOffsets.length - 1; i += slidesPerSwipe) {
    const pos = slideScrollOffsets[i];
    if (pos) snapPositions.push(pos);
  }

  // Also allow snapping to the end if needed (optional but safe)
  const maxPos = Math.max(
    0,
    Math.round((stripRect?.width ?? 0) - (swiperViewRect?.width ?? 0)),
  );

  snapPositions.push(maxPos);

  return {
    snapPositions,
    maxPos,
  };
}

export function getClosestSnapPosition(
  currentPos: number,
  maxPos: number,
  snapPositions: number[],
) {
  // Find the closest snap position to current xPos
  let closestSnap = 0;
  let minDistance = Infinity;
  for (const pos of snapPositions) {
    const dist = Math.abs(pos - currentPos);
    if (dist < minDistance) {
      minDistance = dist;
      closestSnap = pos;
    }
  }

  // Clamp to valid range [0, maxScroll]
  return Math.min(maxPos, Math.max(0, closestSnap));
}
