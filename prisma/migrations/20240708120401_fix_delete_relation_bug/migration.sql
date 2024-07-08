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
    "bundleId" TEXT,
    CONSTRAINT "Accessory_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Accessory" ("bundleId", "createdAt", "featured_image", "id", "price", "productType", "product_title", "quantityNeeded", "totalInventory", "updatedAt") SELECT "bundleId", "createdAt", "featured_image", "id", "price", "productType", "product_title", "quantityNeeded", "totalInventory", "updatedAt" FROM "Accessory";
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
    "bundleId" TEXT,
    CONSTRAINT "ProductVariant_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ProductVariant" ("bundleId", "createdAt", "displayName", "id", "image", "inventoryQuantity", "price", "quantityNeeded", "updatedAt", "variant_title") SELECT "bundleId", "createdAt", "displayName", "id", "image", "inventoryQuantity", "price", "quantityNeeded", "updatedAt", "variant_title" FROM "ProductVariant";
DROP TABLE "ProductVariant";
ALTER TABLE "new_ProductVariant" RENAME TO "ProductVariant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
