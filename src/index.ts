import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { getSystemErrorMessage, getSystemErrorName } from "node:util";

type NativeBindings = {
  cloneFile(source: string, destination: string): number;
};

export type CloneFileError = Error & {
  code: string;
  dest: string;
  errno: number;
  path: string;
  syscall: "clonefile";
};

const require = createRequire(import.meta.url);
const packageDirectory = dirname(fileURLToPath(import.meta.url));
const target = `${process.platform}-${process.arch}`;
const addonPath = join(packageDirectory, `macos_native_clone_file.${target}.node`);

if (!existsSync(addonPath)) {
  throw new Error(`No .node binary found for ${target}.\nChecked:\n  ${addonPath}`);
}

const native = require(addonPath) as NativeBindings;

function assertPath(value: unknown, fieldName: string): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError(`${fieldName} must be a string`);
  }
  if (value.length === 0) {
    throw new TypeError(`${fieldName} must not be empty`);
  }
}

const createCloneFileError = (
  errorNumber: number,
  sourcePath: string,
  destinationPath: string,
): CloneFileError => {
  const errno = -errorNumber;
  const code = getSystemErrorName(errno);
  const message = getSystemErrorMessage(errno);
  const error = new Error(
    `${code}: ${message}, clonefile '${sourcePath}' -> '${destinationPath}'`,
  ) as CloneFileError;

  error.code = code;
  error.dest = destinationPath;
  error.errno = errno;
  error.path = sourcePath;
  error.syscall = "clonefile";

  return error;
};

export const cloneFile = (sourcePath: string, destinationPath: string): void => {
  assertPath(sourcePath, "sourcePath");
  assertPath(destinationPath, "destinationPath");

  const errorNumber = native.cloneFile(sourcePath, destinationPath);
  if (errorNumber !== 0) {
    throw createCloneFileError(errorNumber, sourcePath, destinationPath);
  }
};
