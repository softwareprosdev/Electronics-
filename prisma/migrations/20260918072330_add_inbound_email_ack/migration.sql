-- CreateTable
CREATE TABLE "InboundEmailAck" (
    "id" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "mailboxId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "subject" TEXT,
    "repliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InboundEmailAck_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InboundEmailAck_threadId_key" ON "InboundEmailAck"("threadId");

-- CreateIndex
CREATE INDEX "InboundEmailAck_mailboxId_idx" ON "InboundEmailAck"("mailboxId");
