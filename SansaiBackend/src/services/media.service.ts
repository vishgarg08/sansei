import { UploadApiResponse } from "cloudinary";
import { Readable } from "node:stream";
import cloudinary, { assertCloudinaryConfigured } from "../config/cloudinary";
import { logger } from "../config/logger";
import { AppError } from "../utils/appError";

const PRODUCT_IMAGE_FOLDER = "trusttees/mechanical-products";
const PRODUCT_VIDEO_FOLDER = "trusttees/mechanical-product-videos";

const uploadBuffer = (
  buffer: Buffer,
  originalname: string
): Promise<UploadApiResponse> =>
  new Promise((resolve, reject) => {
    assertCloudinaryConfigured();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: PRODUCT_IMAGE_FOLDER,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        filename_override: originalname.replace(/\.[^/.]+$/, ""),
        transformation: [
          {
            width: 1200,
            height: 1200,
            crop: "limit",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }

        resolve(result);
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });

export const uploadProductImages = async (
  files: Express.Multer.File[]
): Promise<
  Array<{
    imageUrl: string;
    publicId: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
    originalName: string;
  }>
> => {
  if (files.length === 0) {
    throw new AppError("At least one product image is required", 400);
  }

  try {
    const uploads = await Promise.all(
      files.map(async (file) => {
        const result = await uploadBuffer(file.buffer, file.originalname);

        return {
          imageUrl: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
          originalName: file.originalname,
        };
      })
    );

    return uploads;
  } catch (error) {
    logger.error({ err: error }, "product image upload failed");
    throw new AppError("Product image upload failed", 500);
  }
};

export const uploadProductVideos = async (files: Express.Multer.File[]) => {
  if (files.length === 0) {
    throw new AppError("At least one product video is required", 400);
  }

  try {
    return await Promise.all(
      files.map(
        (file) =>
          new Promise<{
            videoUrl: string;
            publicId: string;
            format: string;
            bytes: number;
            duration: number | null;
            originalName: string;
          }>((resolve, reject) => {
            assertCloudinaryConfigured();
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: PRODUCT_VIDEO_FOLDER,
                resource_type: "video",
                use_filename: true,
                unique_filename: true,
                overwrite: false,
                filename_override: file.originalname.replace(/\.[^/.]+$/, ""),
              },
              (error, result) => {
                if (error || !result) {
                  reject(error ?? new Error("Cloudinary video upload failed"));
                  return;
                }
                resolve({
                  videoUrl: result.secure_url,
                  publicId: result.public_id,
                  format: result.format,
                  bytes: result.bytes,
                  duration: typeof result.duration === "number" ? result.duration : null,
                  originalName: file.originalname,
                });
              }
            );
            Readable.from(file.buffer).pipe(uploadStream);
          })
      )
    );
  } catch (error) {
    logger.error({ err: error }, "product video upload failed");
    throw new AppError("Product video upload failed", 500);
  }
};

export const deleteCloudinaryAssets = async (publicIds: string[]): Promise<void> => {
  const uniquePublicIds = [...new Set(publicIds.map((value) => value.trim()).filter(Boolean))];

  if (uniquePublicIds.length === 0) {
    return;
  }

  try {
    assertCloudinaryConfigured();
    await Promise.all(
      uniquePublicIds.map((publicId) =>
        cloudinary.uploader.destroy(publicId, { resource_type: "image" })
      )
    );
  } catch (error) {
    logger.warn(
      {
        err: error,
        publicIds: uniquePublicIds,
      },
      "cloudinary asset cleanup failed"
    );
  }
};
