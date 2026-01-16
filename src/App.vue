<template>
  <div class="flex flex-col items-center gap-5">
    <h1 class="text-6xl">Vue3 Swiper Playground</h1>
    <Swiper class="h-52 w-[720px] bg-blue-500 py-10" :slides-num="12">
      <template #default="{ index }">
        <div
          class="flex shrink-0 justify-center rounded bg-pink-200 select-none"
          ref="slides"
          :style="{
            width: `${widths[index - 1]}px`,
          }"
        >
          {{ index }}
        </div>
      </template>
    </Swiper>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import Swiper from "./components/swiper.vue";

const widths = computed(() =>
  Array.from({ length: 12 }, () => {
    // return Math.random() * 200
    return 200;
  }),
);

watchEffect(() => console.log(widths.value));
</script>
