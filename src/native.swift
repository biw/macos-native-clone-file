import Darwin

// @swift-node:export
func cloneFile(_ source: String, _ destination: String) -> Int32 {
    let result = source.withCString { sourcePath in
        destination.withCString { destinationPath in
            clonefile(sourcePath, destinationPath, 0)
        }
    }

    guard result != 0 else { return 0 }

    return errno
}
