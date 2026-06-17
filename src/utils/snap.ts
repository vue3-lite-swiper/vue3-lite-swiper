import type { ShallowRef } from "vue";

type SwiperRefs = {
  swiperRef: Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>>;
  slidesRef: Readonly<
    ShallowRef<HTMLDivElement[] | null, HTMLDivElement[] | null>
  >;
  stripRef: Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>>;
};

type FixedSwiperRefs = {
  swiperRef: Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>>;
  stripRef: Readonly<ShallowRef<HTMLDivElement | null, HTMLDivElement | null>>;
};

export function getFixedSnapPositions(
  swiperRefs: FixedSwiperRefs,
  slideCount: number,
  slideWidth: number,
  slidesPerSwipe: number,
) {
  const { swiperRef, stripRef } = swiperRefs;

  if (!swiperRef.value || !stripRef.value || slideCount === 0) {
    return { snapPositions: [0], maxPos: 0 };
  }

  const swiperRect = swiperRef.value.getBoundingClientRect();
  const swiperStyle = getComputedStyle(swiperRef.value);
  const viewportWidth =
    swiperRect.width -
    parseFloat(swiperStyle.paddingLeft) -
    parseFloat(swiperStyle.paddingRight);
  const gap = parseFloat(getComputedStyle(stripRef.value).columnGap) || 0;

  const stripWidth =
    slideCount * slideWidth + Math.max(0, slideCount - 1) * gap;
  const maxPos = Math.max(0, Math.round(stripWidth - viewportWidth));
  const stride = slideWidth + gap;

  const snapPositions: number[] = [0];
  for (let i = slidesPerSwipe; i < slideCount; i += slidesPerSwipe) {
    const pos = Math.round(i * stride);
    //  use <= maxPos (not < maxPos) so the last stride-aligned
    // snap is included, then we add maxPos only if it's truly different
    if (pos <= maxPos) snapPositions.push(pos);
  }

  // push maxPos if it's not already the last entry
  if (snapPositions[snapPositions.length - 1] !== maxPos) {
    snapPositions.push(maxPos);
  }

  return { snapPositions, maxPos };
}

export function getSnapPositions(
  swiperRefs: SwiperRefs,
  slidesPerSwipe: number,
  currentXPos: number,
) {
  const { slidesRef, stripRef, swiperRef } = swiperRefs;

  if (!slidesRef.value || !stripRef.value || !swiperRef.value) {
    return { snapPositions: [0], maxPos: 0 };
  }

  const swiperViewRect = swiperRef.value.getBoundingClientRect();
  const stripRect = stripRef.value.getBoundingClientRect();

  //  swiperRef.left is stable; strip.left shifts with translation
  // Natural strip origin = swiperRef.left (since strip starts at swiper when xPos=0)
  const swiperLeft = swiperViewRect.left;

  const slideScrollOffsets = slidesRef.value.map((slide) => {
    const slideRect = slide.getBoundingClientRect();
    // slideRect.left - swiperLeft = visual offset from swiper edge
    // + currentXPos corrects for current translation
    return Math.round(slideRect.left - swiperLeft + currentXPos);
  });

  const maxPos = Math.max(
    0,
    Math.round(stripRect.width - swiperViewRect.width),
  );

  const snapPositions: number[] = [0];

  for (
    let i = slidesPerSwipe;
    i < slideScrollOffsets.length;
    i += slidesPerSwipe
  ) {
    const pos = slideScrollOffsets[i];
    if (pos > 0 && pos < maxPos) {
      snapPositions.push(pos);
    }
  }

  if (snapPositions[snapPositions.length - 1] !== maxPos && maxPos > 0) {
    snapPositions.push(maxPos);
  }

  return { snapPositions, maxPos };
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
