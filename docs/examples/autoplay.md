# Auto Play

Set `:auto-play="true"` to advance slides automatically. Toggle it reactively to pause and resume at any time.

<script setup>
import AutoplayDemo from '../components/AutoplayDemo.vue'
</script>

<ClientOnly>
  <AutoplayDemo />
</ClientOnly>

## Usage

```vue
<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const swiper = useTemplateRef("swiper");
const playing = ref(true);

const slides = [
  { label: "Slide 1", color: "#60a5fa" },
  { label: "Slide 2", color: "#34d399" },
  { label: "Slide 3", color: "#a78bfa" },
  { label: "Slide 4", color: "#f87171" },
  { label: "Slide 5", color: "#fbbf24" },
  { label: "Slide 6", color: "#2dd4bf" },
];
</script>

<template>
  <div class="demo">
    <Swiper
      ref="swiper"
      mode="fixed"
      loop
      :slides="slides"
      :slide-width="220"
      :gap="16"
      :auto-play="playing"
    >
      <template #default="{ item }">
        <div class="slide" :style="{ background: item.color }">
          <span>{{ item.label }}</span>
        </div>
      </template>
    </Swiper>

    <div class="controls">
      <button class="btn" @click="swiper?.previous()">← Prev</button>

      <div class="center">
        <button class="play-btn" @click="playing = !playing">
          {{ playing ? "⏸ Pause" : "▶ Play" }}
        </button>
        <div class="dots">
          <button
            v-for="(_, i) in swiper?.total"
            class="dot"
            :key="i"
            :class="{ active: swiper?.current === i }"
            @click="swiper?.goToIndex(i)"
          />
        </div>
      </div>

      <button class="btn" @click="swiper?.next()">Next →</button>
    </div>
  </div>
</template>

<style scoped>
.demo {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 24px;
  background: var(--vp-c-bg-soft);
}

.slide {
  width: 220px;
  height: 140px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  user-select: none;
}

.controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  gap: 12px;
}

.center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.btn {
  padding: 6px 16px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn:hover {
  background: var(--vp-c-brand-soft);
}

.play-btn {
  padding: 6px 20px;
  border-radius: 20px;
  border: none;
  background: var(--vp-c-brand-1);
  color: #fff;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: opacity 0.15s;
}

.play-btn:hover {
  opacity: 0.85;
}

.dots {
  display: flex;
  gap: 8px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: var(--vp-c-divider);
  cursor: pointer;
  padding: 0;
  transition: background 0.2s;
}

.dot.active {
  background: var(--vp-c-brand-1);
}
</style>
```

## Behaviour

| Condition            | Result                                                      |
| -------------------- | ----------------------------------------------------------- |
| `loop` is active     | Calls `next()` on each tick and wraps continuously          |
| `loop` is inactive   | Calls `next()` until the last slide, then resets to index 0 |
| `:auto-play="false"` | Stops the interval immediately                              |
| `:auto-play="true"`  | Starts advancing after the configured interval              |

## Configuration

`auto-play-interval` sets the delay between advances in milliseconds (default: `3000`). Autoplay pauses while the pointer is over the swiper by default; set `:pause-on-hover="false"` to keep it running.

```vue
<Swiper
  :slides="slides"
  :auto-play="true"
  :auto-play-interval="5000"
  :pause-on-hover="false"
/>
```

::: tip Pair with loop
Autoplay is most useful when looping is active. Looping requires at least as many slides as fit in the viewport; otherwise autoplay resets to the first slide at the end.
:::
