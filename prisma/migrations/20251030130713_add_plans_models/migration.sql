-- CreateTable
CREATE TABLE "Plans" (
    "id" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "productName" TEXT NOT NULL,
    "variantId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isUsageBased" BOOLEAN NOT NULL DEFAULT false,
    "interval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL,
    "trialInterval" TEXT NOT NULL,
    "trialIntervalCount" INTEGER NOT NULL,
    "sort" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plans_pkey" PRIMARY KEY ("id")
);
