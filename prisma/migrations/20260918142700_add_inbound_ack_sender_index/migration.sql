-- CreateIndex
CREATE INDEX "InboundEmailAck_fromAddress_repliedAt_idx" ON "InboundEmailAck"("fromAddress", "repliedAt");
