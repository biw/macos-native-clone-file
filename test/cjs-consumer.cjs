const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require("node:fs");
const { tmpdir } = require("node:os");
const { join } = require("node:path");

const { cloneFile } = require("../dist/index.cjs");
const directory = mkdtempSync(join(tmpdir(), "macos-native-clone-file-cjs-"));

try {
  const source = join(directory, "source.txt");
  const destination = join(directory, "destination.txt");
  const contents = "CommonJS consumer smoke test";

  writeFileSync(source, contents);
  cloneFile(source, destination);

  if (readFileSync(destination, "utf8") !== contents) {
    throw new Error("CommonJS consumer did not receive the cloned file contents");
  }
} finally {
  rmSync(directory, { force: true, recursive: true });
}
