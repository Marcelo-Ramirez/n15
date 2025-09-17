/*
  Warnings:

  - You are about to drop the column `min_stock` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `ingredients` table. All the data in the column will be lost.
  - You are about to drop the column `total_cost` on the `inventory_movements` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `inventory_movements` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorUpdatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `users` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ingredients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "current_quantity" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "reorder_point" REAL,
    "price_per_unit" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_ingredients" ("created_at", "current_quantity", "id", "name", "price_per_unit", "unit", "updated_at") SELECT "created_at", "current_quantity", "id", "name", "price_per_unit", "unit", "updated_at" FROM "ingredients";
DROP TABLE "ingredients";
ALTER TABLE "new_ingredients" RENAME TO "ingredients";
CREATE TABLE "new_inventory_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredient_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "previous_quantity" REAL NOT NULL,
    "new_quantity" REAL NOT NULL,
    "movement_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_movements_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_inventory_movements" ("created_at", "id", "ingredient_id", "movement_date", "movement_type", "new_quantity", "previous_quantity", "quantity", "reason", "user_id") SELECT "created_at", "id", "ingredient_id", "movement_date", "movement_type", "new_quantity", "previous_quantity", "quantity", "reason", "user_id" FROM "inventory_movements";
DROP TABLE "inventory_movements";
ALTER TABLE "new_inventory_movements" RENAME TO "inventory_movements";
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret" TEXT
);
INSERT INTO "new_users" ("created_at", "id", "name", "password", "twoFactorEnabled", "twoFactorSecret", "username") SELECT "created_at", "id", "name", "password", "twoFactorEnabled", "twoFactorSecret", "username" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
