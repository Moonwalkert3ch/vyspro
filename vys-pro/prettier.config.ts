// prettier.config.ts, .prettierrc.ts, prettier.config.mts, or .prettierrc.mts

import { type Config } from "prettier";

const config: Config = {
  trailingComma: "none",
  "plugins": ["prettier-plugin-tailwindcss"]
    // "plugins": ["prettier-plugin-tailwindcss", "prettier-plugin-organize-imports"],
};

export default config;