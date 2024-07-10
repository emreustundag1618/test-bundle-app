/*
  Warnings:

  - You are about to drop the column `featured_image` on the `Accessory` table. All the data in the column will be lost.
  - Added the required column `image` to the `Accessory` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Accessory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "productType" TEXT NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "totalInventory" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "bundleId" TEXT,
    CONSTRAINT "Accessory_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Accessory" ("bundleId", "createdAt", "id", "price", "productType", "quantityNeeded", "title", "totalInventory", "updatedAt") SELECT "bundleId", "createdAt", "id", "price", "productType", "quantityNeeded", "title", "totalInventory", "updatedAt" FROM "Accessory";
DROP TABLE "Accessory";
ALTER TABLE "new_Accessory" RENAME TO "Accessory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
