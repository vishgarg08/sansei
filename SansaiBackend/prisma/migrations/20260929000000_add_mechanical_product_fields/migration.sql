ALTER TABLE "Product"
ADD COLUMN "material" TEXT,
ADD COLUMN "finish" TEXT,
ADD COLUMN "threadType" TEXT,
ADD COLUMN "dimensions" TEXT,
ADD COLUMN "grade" TEXT,
ADD COLUMN "packQuantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "unitOfMeasure" TEXT DEFAULT 'piece';
