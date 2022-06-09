import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";
import UnocssPlugin from "@unocss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    solidPlugin(),
    VitePWA({}),
    UnocssPlugin({
      // your config or in uno.config.ts
    }),
  ],
  build: {
    target: "esnext",
    polyfillDynamicImport: false,
  },
});
