-- CreateTable
CREATE TABLE "AssistantWebhookEvents" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "userId" TEXT,
    "body" JSONB NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processingError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssistantWebhookEvents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AssistantWebhookEvents_source_processed_idx" ON "AssistantWebhookEvents"("source", "processed");
