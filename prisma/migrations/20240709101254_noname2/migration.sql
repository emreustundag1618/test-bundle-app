/*
  Warnings:

  - Made the column `accId` on table `Accessory` required. This step will fail if there are existing NULL values in that column.
  - Made the column `varId` on table `ProductVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Accessory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accId" TEXT NOT NULL,
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
INSERT INTO "new_Accessory" ("accId", "bundleId", "createdAt", "id", "image", "price", "productType", "quantityNeeded", "title", "totalInventory", "updatedAt") SELECT "accId", "bundleId", "createdAt", "id", "image", "price", "productType", "quantityNeeded", "title", "totalInventory", "updatedAt" FROM "Accessory";
DROP TABLE "Accessory";
ALTER TABLE "new_Accessory" RENAME TO "Accessory";
CREATE TABLE "new_ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "varId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "inventory" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "bundleId" TEXT,
    CONSTRAINT "ProductVariant_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("bundleId", "createdAt", "displayName", "id", "image", "inventory", "price", "quantityNeeded", "title", "updatedAt", "varId") SELECT "bundleId", "createdAt", "displayName", "id", "image", "inventory", "price", "quantityNeeded", "title", "updatedAt", "varId" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
