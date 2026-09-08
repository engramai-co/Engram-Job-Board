import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ command, mode }) => {
  // Public builds are always demo-only, including a direct `vite build`.
  // Intercept the private module before reading its contents or dependencies.
  const demoOnly = (command === "build" && mode !== "local-data") || process.env.VITE_DEMO_ONLY === "true";
  return {
    plugins: [{
      name: "keep-local-data-out-of-public-builds",
      enforce: "pre",
      load(id) {
        if (demoOnly && /\/src\/data\/opportunities\.local\.ts(?:\?.*)?$/.test(id.replaceAll("\\", "/"))) {
          return 'export { default } from "./demo";';
        }
      }
    }, react()],
    define: { "import.meta.env.VITE_DEMO_ONLY": JSON.stringify(demoOnly ? "true" : "false") },
    base: "./",
    server: { host: "127.0.0.1" },
    preview: { host: "127.0.0.1" }
  };
});
