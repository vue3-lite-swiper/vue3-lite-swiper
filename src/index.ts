import type { App } from "vue";
import Swiper from "./components/swiper.vue";
import "./assets/css/main.css";

export { Swiper };

export default {
  install: (app: App) => {
    app.component("Swiper", Swiper);
  },
};
