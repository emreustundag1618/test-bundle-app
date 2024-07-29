/*
  Warnings:

  - A unique constraint covering the columns `[shopifyId]` on the table `Bundle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bundle_shopifyId_key" ON "Bundle"("shopifyId");
