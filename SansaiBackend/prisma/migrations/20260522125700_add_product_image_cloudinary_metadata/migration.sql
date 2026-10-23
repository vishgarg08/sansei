ALTER TABLE "ProductImage"
ADD COLUMN     "publicId" TEXT,
ADD COLUMN     "blurHash" TEXT;

CREATE INDEX "ProductImage_productId_displayOrder_idx" ON "ProductImage"("productId", "displayOrder");
CREATE INDEX "ProductImage_publicId_idx" ON "ProductImage"("publicId");
