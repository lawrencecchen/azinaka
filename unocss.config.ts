import presetIcons from "@unocss/preset-icons";
import presetTypography from "@unocss/preset-typography";
import presetWind from "@unocss/preset-wind";
import { defineConfig } from "@unocss/vite";

export default defineConfig({
  presets: [
    presetWind(),
    presetIcons({
      extraProperties: {
        display: "inline-block",
        "vertical-align": "middle",
      },
    }),
    presetTypography({
      cssExtend: {
        h1: {
          margin: "1rem 0", // h1 is always at the top of the page, so only margin 1 * root font size
          "font-size": "1.5rem",
          "font-weight": "bold",
        },
      },
    }),
  ],
});
