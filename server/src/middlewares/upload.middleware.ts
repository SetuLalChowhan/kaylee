import multer from "multer";
import path from "path";
import fs from "fs";
import { AppError } from "../utils/AppError.js";

const isVercel = !!process.env.VERCEL;
const baseUploadDir = isVercel ? "/tmp/uploads" : "uploads";

const avatarDir = path.join(baseUploadDir, "avatars");
const brandLogoDir = path.join(baseUploadDir, "brand-logos");
const portfolioDir = path.join(baseUploadDir, "portfolios");

// Ensure upload directories exist
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}
if (!fs.existsSync(brandLogoDir)) {
  fs.mkdirSync(brandLogoDir, { recursive: true });
}
if (!fs.existsSync(portfolioDir)) {
  fs.mkdirSync(portfolioDir, { recursive: true });
}

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "brandLogos") {
      cb(null, brandLogoDir);
    } else if (file.fieldname === "file") {
      cb(null, portfolioDir);
    } else {
      cb(null, avatarDir);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const brandLogoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, brandLogoDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req: any, file: any, cb: any) => {
  if (file.fieldname === "file") {
    // Portfolios can accept both images and videos
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new AppError("Only images and videos are allowed for portfolio!", 400), false);
    }
  } else {
    // Avatars and brand logos must be images only
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new AppError("Only images are allowed!", 400), false);
    }
  }
};

const limits = { fileSize: 2 * 1024 * 1024 };

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter,
  limits,
});

export const uploadBrandLogo = multer({
  storage: brandLogoStorage,
  fileFilter,
  limits,
});

export const uploadPortfolio = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit for portfolio items (videos/images)
});

// Campaign uploads config supporting images, videos, and documents
const campaignDir = path.join(baseUploadDir, "campaigns");
if (!fs.existsSync(campaignDir)) {
  fs.mkdirSync(campaignDir, { recursive: true });
}

const campaignStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, campaignDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadCampaignFile = multer({
  storage: campaignStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
});

// CMS uploads config supporting images
const cmsDir = path.join(baseUploadDir, "cms");
if (!fs.existsSync(cmsDir)) {
  fs.mkdirSync(cmsDir, { recursive: true });
}

const cmsStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, cmsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

export const uploadCmsFile = multer({
  storage: cmsStorage,
  fileFilter: (req: any, file: any, cb: any) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new AppError("Only images are allowed!", 400), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

// Re-export for backward compatibility (single avatar upload)
export const upload = uploadAvatar;