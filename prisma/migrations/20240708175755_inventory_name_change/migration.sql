/*
  Warnings:

  - You are about to drop the column `inventoryQuantity` on the `ProductVariant` table. All the data in the column will be lost.
  - Added the required column `inventory` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "inventory" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "variant_title" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "bundleId" TEXT,
    CONSTRAINT "ProductVariant_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("bundleId", "createdAt", "displayName", "id", "image", "price", "quantityNeeded", "updatedAt", "variant_title") SELECT "bundleId", "createdAt", "displayName", "id", "image", "price", "quantityNeeded", "updatedAt", "variant_title" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
