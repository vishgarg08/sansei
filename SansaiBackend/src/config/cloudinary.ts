import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

const hasCloudinaryConfig = Boolean(
  env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
}

export const assertCloudinaryConfigured = (): void => {
  if (!hasCloudinaryConfig) {
    throw new Error(
      "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
    );
  }
};

export default cloudinary;
