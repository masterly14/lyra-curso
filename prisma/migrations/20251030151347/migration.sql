/*
  Warnings:

  - A unique constraint covering the columns `[lemonsqueezyId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Subscription_lemonsqueezyId_key" ON "Subscription"("lemonsqueezyId");
