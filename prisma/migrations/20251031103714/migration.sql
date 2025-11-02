-- CreateTable
CREATE TABLE "ConversationState" (
    "userId" TEXT NOT NULL,
    "flow" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConversationState_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "ConversationState" ADD CONSTRAINT "ConversationState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
