import { defineConfig } from "tsdown";
import swiftNodeNativeAssets from "swift-node-unplugin/rolldown";

export default defineConfig({
  clean: true,
  dts: true,
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  outDir: "dist",
  platform: "node",
  plugins: [swiftNodeNativeAssets({ build: false })],
  sourcemap: true,
  target: "node24",
});
