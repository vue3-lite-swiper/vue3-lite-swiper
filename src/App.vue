<template>
  <div class="flex flex-col items-center gap-5">
    <h1 class="text-6xl">Vue3 Swiper Playground</h1>

    <label class="flex items-center gap-2">
      <input type="checkbox" v-model="autoPlayEnabled" />
      <span>Auto Play</span>
    </label>

    <Swiper
      class="h-52 w-180 bg-blue-500 py-10"
      ref="mySwiper"
      :auto-play="autoPlayEnabled"
      :slides="widths"
      :slides-num="10"
      :mode="'auto'"
      loop
    >
      <template #default="{ item }">
        <div
          class="flex shrink-0 justify-center rounded bg-pink-200 select-none"
          :style="{
            width: `${item.width}px`,
          }"
        >
          {{ item }}
        </div>
      </template>
    </Swiper>

    <div class="flex gap-24">
      <button @click="mySwiperRef?.previous()">Previous</button>
      <button @click="mySwiperRef?.next()">Next</button>
    </div>

    <div v-if="mySwiperRef" class="flex gap-2">
      <div
        class="aspect-square h-4 w-4 cursor-pointer rounded-full"
        v-for="index in mySwiperRef.pagination.total"
        :class="
          index - 1 === mySwiperRef.pagination.current
            ? 'bg-blue-400'
            : 'bg-gray-200'
        "
        @click="mySwiperRef?.goToIndex(index - 1)"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from "vue";
import Swiper from "./components/swiper.vue";

const autoPlayEnabled = ref(false);
const mySwiperRef = useTemplateRef("mySwiper");

const widths = computed(
  () => [
    { key: 0, width: 233 },
    { key: 1, width: 118 },
    { key: 2, width: 111 },
    { key: 3, width: 238 },
    { key: 4, width: 257 },
    { key: 5, width: 269 },
    { key: 6, width: 162 },
    { key: 7, width: 293 },
    { key: 8, width: 230 },
    { key: 9, width: 148 },
  ],
  // Array.from({ length: 10 }, (_, i) => ({
  //   key: i,
  //   width: Math.floor(Math.random() * 200 + 100),
  // })),
);
</script>
