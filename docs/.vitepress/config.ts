import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Vue3 Lite Swiper",
  description:
    "A lightweight, zero-dependency Vue 3 swiper for responsive carousels and image galleries.",
  head: [["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }]],

  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "~": path.resolve(__dirname, "../../src"),
      },
    },
  },

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "Vue3 Lite Swiper",

    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "Examples", link: "/examples/fixed" },
    ],

    sidebar: [
      {
        text: "Quick Start",
        items: [
          { text: "Introduction", link: "/guide/introduction" },
          { text: "Installation", link: "/guide/installation" },
        ],
      },
      {
        text: "Features",
        items: [
          { text: "Props", link: "/guide/props" },
          { text: "Component Ref", link: "/guide/methods" },
        ],
      },
      {
        text: "Examples",
        items: [
          { text: "Fixed Mode", link: "/examples/fixed" },
          { text: "Auto Mode", link: "/examples/auto" },
          { text: "Infinite Loop", link: "/examples/loop" },
          { text: "Auto Play", link: "/examples/autoplay" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/vue3-lite-swiper/vue3-lite-swiper",
      },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © Vue3 Lite Swiper contributors",
    },

    search: {
      provider: "local",
    },
  },
});
