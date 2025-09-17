/*
  Warnings:

  - You are about to drop the column `movement_date` on the `inventory_movements` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inventory_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredient_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "previous_quantity" REAL NOT NULL,
    "new_quantity" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_movements_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_inventory_movements" ("created_at", "id", "ingredient_id", "movement_type", "new_quantity", "previous_quantity", "quantity", "reason", "user_id") SELECT "created_at", "id", "ingredient_id", "movement_type", "new_quantity", "previous_quantity", "quantity", "reason", "user_id" FROM "inventory_movements";
DROP TABLE "inventory_movements";
ALTER TABLE "new_inventory_movements" RENAME TO "inventory_movements";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
