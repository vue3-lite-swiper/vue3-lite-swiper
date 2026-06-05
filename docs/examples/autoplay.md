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
import { ref } from "vue";
import { useTemplateRef } from "vue";
import { Swiper } from "vue3-lite-swiper";

const slides = Array.from({ length: 6 }, (_, i) => `Slide ${i + 1}`);
const playing = ref(true);
const swiper = useTemplateRef("swiper");
</script>

<template>
  <Swiper
    ref="swiper"
    :slides="slides"
    :slide-width="220"
    :gap="16"
    :auto-play="playing"
    loop
  >
    <template #default="{ item }">
      <div class="slide">{{ item }}</div>
    </template>
  </Swiper>

  <div class="controls">
    <button @click="swiper?.previous()">← Prev</button>
    <button @click="playing = !playing">
      {{ playing ? "⏸ Pause" : "▶ Play" }}
    </button>
    <button @click="swiper?.next()">Next →</button>
  </div>
</template>
```

## Behaviour

| Condition            | Result                                                  |
| -------------------- | ------------------------------------------------------- |
| `loop: true`         | Calls `next()` on each tick — loops indefinitely        |
| `loop: false`        | Calls `next()` until last slide, then resets to index 0 |
| `:auto-play="false"` | Stops the interval immediately                          |
| `:auto-play="true"`  | Starts advancing on the next tick                       |

::: tip Pair with loop
Autoplay is most useful combined with `loop`. Without it, the carousel resets to the first slide each time it reaches the end.
:::
