import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	base: "./",
	plugins: [react()],
	resolve: {
		alias: [
			{
				// Replace the default rehype-prism-plus (all 594 languages)
				// with a shim that only registers JSON (~900 kB saved).
				find: /^rehype-prism-plus$/,
				replacement: fileURLToPath(new URL("./src/rehype-prism-json.ts", import.meta.url)),
			},
		],
	},
});
