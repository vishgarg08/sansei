CREATE TABLE "ProductVideo" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "publicId" TEXT,
    "title" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductVideo_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductVideo_productId_displayOrder_idx"
ON "ProductVideo"("productId", "displayOrder");

CREATE INDEX "ProductVideo_publicId_idx" ON "ProductVideo"("publicId");

ALTER TABLE "ProductVideo"
ADD CONSTRAINT "ProductVideo_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "Product"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
