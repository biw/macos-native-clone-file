import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  copy: [{ from: "dist_swift-node/**/*.node", flatten: true }],
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outDir: "dist",
  platform: "node",
  sourcemap: true,
  target: "node24",
});
