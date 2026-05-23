import { computed, nextTick, type Ref } from "vue";

interface UsePaginationOptions<T> {
  xPos: Ref<number>;
  swiperCalcs: Ref<{ snapPositions: number[]; maxPos: number }>;
  canLoop: Ref<boolean>;
  displaySlides: Ref<T[]>;
  isDragging: Ref<boolean>;
  stripRef: Readonly<Ref<HTMLElement | null>>;
  firstSlideStride: () => number;
  lastSlideStride: () => number;
  preCalc: () => void;
}

export function usePagination<T>(opts: UsePaginationOptions<T>) {
  const pagination = computed(() => {
    const { snapPositions } = opts.swiperCalcs.value;
    return {
      current: snapPositions.findIndex((item) => item === opts.xPos.value),
      total: snapPositions.length,
    };
  });

  const next = () => {
    const { snapPositions } = opts.swiperCalcs.value;
    const nextPos = snapPositions?.[pagination.value.current + 1];

    if (nextPos !== undefined) {
      opts.xPos.value = nextPos;
      return;
    }

    if (!opts.canLoop.value) return;

    // at the end: rotate first slide to end and rebase xPos one stride back
    // (transition off via isDragging), then on next tick animate forward
    const s = opts.firstSlideStride();
    const first = opts.displaySlides.value.shift();

    if (first === undefined) return;
    opts.displaySlides.value.push(first);

    opts.isDragging.value = true;
    opts.xPos.value -= s;
    nextTick(() => {
      opts.preCalc();
      opts.stripRef.value?.getBoundingClientRect(); // force reflow
      opts.isDragging.value = false;
      opts.xPos.value += s;
    });
  };

  const previous = () => {
    const { snapPositions } = opts.swiperCalcs.value;
    const prevPos = snapPositions?.[pagination.value.current - 1];

    if (prevPos !== undefined) {
      opts.xPos.value = prevPos;
      return;
    }

    if (!opts.canLoop.value) return;

    const s = opts.lastSlideStride();
    const last = opts.displaySlides.value.pop();
    if (last === undefined) return;
    opts.displaySlides.value.unshift(last);

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
