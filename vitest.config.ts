import { defineConfig } from "vitest/config";
import { fileURLToPath,URL } from "node:url";
export default defineConfig({resolve:{alias:{"@":fileURLToPath(new URL("./",import.meta.url))}},test:{environment:"jsdom",setupFiles:["./tests/setup.ts"],exclude:["tests/e2e/**","node_modules/**"],coverage:{reporter:["text","html"]}}});
