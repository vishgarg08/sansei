import multer from "multer";
import { AppError } from "../utils/appError";

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

export const productImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 8,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/") || !allowedMimeTypes.has(file.mimetype)) {
      callback(
        new AppError("Only JPG, JPEG, PNG, and WEBP product images are allowed", 400)
      );
      return;
    }

    callback(null, true);
  },
});

const allowedVideoMimeTypes = new Set([
  "video/mp4",
  "video/webm",
  "video/quicktime",
]);

export const productVideoUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
    files: 5,
  },
  fileFilter: (_req, file, callback) => {
    if (!allowedVideoMimeTypes.has(file.mimetype)) {
      callback(new AppError("Only MP4, WEBM, and MOV product videos are allowed", 400));
      return;
    }
    callback(null, true);
  },
});
