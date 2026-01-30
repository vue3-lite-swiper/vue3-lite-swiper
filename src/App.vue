<template>
  <div class="flex flex-col items-center gap-5">
    <h1 class="text-6xl">Vue3 Swiper Playground</h1>
    <Swiper
      class="h-52 w-[720px] bg-blue-500 py-10"
      ref="mySwiper"
      :slides-num="10"
      :slides-per-swipe="3"
    >
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

    <button @click="mySwiperRef?.next()">next</button>
    <button @click="mySwiperRef?.previous()">previous</button>
  </div>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watchEffect } from "vue";
import Swiper from "./components/swiper.vue";

const mySwiperRef = useTemplateRef("mySwiper");

const widths = computed(() =>
  Array.from({ length: 10 }, () => {
    return 50 + Math.random() * 350;
    // return 200
  }),
);
</script>
