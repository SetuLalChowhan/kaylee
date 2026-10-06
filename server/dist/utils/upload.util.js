import path from "path";
import fs from "fs";
export const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads");
/**
 * Normalizes a file path so it always begins with "uploads/" for storage in the database,
 * stripping away local paths or "/tmp/" serverless directory prefixes.
 */
export function normalizeUploadPath(filePath) {
    const normalized = filePath.replace(/\\/g, "/");
    const index = normalized.indexOf("uploads/");
    if (index !== -1) {
        return normalized.substring(index);
    }
    return normalized;
}
/**
 * Maps a database path (starting with "uploads/") back to the actual filesystem path.
 */
export function getAbsoluteUploadPath(dbPath) {
    return path.resolve(process.cwd(), dbPath);
}
/**
 * Safely unlinks a file only if it is strictly within UPLOAD_ROOT.
 * Prevents path traversal and arbitrary file deletion attacks.
 */
export function safeUnlink(dbPath) {
    if (!dbPath || typeof dbPath !== "string")
        return false;
    try {
        const resolvedPath = path.resolve(process.cwd(), dbPath);
        if (!resolvedPath.startsWith(UPLOAD_ROOT + path.sep)) {
            return false;
        }
        if (fs.existsSync(resolvedPath)) {
            fs.unlinkSync(resolvedPath);
            return true;
        }
    }
    catch {
        // Silent fail
    }
    return false;
}
//# sourceMappingURL=upload.util.js.map