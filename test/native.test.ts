import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { cloneFile } from "../dist/index.mjs";

const temporaryDirectories: string[] = [];

const makeTemporaryDirectory = (): string => {
  const directory = mkdtempSync(join(tmpdir(), "macos-native-clone-file-"));
  temporaryDirectories.push(directory);
  return directory;
};

afterEach(() => {
  while (temporaryDirectories.length > 0) {
    const directory = temporaryDirectories.pop();
    if (directory) rmSync(directory, { force: true, recursive: true });
  }
});

describe("cloneFile", () => {
  it("creates an independent file with the source contents", () => {
    const directory = makeTemporaryDirectory();
    const source = join(directory, "source.txt");
    const destination = join(directory, "destination.txt");
    const contents = "Swift Node-API bridge smoke test";

    writeFileSync(source, contents);

    cloneFile(source, destination);

    expect(readFileSync(destination, "utf8")).toBe(contents);
  });

  it("throws instead of overwriting an existing destination", () => {
    const directory = makeTemporaryDirectory();
    const source = join(directory, "source.txt");
    const destination = join(directory, "destination.txt");

    writeFileSync(source, "source");
    writeFileSync(destination, "existing destination");

    expect(() => cloneFile(source, destination)).toThrow("clonefile failed");
    expect(readFileSync(destination, "utf8")).toBe("existing destination");
  });
});
