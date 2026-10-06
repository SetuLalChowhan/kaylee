import multer from "multer";
import path from "path";
import fs from "fs";
import { fileTypeFromFile } from "file-type";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { safeUnlink } from "../utils/upload.util.js";

const baseUploadDir = "uploads";

const avatarDir = path.join(baseUploadDir, "avatars");
const brandLogoDir = path.join(baseUploadDir, "brand-logos");
const portfolioDir = path.join(baseUploadDir, "portfolios");
const campaignDir = path.join(baseUploadDir, "campaigns");
const cmsDir = path.join(baseUploadDir, "cms");

// Ensure upload directories exist
[avatarDir, brandLogoDir, portfolioDir, campaignDir, cmsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const ALLOWED_IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const ALLOWED_VIDEO_EXTS = new Set([".mp4", ".mov", ".webm", ".mpeg"]);
const ALLOWED_DOC_EXTS = new Set([".pdf", ".doc", ".docx", ".txt"]);

const ALLOWED_IMAGE_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const ALLOWED_VIDEO_MIMES = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/mpeg",
]);

const ALLOWED_DOC_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

function getSafeFileExtension(originalname: string, mimetype: string): string {
  const ext = path.extname(originalname).toLowerCase();
  if (ext === ".svg" || mimetype.includes("svg")) {
    return ".bin";
  }
  if (ALLOWED_IMAGE_EXTS.has(ext) || ALLOWED_VIDEO_EXTS.has(ext) || ALLOWED_DOC_EXTS.has(ext)) {
    return ext === ".jpeg" ? ".jpg" : ext;
  }
  if (mimetype === "image/jpeg") return ".jpg";
  if (mimetype === "image/png") return ".png";
  if (mimetype === "image/webp") return ".webp";
  if (mimetype === "image/gif") return ".gif";
  if (mimetype === "image/avif") return ".avif";
  if (mimetype === "video/mp4") return ".mp4";
  if (mimetype === "video/quicktime") return ".mov";
  if (mimetype === "video/webm") return ".webm";
  if (mimetype === "application/pdf") return ".pdf";
  if (mimetype === "text/plain") return ".txt";
  return ".bin";
}

// ── Storages ─────────────────────────────────────────────────────────────────
const createDiskStorage = (destinationDir: string) => {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, destinationDir);
    },
    filename: (_req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const safeExt = getSafeFileExtension(file.originalname, file.mimetype);
      cb(null, uniqueSuffix + safeExt);
    },
  });
};

const avatarStorage = multer.diskStorage({
  destination: (_req, file, cb) => {
    if (file.fieldname === "brandLogos") {
      cb(null, brandLogoDir);
    } else if (file.fieldname === "file") {
      cb(null, portfolioDir);
    } else {
      cb(null, avatarDir);
    }
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const safeExt = getSafeFileExtension(file.originalname, file.mimetype);
    cb(null, uniqueSuffix + safeExt);
  },
});

// ── File Filters ─────────────────────────────────────────────────────────────
const imageOnlyFilter = (_req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".svg" || file.mimetype.includes("svg")) {
    return cb(new AppError("SVG files are strictly prohibited.", 400), false);
  }
  if (ALLOWED_IMAGE_MIMES.has(file.mimetype) && ALLOWED_IMAGE_EXTS.has(ext)) {
    cb(null, true);
  } else {
    cb(new AppError("Only JPG, PNG, WEBP, GIF, and AVIF images are allowed.", 400), false);
  }
};

const portfolioFileFilter = (_req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".svg" || file.mimetype.includes("svg")) {
    return cb(new AppError("SVG files are strictly prohibited.", 400), false);
  }
  const isImage = ALLOWED_IMAGE_MIMES.has(file.mimetype) && ALLOWED_IMAGE_EXTS.has(ext);
  const isVideo = ALLOWED_VIDEO_MIMES.has(file.mimetype) && ALLOWED_VIDEO_EXTS.has(ext);

  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new AppError("Only valid image and video files (MP4, MOV, WEBM) are allowed for portfolio.", 400), false);
  }
};

const campaignFileFilter = (_req: any, file: any, cb: any) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === ".svg" || file.mimetype.includes("svg")) {
    return cb(new AppError("SVG files are strictly prohibited.", 400), false);
  }
  const isImage = ALLOWED_IMAGE_MIMES.has(file.mimetype) && ALLOWED_IMAGE_EXTS.has(ext);
  const isVideo = ALLOWED_VIDEO_MIMES.has(file.mimetype) && ALLOWED_VIDEO_EXTS.has(ext);
  const isDoc = ALLOWED_DOC_MIMES.has(file.mimetype) && ALLOWED_DOC_EXTS.has(ext);

  if (isImage || isVideo || isDoc) {
    cb(null, true);
  } else {
    cb(new AppError("File type not supported for campaign uploads.", 400), false);
  }
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const uploadBrandLogo = multer({
  storage: createDiskStorage(brandLogoDir),
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

export const uploadPortfolio = multer({
  storage: createDiskStorage(portfolioDir),
  fileFilter: portfolioFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

export const uploadCampaignFile = multer({
  storage: createDiskStorage(campaignDir),
  fileFilter: campaignFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
});

export const uploadCmsFile = multer({
  storage: createDiskStorage(cmsDir),
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

export const upload = uploadAvatar;

/**
 * Post-upload magic bytes and MIME verification middleware.
 * Verifies that the uploaded files match allowed binary signatures.
 * Rejects and safely deletes unknown, mismatched, or SVG files.
 */
export const validateUploadedFiles = (category: "image" | "portfolio" | "campaign" | "cms") => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const files: Express.Multer.File[] = [];
    if (req.file) files.push(req.file);
    if (req.files) {
      if (Array.isArray(req.files)) {
        files.push(...req.files);
      } else {
        for (const key of Object.keys(req.files)) {
          const list = (req.files as Record<string, Express.Multer.File[]>)[key];
          if (Array.isArray(list)) files.push(...list);
        }
      }
    }

    for (const file of files) {
      const filePath = file.path;
      try {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext === ".svg" || file.mimetype.includes("svg")) {
          safeUnlink(filePath);
          return next(new AppError("SVG files are not permitted.", 400));
        }

        // Special handling for .txt files
        if (ext === ".txt" || file.mimetype === "text/plain") {
          if (category !== "campaign") {
            safeUnlink(filePath);
            return next(new AppError("Text files are not allowed for this upload.", 400));
          }
          // Verify first 8 KB is valid UTF-8 with no NUL bytes
          const buffer = Buffer.alloc(8192);
          const fd = fs.openSync(filePath, "r");
          const bytesRead = fs.readSync(fd, buffer, 0, 8192, 0);
          fs.closeSync(fd);
          const slice = buffer.subarray(0, bytesRead);
          if (slice.includes(0x00)) {
            safeUnlink(filePath);
            return next(new AppError("Invalid text file content.", 400));
          }
          const text = slice.toString("utf8");
          if (Buffer.from(text, "utf8").compare(slice) !== 0) {
            safeUnlink(filePath);
            return next(new AppError("Text file is not valid UTF-8.", 400));
          }
          continue;
        }

        // Check magic bytes using file-type
        const fileTypeResult = await fileTypeFromFile(filePath);
        if (!fileTypeResult) {
          safeUnlink(filePath);
          return next(new AppError("Unable to verify file format. Unsupported or corrupted file.", 400));
        }

        const { mime: detectedMime, ext: detectedExt } = fileTypeResult;

        if (detectedMime.includes("svg") || (detectedExt as string) === "svg") {
          safeUnlink(filePath);
          return next(new AppError("SVG files are not permitted.", 400));
        }

        const allowedDetectedImageMimes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/avif"];
        const allowedDetectedVideoMimes = ["video/mp4", "video/quicktime", "video/webm", "video/mpeg"];
        const allowedDetectedDocMimes = [
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/zip", // docx is often detected as zip
          "application/x-cfb" // old doc compound binary format
        ];

        if (category === "image" || category === "cms") {
          if (!allowedDetectedImageMimes.includes(detectedMime)) {
            safeUnlink(filePath);
            return next(new AppError("Uploaded file is not a valid image.", 400));
          }
        } else if (category === "portfolio") {
          if (!allowedDetectedImageMimes.includes(detectedMime) && !allowedDetectedVideoMimes.includes(detectedMime)) {
            safeUnlink(filePath);
            return next(new AppError("Uploaded file is not a valid image or video.", 400));
          }
        } else if (category === "campaign") {
          if (
            !allowedDetectedImageMimes.includes(detectedMime) &&
            !allowedDetectedVideoMimes.includes(detectedMime) &&
            !allowedDetectedDocMimes.includes(detectedMime)
          ) {
            safeUnlink(filePath);
            return next(new AppError("Uploaded file format is not supported for campaign.", 400));
          }
        }
      } catch (err: any) {
        safeUnlink(filePath);
        return next(new AppError("Failed to validate uploaded file signature.", 400));
      }
    }

    next();
  };
};