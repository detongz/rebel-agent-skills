import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  clean: true,
  sourcemap: true,
  external: ["openclaw", "@openclaw/sdk"],
  target: "es2022",
  minify: true,
  shims: false,
});
