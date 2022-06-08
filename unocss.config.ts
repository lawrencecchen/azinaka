import { defineConfig } from "@unocss/vite";
import { presetMini } from "@unocss/preset-mini";
import presetIcons from "@unocss/preset-icons";
import presetWind from "@unocss/preset-wind";

export default defineConfig({
  presets: [
    // presetMini(),
    presetWind(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
  ],
});
