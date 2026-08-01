import { computed, nextTick, ref, type Ref } from "vue";
import { getClosestSnapPosition } from "~/utils/snap";

interface UsePaginationOptions {
  xPos: Ref<number>;
  swiperCalcs: Ref<{ snapPositions: number[]; maxPos: number }>;
  orderPositions: Ref<Record<number, number>>;
  displaySlides: Ref<Array<{ order: number }>>;
  canLoop: Ref<boolean>;
  isDragging: Ref<boolean>;
  stripRef: Readonly<Ref<HTMLElement | null>>;
  rotateForward: () => number;
  rotateBackward: () => number;
  preCalc: () => void;
}

export function usePagination(opts: UsePaginationOptions) {
  const total = computed(() =>
    opts.orderPositions.value
      ? Object.keys(opts.orderPositions.value).length
      : opts.swiperCalcs.value.snapPositions.length,
  );
  const _current = ref(0);
  const current = computed({
    get: () => _current.value,
    set: (n) => {
      const t = total.value;
      _current.value = t > 0 ? ((n % t) + t) % t : 0;
    },
  });

  const setCurrentFromXPos = () => {
    const visualIdx = opts.swiperCalcs.value.snapPositions.findIndex(
      (p) => p === opts.xPos.value,
    );
    if (visualIdx !== -1) {
      const entry = opts.displaySlides.value[visualIdx];
      if (entry) _current.value = entry.order;
    }
  };

  const getSnapPosIndex = () =>
    opts.swiperCalcs.value.snapPositions.findIndex(
      (p) => p === opts.xPos.value,
    );

  const next = async () => {
    const { snapPositions, maxPos } = opts.swiperCalcs.value;
    const currentIdx = getSnapPosIndex();
    const target = snapPositions[currentIdx + 1];

    if (target === undefined) return;

    const isLoopBoundary =
      opts.canLoop.value &&
      (target === snapPositions[snapPositions.length - 1] || target === maxPos);

    if (!isLoopBoundary) {
      opts.xPos.value = target;
      const nextOrder = opts.displaySlides.value[currentIdx + 1]?.order;
      if (nextOrder !== undefined) _current.value = nextOrder;
      return;
    }

    const s = opts.rotateForward();
    if (s <= 0) return;

    opts.isDragging.value = true;
    opts.xPos.value -= s;
    await nextTick();
    opts.preCalc();
    opts.stripRef.value?.getBoundingClientRect();
    opts.isDragging.value = false;

    // One slide rotated off the front, so the slide we wanted to advance to
    // now sits at `currentIdx` — and its snap is no longer clamped to maxPos,
    // so we can land on it cleanly instead of bouncing back.
    const { snapPositions: snaps, maxPos: max } = opts.swiperCalcs.value;
    const advanced = snaps[currentIdx];

    opts.xPos.value =
      advanced ??
      getClosestSnapPosition(Math.round(opts.xPos.value), max, snaps);
    setCurrentFromXPos();
  };

  const previous = () => {
    const { snapPositions } = opts.swiperCalcs.value;
    const currentIdx = getSnapPosIndex();
    const prevPos = snapPositions?.[currentIdx - 1];

    if (prevPos !== undefined) {
      opts.xPos.value = prevPos;
      const prevOrder = opts.displaySlides.value[currentIdx - 1]?.order;
      if (prevOrder !== undefined) _current.value = prevOrder;
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
      setCurrentFromXPos();
    });
  };

  const goToIndex = (index: number) => {
    const pos = opts.orderPositions.value[index];
    if (pos !== undefined) {
      opts.xPos.value = pos;
      _current.value = index;
    }
  };

  return {
    current,
    total,
    next,
    previous,
    goToIndex,
  };
}
