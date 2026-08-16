import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  publicDir: "FRONTEND/public",

  resolve: {
    tsconfigPaths: true,
  },

  plugins: [
    tanstackStart({
      srcDirectory: "./FRONTEND/src",
      server: {
        entry: "../../BACKEND/server",
      },
      start: {
        entry: "../../BACKEND/start",
      },
    }),

    nitro(),

    react(),
    tailwindcss(),
  ],
});
