import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { readdirSync, statSync } from "node:fs";
import path from "node:path";

const entries = readdirSync("forms", "utf8").reduce((record, c) => {
    const s = statSync(path.join("forms", c));
    if (!s.isDirectory()) return record;

    const filepath = path.join("forms", c, "index.html");
    record[c] = filepath;

    return record;
}, {});

export default defineConfig({
    appType: "mpa",
    plugins: [
        tailwindcss({ optimize: { minify: true } }),
        viteSingleFile({
            useRecommendedBuildConfig: true,
            deleteInlinedFiles: true,
        }),
    ],
    build: {
        rollupOptions: {
            input: entries,
        },
        watch: {
            exclude: [/scripts/g, /dist/g],
        },
    },
});
