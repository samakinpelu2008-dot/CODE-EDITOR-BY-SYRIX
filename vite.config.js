import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["assets/app-logo.svg"],
      manifest: {
        name: "CODE EDITOR BY SYRIX",
        short_name: "SYRIX Editor",
        description: "Build websites visually and export real source code.",
        theme_color: "#f8fafc",
        background_color: "#f8fafc",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/assets/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/assets/pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "/assets/pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,woff2}"],
        navigateFallback: "index.html"
      }
    })
  ],
  server: { host: "0.0.0.0" }
});