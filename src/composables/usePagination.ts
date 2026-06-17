import { computed, nextTick, type Ref } from "vue";

interface UsePaginationOptions {
  xPos: Ref<number>;
  swiperCalcs: Ref<{ snapPositions: number[]; maxPos: number }>;
  canLoop: Ref<boolean>;
  rotationCount: Ref<number>; // NEW
  isDragging: Ref<boolean>;
  disableTransition: Ref<boolean>;
  stripRef: Readonly<Ref<HTMLElement | null>>;
  rotateForward: () => number;
  rotateBackward: () => number;
  preCalc: () => void;
}

export function usePagination(opts: UsePaginationOptions) {
  const pagination = computed(() => {
    const { snapPositions } = opts.swiperCalcs.value;
    const x = opts.xPos.value;

    let snap = snapPositions[0];
    for (const p of snapPositions) {
      if (p <= x) snap = p;
    }
    const raw = snapPositions.indexOf(snap);
    const idx = raw >= 0 ? raw : 0;
    const total = snapPositions.length;

    if (!opts.canLoop.value) {
      return { current: idx, total };
    }

    // "Un-rotate" idx back to the logical slide position
    const current =
      (((idx + opts.rotationCount.value) % total) + total) % total;
    return { current, total };
  });

  let isRotating = false;

  const next = async () => {
    if (isRotating) return;
    if (opts.swiperCalcs.value.maxPos <= 0) opts.preCalc();
    const { snapPositions, maxPos } = opts.swiperCalcs.value;

    if (opts.canLoop.value && opts.xPos.value >= maxPos) {
      isRotating = true;
      try {
        const s = opts.rotateForward();
        if (s > 0) {
          opts.disableTransition.value = true;
          opts.xPos.value -= s;
          await nextTick();
          opts.preCalc();
          await nextTick();
          opts.disableTransition.value = false;
        }
        opts.xPos.value = opts.swiperCalcs.value.maxPos;
      } finally {
        isRotating = false;
      }
      return;
    }

    const idxNow = snapPositions.indexOf(
      snapPositions.filter((p) => p <= opts.xPos.value).at(-1) ??
        snapPositions[0],
    );
    const target = snapPositions[idxNow + 1];

    if (target === undefined) {
      if (!opts.canLoop.value) return;
      opts.xPos.value = maxPos;
      return;
    }
    opts.xPos.value = target;
  };

  const previous = async () => {
    if (isRotating) return;
    if (opts.swiperCalcs.value.maxPos <= 0) opts.preCalc();
    const { snapPositions } = opts.swiperCalcs.value;

    if (opts.canLoop.value && opts.xPos.value <= 0) {
      isRotating = true;
      try {
        const s = opts.rotateBackward();
        if (s > 0) {
          opts.disableTransition.value = true;
          opts.xPos.value += s;
          await nextTick();
          opts.preCalc();
          await nextTick();
          opts.disableTransition.value = false;
        }
        opts.xPos.value = 0;
      } finally {
        isRotating = false;
      }
      return;
    }

    const idxNow = snapPositions.indexOf(
      snapPositions.filter((p) => p <= opts.xPos.value).at(-1) ??
        snapPositions[0],
    );
    const prevPos = snapPositions[idxNow - 1];

    if (prevPos !== undefined) {
      opts.xPos.value = prevPos;
      return;
    }

    if (!opts.canLoop.value) return;
    opts.xPos.value = opts.swiperCalcs.value.maxPos;
  };

  const goToIndex = (index: number) => {
    const { snapPositions } = opts.swiperCalcs.value;
    const total = snapPositions.length;

    if (opts.canLoop.value) {
      // Convert logical index back to a raw snapPositions index
      const rawIdx =
        (((index - opts.rotationCount.value) % total) + total) % total;
      const pos = snapPositions[rawIdx];
      if (pos !== undefined) {
        opts.xPos.value = pos;
        return;
      }
      throw new Error(`index [${index}] is out of bound`);
    }

    const pos = snapPositions[index];
    if (pos !== undefined) {
      opts.xPos.value = pos;
    } else {
      throw new Error(`index [${index}] is out of bound`);
    }
  };

  return {
    pagination,
    next,
    previous,
    goToIndex,
  };
}
