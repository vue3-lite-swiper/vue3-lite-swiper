import { computed, nextTick, ref, type Ref } from "vue";
import { getClosestSnapPosition } from "~/utils/snap";

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
  const _current = ref(0);
  const current = computed({
    get: () => _current.value,
    set: (n) => {
      _current.value = ((n % total.value) + total.value) % total.value;
    },
  });
  const total = computed(() => opts.swiperCalcs.value.snapPositions.length);

  const getSnapPosIndex = () =>
    opts.swiperCalcs.value.snapPositions.findIndex(
      (p) => p === opts.xPos.value,
    );

  const next = async () => {
    const { snapPositions, maxPos } = opts.swiperCalcs.value;
    const target = snapPositions[getSnapPosIndex() + 1];

    if (target === undefined) return;

    const isLoopBoundary =
      opts.canLoop.value &&
      (target === snapPositions[snapPositions.length - 1] || target === maxPos);

    if (!isLoopBoundary) {
      opts.xPos.value = target;
      current.value += 1;
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

    const { snapPositions: snaps, maxPos: max } = opts.swiperCalcs.value;
    const pos = Math.round(opts.xPos.value);
    const safeNext = snaps.slice(0, -1).find((p) => p > pos);

    opts.xPos.value = safeNext ?? getClosestSnapPosition(pos, max, snaps);
    current.value += 1;
  };

  const previous = () => {
    const { snapPositions } = opts.swiperCalcs.value;
    const prevPos = snapPositions?.[getSnapPosIndex() - 1];

    if (prevPos !== undefined) {
      opts.xPos.value = prevPos;
      current.value -= 1;
      return;
    }

    if (!opts.canLoop.value) return;

    const s = opts.rotateBackward();
    if (s === 0) return;

    opts.isDragging.value = true;
    opts.xPos.value += s;
    current.value -= 1;
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
      current.value = index;
    } else {
      throw new Error(`index [${index}] is out of bound`);
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
