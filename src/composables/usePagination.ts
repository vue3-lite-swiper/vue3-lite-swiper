import { computed, nextTick, type Ref } from "vue";
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
  const pagination = computed(() => {
    const { snapPositions } = opts.swiperCalcs.value;
    return {
      current: snapPositions.findIndex((item) => item === opts.xPos.value),
      total: snapPositions.length,
    };
  });

  const next = async () => {
    const { snapPositions, maxPos } = opts.swiperCalcs.value;
    const target = snapPositions[pagination.value.current + 1];

    if (target === undefined) return;

    const isLoopBoundary =
      opts.canLoop.value &&
      (target === snapPositions[snapPositions.length - 1] || target === maxPos);

    if (!isLoopBoundary) {
      opts.xPos.value = target;
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
