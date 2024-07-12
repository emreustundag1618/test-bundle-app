/*
  Warnings:

  - You are about to drop the `Accessory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestModel` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Accessory";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ProductVariant";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "TestModel";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "productType" TEXT NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "totalInventory" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "bundleId" TEXT,
    CONSTRAINT "Product_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Variant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "varId" TEXT,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "inventory" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "productId" TEXT,
    CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
