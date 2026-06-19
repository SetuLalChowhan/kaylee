import multer from "multer";
import path from "path";
import fs from "fs";

const avatarDir = "uploads/avatars";
const brandLogoDir = "uploads/brand-logos";
const portfolioDir = "uploads/portfolios";

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
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed!"), false);
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

// Campaign uploads config supporting images, videos, and documents
const campaignDir = "uploads/campaigns";
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

// Re-export for backward compatibility (single avatar upload)
export const upload = uploadAvatar;