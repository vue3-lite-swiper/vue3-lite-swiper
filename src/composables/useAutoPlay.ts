import { onBeforeUnmount, watch, type ComputedRef, type Ref } from "vue";

interface UseAutoPlayOptions {
  enabled: () => boolean;
  canLoop: Ref<boolean>;
  pagination: ComputedRef<{ current: number; total: number }>;
  next: () => void;
  goToIndex: (index: number) => void;
  interval?: number;
}

export function useAutoPlay(opts: UseAutoPlayOptions) {
  const interval = opts.interval ?? 500;
  let intervalId: number | undefined;

  const tick = () => {
    const { current, total } = opts.pagination.value;
    if (!opts.canLoop.value && current === total - 1) {
      opts.goToIndex(0);
    } else {
      opts.next();
    }
  };

  const start = () => {
    stop();
    intervalId = window.setInterval(tick, interval);
  };

  const stop = () => {
    if (intervalId !== undefined) {
      clearInterval(intervalId);
      intervalId = undefined;
    }
  };

  watch(opts.enabled, (v) => (v ? start() : stop()));

  onBeforeUnmount(stop);

  return {
    start,
    stop,
  };
}
