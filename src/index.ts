import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

type NativeBindings = {
  cloneFile(source: string, destination: string): void;
};

const require = createRequire(import.meta.url);
const packageDirectory = dirname(fileURLToPath(import.meta.url));
const target = `${process.platform}-${process.arch}`;
const addonPath = join(packageDirectory, `macos_native_clone_file.${target}.node`);

if (!existsSync(addonPath)) {
  throw new Error(`No .node binary found for ${target}.\nChecked:\n  ${addonPath}`);
}

const native = require(addonPath) as NativeBindings;

export const cloneFile = native.cloneFile;
