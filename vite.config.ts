import { defineConfig } from "vite";
import type { UserConfig } from "vite";
import { resolve } from "path";

export default defineConfig(({ command, mode }) => {
  const config: UserConfig = {
    build: {
      rollupOptions: {
        input: {
          "tabbed-card": resolve(__dirname, "src/tabbed-card.ts"),
        },
        output: {
          entryFileNames: "[name].js",
        },
      },
    },
  };

  if (command == "build") {
    if (mode == "development") {
      return {
        build: {
          ...config.build,
          outDir: "./temp",
          watch: {},
          minify: false,
        },
      };
    }
  }

  return { ...config };
});
