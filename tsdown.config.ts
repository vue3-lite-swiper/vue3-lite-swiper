import { defineConfig } from "tsdown";
import Vue from "unplugin-vue/rolldown";
import { fileURLToPath } from "url";

export default defineConfig({
  entry: ["./src/index.ts"],
  platform: "neutral",
  plugins: [Vue({ isProduction: true })],
  format: ["esm"],
  deps: { neverBundle: ["vue"] },
  dts: { vue: true, tsconfig: "./tsconfig.app.json" },
  inputOptions: {
    resolve: {
      alias: {
        "~": fileURLToPath(new URL("./src", import.meta.url)),
      },
      mainFields: ["module", "main"],
    },
  },
});
