<template>
  <div class="vls">
    <div class="flex flex-col items-center gap-5">
      <h1 class="text-6xl">Vue3 Swiper Playground</h1>

      <label class="flex items-center gap-2">
        <input type="checkbox" v-model="autoPlayEnabled" />
        <span>Auto Play</span>
      </label>

      <Swiper
        class="swiper h-52 w-180 bg-blue-500 py-10"
        ref="mySwiper"
        :auto-play="autoPlayEnabled"
        :auto-play-interval="1000"
        :slides="banner"
        :pause-on-hover="false"
        mode="fixed"
        :slide-width="720"
        :loop="true"
      >
        <template #default="{ item }">
          <div class="flex w-full justify-center p-2">
            <img :src="item.image" class="w-full object-fill" />
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
  </div>
</template>

<!-- This is when mode is auto  -->
<style scoped>
.swiper:deep(.vls-swiper) {
  width: 100%;
}
</style>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import Swiper from "./components/swiper.vue";

const autoPlayEnabled = ref(false);
const mySwiperRef = useTemplateRef("mySwiper");

const banner = [
  {
    title: "image 1",
    image:
      "https://fls-9fc5decb-6fec-45e8-944c-e52706d9c0af.laravel.cloud/uploads/zr9uJXNu93rPIGmWjuZDfv5Q5fTax8dbUnRsYkqu.webp",
  },
  {
    title: "image 2",
    image:
      "https://fls-9fc5decb-6fec-45e8-944c-e52706d9c0af.laravel.cloud/uploads/t45zM1dP2xhepz04fEuVCmF5nhz977jmYWggIUbo.webp",
  },
  {
    title: "image 3",
    image:
      "https://fls-9fc5decb-6fec-45e8-944c-e52706d9c0af.laravel.cloud/uploads/o0OOsD6GMannwMEOnXKLAPaxCLA2AIRimnQovscF.webp",
  },
  {
    title: "image 4",
    image:
      "https://fls-9fc5decb-6fec-45e8-944c-e52706d9c0af.laravel.cloud/uploads/DeePkQFUUJQW1ndfvDiGkWS9aywZlQwpVoWtzhiv.webp",
  },
  {
    title: "image 5",
    image:
      "https://fls-9fc5decb-6fec-45e8-944c-e52706d9c0af.laravel.cloud/uploads/DeePkQFUUJQW1ndfvDiGkWS9aywZlQwpVoWtzhiv.webp",
  },
  {
    title: "image 6",
    image:
      "https://fls-9fc5decb-6fec-45e8-944c-e52706d9c0af.laravel.cloud/uploads/LYzWU5uI2HghWUyCZXyyFqQ0bvfFr55ELKEeMuWJ.webp",
  },
];

// const widths = computed(
//   () => [
//     { key: 0, width: 233 },
//     { key: 1, width: 118 },
//     { key: 2, width: 111 },
//     { key: 3, width: 238 },
//     { key: 4, width: 257 },
//     { key: 5, width: 269 },
//     { key: 6, width: 162 },
//     { key: 7, width: 293 },
//     { key: 8, width: 230 },
//     { key: 9, width: 148 },
//   ],
//   // Array.from({ length: 10 }, (_, i) => ({
//   //   key: i,
//   //   width: Math.floor(Math.random() * 200 + 100),
//   // })),
// );
</script>
