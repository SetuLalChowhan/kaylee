/**
 * Normalizes a file path so it always begins with "uploads/" for storage in the database,
 * stripping away local paths or "/tmp/" serverless directory prefixes.
 */
export declare function normalizeUploadPath(filePath: string): string;
/**
 * Maps a database path (starting with "uploads/") back to the actual filesystem path,
 * resolving to "/tmp/uploads/" when running in the Vercel serverless environment.
 */
export declare function getAbsoluteUploadPath(dbPath: string): string;
//# sourceMappingURL=upload.util.d.ts.map