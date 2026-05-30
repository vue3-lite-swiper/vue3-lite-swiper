import { computed, nextTick, type Ref } from "vue";

interface UsePaginationOptions {
  xPos: Ref<number>;
  swiperCalcs: Ref<{ snapPositions: number[]; maxPos: number }>;
  canLoop: Ref<boolean>;
  isDragging: Ref<boolean>;
  stripRef: Readonly<Ref<HTMLElement | null>>;
  rotateForward: () => number;
  rotateBackward: () => number;
  preCalc: () => void;
}

export function usePagination(opts: UsePaginationOptions) {
  const pagination = computed(() => {
    const { snapPositions } = opts.swiperCalcs.value;
    return {
      current: snapPositions.findIndex((item) => item === opts.xPos.value),
      total: snapPositions.length,
    };
  });

  const next = async () => {
    for (let attempt = 0; attempt < 4; attempt++) {
      const { snapPositions: snaps } = opts.swiperCalcs.value;
      const idx = snaps.findIndex((p) => p === opts.xPos.value);
      const next = snaps[idx + 1];

      if (next === undefined) return;

      const isLoopBoundary =
        opts.canLoop.value &&
        (next === snaps[snaps.length - 1] ||
          next === opts.swiperCalcs.value.maxPos);

      if (!isLoopBoundary) {
        opts.xPos.value = next;
        return;
      }

      const s = opts.rotateForward();
      if (s <= 0) return;

      opts.isDragging.value = true;
      opts.xPos.value -= s;
      await nextTick();
      opts.preCalc();
      opts.stripRef.value?.getBoundingClientRect();

      const newSnaps = opts.swiperCalcs.value.snapPositions;
      const newCur = newSnaps.findIndex(
        (p) => p === Math.round(opts.xPos.value),
      );
      const safeNext = newSnaps.slice(newCur + 1, -1)[0];

      if (safeNext !== undefined) {
        opts.isDragging.value = false;
        opts.xPos.value = safeNext;
        return;
      }

      // penultimate — reposition silently (isDragging still true) and retry
      opts.xPos.value = newSnaps[newCur] ?? next - s;
      opts.isDragging.value = false;
    }
  };

  const previous = () => {
    const { snapPositions } = opts.swiperCalcs.value;
    const prevPos = snapPositions?.[pagination.value.current - 1];

    if (prevPos !== undefined) {
      opts.xPos.value = prevPos;
      return;
    }

    if (!opts.canLoop.value) return;

    const s = opts.rotateBackward();
    if (s === 0) return;

    opts.isDragging.value = true;
    opts.xPos.value += s;
    nextTick(() => {
      opts.preCalc();
      opts.stripRef.value?.getBoundingClientRect();
      opts.isDragging.value = false;
      opts.xPos.value -= s;
    });
  };

  const goToIndex = (index: number) => {
    const { snapPositions } = opts.swiperCalcs.value;
    const pos = snapPositions?.[index];
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
