CREATE TABLE "BulkInquiry" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "inquiryType" TEXT NOT NULL,
  "requirements" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "adminNotes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "BulkInquiry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "BulkInquiry_status_idx" ON "BulkInquiry"("status");
CREATE INDEX "BulkInquiry_createdAt_idx" ON "BulkInquiry"("createdAt");