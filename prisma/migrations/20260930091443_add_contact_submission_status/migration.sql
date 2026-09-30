-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

-- AlterTable
ALTER TABLE "ContactSubmission"
  ADD COLUMN "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
  ADD COLUMN "internalNotes" TEXT;

-- CreateIndex
CREATE INDEX "ContactSubmission_status_idx" ON "ContactSubmission"("status");
