/*
  Warnings:

  - You are about to alter the column `createdAt` on the `Products` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - You are about to alter the column `updatedAt` on the `Products` table. The data in that column could be lost. The data in that column will be cast from `String` to `DateTime`.
  - Made the column `updatedAt` on table `Products` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "flavor" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "pricePerUnit" REAL NOT NULL,
    "currentQuantity" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Products" ("createdAt", "currentQuantity", "flavor", "id", "imageUrl", "name", "pricePerUnit", "type", "updatedAt") SELECT "createdAt", "currentQuantity", "flavor", "id", "imageUrl", "name", "pricePerUnit", "type", "updatedAt" FROM "Products";
DROP TABLE "Products";
ALTER TABLE "new_Products" RENAME TO "Products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
