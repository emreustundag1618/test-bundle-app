/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Bundle` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Bundle_slug_key" ON "Bundle"("slug");
