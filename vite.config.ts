import { defineConfig, UserConfigExport } from "vite";
import type { UserConfig } from "vite";

export default defineConfig(({ command, mode }) => {
  const config: UserConfig = {
    build: {
      lib: {
        entry: "src/tabbed-card.ts",
        formats: ["es"],
      },
      // rollupOptions: {
      //   external: /^lit/,
      // },
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
