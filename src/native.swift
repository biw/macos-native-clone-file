import Darwin
import Foundation

// @swift-node:export
func cloneFile(_ source: String, _ destination: String) throws {
    let result = source.withCString { sourcePath in
        destination.withCString { destinationPath in
            clonefile(sourcePath, destinationPath, 0)
        }
    }

    guard result == 0 else {
        let errorCode = errno
        let message = String(cString: strerror(errorCode))
        throw NSError(
            domain: "macos-native-clone-file",
            code: Int(errorCode),
            userInfo: [NSLocalizedDescriptionKey: "clonefile failed: \(message)"]
        )
    }
}
