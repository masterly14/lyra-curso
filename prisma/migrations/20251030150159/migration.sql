/*
  Warnings:

  - A unique constraint covering the columns `[variantId]` on the table `Plans` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Plans_variantId_key" ON "Plans"("variantId");
