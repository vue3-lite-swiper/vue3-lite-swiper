import { onBeforeUnmount, watch, type Ref } from "vue";

interface UseAutoPlayOptions {
  enabled: () => boolean;
  canLoop: Ref<boolean>;
  current: Ref<number>;
  total: Ref<number>;
  next: () => void;
  goToIndex: (index: number) => void;
  interval?: number;
}

export function useAutoPlay(opts: UseAutoPlayOptions) {
  const interval = opts.interval ?? 500;
  let intervalId: number | undefined;

  const tick = () => {
    if (!opts.canLoop.value && opts.current.value === opts.total.value - 1) {
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
