-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "displayName" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "inventoryQuantity" INTEGER NOT NULL,
    "image" TEXT NOT NULL,
    "variant_title" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME,
    "productId" TEXT NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_title" TEXT NOT NULL,
    "featured_image" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Accessory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "product_title" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "productType" TEXT NOT NULL,
    "quantityNeeded" INTEGER NOT NULL,
    "totalInventory" INTEGER NOT NULL,
    "featured_image" TEXT NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME
);
