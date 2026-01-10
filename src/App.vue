<template>
  <div class="flex flex-col items-center gap-5">
    <h1 class="text-6xl">Vue3 Swiper Playground</h1>
    <Swiper :slides-num="12">
      <template #default="{ index }">
        <div
          class="block shrink-0 rounded bg-pink-200 select-none"
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
  Array.from({ length: 12 }, () => Math.random() * 200),
);

watchEffect(() => console.log(widths.value));
</script>
