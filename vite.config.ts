import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from 'fs'; // 引入 Node.js 的 fs 模組

// 讀取 package.json 的版本號
const packageJson = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, 'package.json'), 'utf-8')
);

export default defineConfig(() => {
    return {
        server: {
            port: 3000,
            host: "0.0.0.0",
        },
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "."),
            },
        },
        define: {
          'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version) || "1.0.0",
        }
    };
});
