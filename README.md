# macos-native-clone-file

A focused macOS wrapper around [`clonefile(2)`](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/clonefile.2.html), built with `swift-node`.

`cloneFile` creates a copy-on-write clone on a compatible macOS volume. It does not overwrite an existing destination and throws the operating-system error when cloning fails.

## Requirements

- macOS with an APFS source and destination volume
- An Intel or Apple Silicon Mac (the only published binary targets)
- Node.js 24.11 or newer for builds
- Xcode or Command Line Tools (`swiftc` and `clang++` on `PATH`)

## Install and build

```bash
pnpm install
pnpm build
```

`swift-node` reads `src/native.swift`, generates the Node-API bridge and target-qualified native binary in `dist_swift-node/`. `tsdown` then bundles the public TypeScript API into ESM and CommonJS entrypoints, with declarations and the native assets in `dist/`.

## Install from npm

```bash
pnpm add macos-native-clone-file
npm add macos-native-clone-file
yarn add macos-native-clone-file
```

Configure npm trusted publishing for the `biw/macos-native-clone-file` repository and the `publish.yml` workflow before publishing. Every push to `main` independently runs CI and the publish workflow; the latter reuses CI, skips an existing version, and publishes a successful new version.

The generated runtime loads the native asset directly; it has no runtime dependency on `swift-node`.

## Packaged-consumer smoke test

`pnpm test:packaged` packs this package, installs it into a fresh production-only consumer, and exercises its ESM and CommonJS entrypoints.

## Usage

```ts
import { cloneFile } from "macos-native-clone-file";

cloneFile("/path/to/source.db", "/path/to/source.db.backup");
```

The generated entrypoints also support CommonJS consumers:

```js
const { cloneFile } = require("macos-native-clone-file");

cloneFile("/path/to/source.db", "/path/to/source.db.backup");
```

## Verify

```bash
pnpm test
pnpm typecheck
```

The test suite checks tsdown's ESM and CommonJS entrypoints, successful file cloning, and the no-overwrite error path.

## Project layout

```text
src/native.swift  Swift implementation annotated for export
src/index.ts      TypeScript package API
dist_swift-node/  Generated Node-API bridge, runtime, and native binary
dist/             Bundled ESM/CJS API, declarations, and native assets
```
