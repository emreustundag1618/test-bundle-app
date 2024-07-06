/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `productId` on the `ProductVariant` table. All the data in the column will be lost.
  - Added the required column `bundleId` to the `Accessory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `bundleId` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Product";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Accessory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "productType" TEXT NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "totalInventory" INTEGER NOT NULL,
    "featured_image" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "bundleId" TEXT NOT NULL,
    CONSTRAINT "Accessory_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Accessory" ("createdAt", "featured_image", "id", "price", "productType", "product_title", "quantityNeeded", "totalInventory", "updatedAt") SELECT "createdAt", "featured_image", "id", "price", "productType", "product_title", "quantityNeeded", "totalInventory", "updatedAt" FROM "Accessory";
DROP TABLE "Accessory";
ALTER TABLE "new_Accessory" RENAME TO "Accessory";
CREATE TABLE "new_ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "inventoryQuantity" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "variant_title" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "bundleId" TEXT NOT NULL,
    CONSTRAINT "ProductVariant_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("createdAt", "displayName", "id", "image", "inventoryQuantity", "price", "quantityNeeded", "updatedAt", "variant_title") SELECT "createdAt", "displayName", "id", "image", "inventoryQuantity", "price", "quantityNeeded", "updatedAt", "variant_title" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
