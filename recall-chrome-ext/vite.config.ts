import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { crx } from "@crxjs/vite-plugin"
import manifest from "./manifest.json"
import path from "path"

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest: manifest as any }),
  ],
  server: {
    cors: {
      origin: [/chrome-extension:\/\//],
      credentials: true,
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  define: {
    "process.env.VITE_SUPABASE_URL": JSON.stringify(process.env.VITE_SUPABASE_URL),
    "process.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(process.env.VITE_SUPABASE_ANON_KEY),
    "process.env.VITE_APP_URL": JSON.stringify(process.env.VITE_APP_URL || "https://ytrecall.online"),
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "src/popup/index.html"),
      },
    },
  },
})
