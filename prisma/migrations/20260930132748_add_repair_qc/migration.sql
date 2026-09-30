-- AlterTable
ALTER TABLE "Repair"
  ADD COLUMN "qcPassedAt" TIMESTAMP(3),
  ADD COLUMN "qcPassedById" TEXT,
  ADD COLUMN "qcNotes" TEXT;

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_qcPassedById_fkey" FOREIGN KEY ("qcPassedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
