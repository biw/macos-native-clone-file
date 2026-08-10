# macos-native-clone-file

[![CI](https://badgen.net/github/checks/biw/macos-native-clone-file)](https://github.com/biw/macos-native-clone-file/actions)
[![npm version](https://badgen.net/npm/v/macos-native-clone-file)](https://www.npmjs.com/package/macos-native-clone-file)
[![npm downloads](https://badgen.net/npm/dt/macos-native-clone-file)](https://www.npmjs.com/package/macos-native-clone-file)

A small macOS wrapper around [`clonefile(2)`](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/clonefile.2.html).

`cloneFile` creates a copy-on-write clone on a compatible macOS volume. It does not overwrite an existing destination and throws the operating-system error when cloning fails.

## Install

```bash
pnpm add macos-native-clone-file
```

## Usage

```ts
import { cloneFile } from "macos-native-clone-file";

cloneFile("/path/to/source.db", "/path/to/source.db.backup");
```

## License

MIT
