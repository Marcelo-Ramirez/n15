/*
  Warnings:

  - You are about to drop the `production_batches` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `production_ingredients` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "production_batches";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "production_ingredients";
PRAGMA foreign_keys=on;
