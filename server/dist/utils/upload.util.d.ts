export declare const UPLOAD_ROOT: string;
/**
 * Normalizes a file path so it always begins with "uploads/" for storage in the database,
 * stripping away local paths or "/tmp/" serverless directory prefixes.
 */
export declare function normalizeUploadPath(filePath: string): string;
/**
 * Maps a database path (starting with "uploads/") back to the actual filesystem path.
 */
export declare function getAbsoluteUploadPath(dbPath: string): string;
/**
 * Safely unlinks a file only if it is strictly within UPLOAD_ROOT.
 * Prevents path traversal and arbitrary file deletion attacks.
 */
export declare function safeUnlink(dbPath: string | null | undefined): boolean;
//# sourceMappingURL=upload.util.d.ts.map