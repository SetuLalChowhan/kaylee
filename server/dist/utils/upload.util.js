import path from "path";
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
 * Maps a database path (starting with "uploads/") back to the actual filesystem path,
 * resolving to "/tmp/uploads/" when running in the Vercel serverless environment.
 */
export function getAbsoluteUploadPath(dbPath) {
    const isVercel = !!process.env.VERCEL;
    if (isVercel) {
        if (dbPath.startsWith("uploads/")) {
            return "/tmp/" + dbPath;
        }
    }
    return dbPath;
}
//# sourceMappingURL=upload.util.js.map