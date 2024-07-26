/*
  Warnings:

  - Made the column `shopifyId` on table `Bundle` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Bundle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shopifyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL
);
INSERT INTO "new_Bundle" ("id", "shopifyId", "slug", "title") SELECT "id", "shopifyId", "slug", "title" FROM "Bundle";
DROP TABLE "Bundle";
ALTER TABLE "new_Bundle" RENAME TO "Bundle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
