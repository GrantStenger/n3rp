import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import builtins from 'rollup-plugin-node-builtins';

const builtinsPlugin = builtins({ crypto: true });
builtinsPlugin.name = 'builtins';

export default defineConfig({
  plugins: [reactRefresh()],
  build: {
    minify: true,
    rollupOptions: {
      // @ts-ignore
      plugins: [],
    },
  },
  define: {
    'process.env': {},
  },
  resolve: {
    alias: {
      process: "process/browser",
      stream: "stream-browserify",
      zlib: "browserify-zlib",
      util: 'util'
    }
  }
});