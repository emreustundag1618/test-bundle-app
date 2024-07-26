-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "proId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "productType" TEXT NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "totalInventory" INTEGER NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "bundleId" TEXT,
    CONSTRAINT "Product_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("bundleId", "createdAt", "id", "image", "price", "proId", "productType", "quantityNeeded", "title", "totalInventory", "updatedAt") SELECT "bundleId", "createdAt", "id", "image", "price", "proId", "productType", "quantityNeeded", "title", "totalInventory", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
CREATE TABLE "new_Variant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "varId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "inventory" INTEGER NOT NULL,
    "image" TEXT,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "productId" TEXT,
    CONSTRAINT "Variant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Variant" ("createdAt", "id", "image", "inventory", "price", "productId", "quantityNeeded", "title", "updatedAt", "varId") SELECT "createdAt", "id", "image", "inventory", "price", "productId", "quantityNeeded", "title", "updatedAt", "varId" FROM "Variant";
DROP TABLE "Variant";
ALTER TABLE "new_Variant" RENAME TO "Variant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
