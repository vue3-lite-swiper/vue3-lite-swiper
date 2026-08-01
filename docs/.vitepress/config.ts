import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig } from "vitepress";

const npmIcon = `<svg role="img" xmlns="http://www.w3.org/2000/svg" width="540" height="210" viewBox="0 0 18 7" style="width: 24px"><path fill="#CB3837" d="M0 0h18v6H9v1H5V6H0V0zm1 5h2V2h1v3h1V1H1v4zm5-4v5h2V5h2V1H6zm2 1h1v2H8V2zm3-1v4h2V2h1v3h1V2h1v3h1V1h-6z"/><path fill="#FFF" d="M1 5h2V2h1v3h1V1H1zM6 1v5h2V5h2V1H6zm3 3H8V2h1v2zM11 1v4h2V2h1v3h1V2h1v3h1V1z"/></svg>`;

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
          { text: "Image Gallery", link: "/examples/images" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/vue3-lite-swiper/vue3-lite-swiper",
      },
      {
        icon: { svg: npmIcon },
        link: "https://www.npmjs.com/package/vue3-lite-swiper",
        ariaLabel: "npm",
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
