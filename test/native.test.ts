import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { cloneFile, type CloneFileError } from "../dist/index.mjs";

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

  it("throws a structured system error instead of overwriting an existing destination", () => {
    const directory = makeTemporaryDirectory();
    const source = join(directory, "source.txt");
    const destination = join(directory, "destination.txt");

    writeFileSync(source, "source");
    writeFileSync(destination, "existing destination");

    try {
      cloneFile(source, destination);
      throw new Error("Expected cloneFile to throw");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);

      const cloneFileError = error as CloneFileError;
      expect(cloneFileError.code).toBe("EEXIST");
      expect(cloneFileError.errno).toBe(-17);
      expect(cloneFileError.syscall).toBe("clonefile");
      expect(cloneFileError.path).toBe(source);
      expect(cloneFileError.dest).toBe(destination);
    }

    expect(readFileSync(destination, "utf8")).toBe("existing destination");
  });

  it("rejects invalid paths before calling native code", () => {
    const directory = makeTemporaryDirectory();
    const path = join(directory, "path.txt");

    expect(() => cloneFile("", path)).toThrow("sourcePath must not be empty");
    expect(() => cloneFile(path, "")).toThrow("destinationPath must not be empty");
    expect(() => cloneFile(null as unknown as string, path)).toThrow("sourcePath must be a string");
  });
});
