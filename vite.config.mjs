import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { photographyAssetsPlugin } from "./plugins/photography-assets-plugin.mjs";

export default defineConfig({
  base: process.env.VITE_BASE_PATH ?? "/",
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [photographyAssetsPlugin(), react()],
});
