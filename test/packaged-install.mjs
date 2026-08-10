import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const rootDirectory = process.cwd();
const temporaryDirectory = mkdtempSync(join(tmpdir(), "macos-native-clone-file-packaged-"));
const packDirectory = join(temporaryDirectory, "packs");
const consumerDirectory = join(temporaryDirectory, "consumer");

mkdirSync(packDirectory);
mkdirSync(consumerDirectory);

const run = (command, arguments_, cwd) => {
  execFileSync(command, arguments_, { cwd, stdio: "inherit" });
};

const findTarball = (prefix) => {
  const tarball = readdirSync(packDirectory).find(
    (file) => file.startsWith(prefix) && file.endsWith(".tgz"),
  );
  if (!tarball) throw new Error(`Could not find a package tarball beginning with ${prefix}`);
  return join(packDirectory, tarball);
};

const runConsumer = (script) => {
  run("node", ["--input-type=module", "--eval", script], consumerDirectory);
};

try {
  run("pnpm", ["pack", "--pack-destination", packDirectory], rootDirectory);
  const packageTarball = findTarball("macos-native-clone-file-");

  writeFileSync(
    join(consumerDirectory, "package.json"),
    JSON.stringify({
      name: "macos-native-clone-file-packaged-smoke",
      private: true,
      type: "module",
    }),
  );

  run("npm", ["install", "--ignore-scripts", "--omit=dev", packageTarball], consumerDirectory);

  const target = `${process.platform}-${process.arch}`;
  const nativeAddon = join(
    consumerDirectory,
    "node_modules",
    "macos-native-clone-file",
    "dist",
    `macos_native_clone_file.${target}.node`,
  );
  if (!existsSync(nativeAddon)) {
    throw new Error(`The packaged native binary is missing at ${nativeAddon}`);
  }

  const packageDirectory = join(consumerDirectory, "node_modules", "macos-native-clone-file");
  if (existsSync(join(packageDirectory, "src"))) {
    throw new Error("The packaged source directory should not be included in releases");
  }
  if (readdirSync(join(packageDirectory, "dist")).some((file) => file.endsWith(".map"))) {
    throw new Error("The packaged distribution should not include source maps");
  }

  runConsumer(`
    import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
    import { tmpdir } from 'node:os'
    import { join } from 'node:path'
    import { cloneFile } from 'macos-native-clone-file'

    const directory = mkdtempSync(join(tmpdir(), 'macos-native-clone-file-esm-'))
    try {
      const source = join(directory, 'source.txt')
      const destination = join(directory, 'destination.txt')
      writeFileSync(source, 'packaged ESM consumer')
      cloneFile(source, destination)
      if (readFileSync(destination, 'utf8') !== 'packaged ESM consumer') {
        throw new Error('ESM consumer received incorrect clone contents')
      }
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  `);

  runConsumer(`
    import { createRequire } from 'node:module'
    import { join } from 'node:path'
    import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
    import { tmpdir } from 'node:os'

    const require = createRequire(import.meta.url)
    const { cloneFile } = require('macos-native-clone-file')
    const directory = mkdtempSync(join(tmpdir(), 'macos-native-clone-file-cjs-'))
    try {
      const source = join(directory, 'source.txt')
      const cjsDestination = join(directory, 'cjs-destination.txt')
      writeFileSync(source, 'packaged CommonJS consumer')
      cloneFile(source, cjsDestination)
      if (readFileSync(cjsDestination, 'utf8') !== 'packaged CommonJS consumer') {
        throw new Error('CommonJS consumer received incorrect clone contents')
      }
    } finally {
      rmSync(directory, { force: true, recursive: true })
    }
  `);

  console.log("Packaged ESM and CommonJS consumer checks passed.");
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
