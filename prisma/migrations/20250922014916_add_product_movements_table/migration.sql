/*
  Warnings:

  - Added the required column `sale_order_id` to the `Sale_products` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Product_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

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
    "createdAt" TEXT NOT NULL,
    "updatedAt" TEXT
);
INSERT INTO "new_Products" ("createdAt", "currentQuantity", "flavor", "id", "imageUrl", "name", "pricePerUnit", "type", "updatedAt") SELECT "createdAt", "currentQuantity", "flavor", "id", "imageUrl", "name", "pricePerUnit", "type", "updatedAt" FROM "Products";
DROP TABLE "Products";
ALTER TABLE "new_Products" RENAME TO "Products";
CREATE TABLE "new_Sale_orders" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "order_client_id" INTEGER NOT NULL,
    "totalCostOrder" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Sale_orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_orders_order_client_id_fkey" FOREIGN KEY ("order_client_id") REFERENCES "Order_clients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sale_orders" ("createdAt", "id", "order_client_id", "totalCostOrder", "user_id") SELECT "createdAt", "id", "order_client_id", "totalCostOrder", "user_id" FROM "Sale_orders";
DROP TABLE "Sale_orders";
ALTER TABLE "new_Sale_orders" RENAME TO "Sale_orders";
CREATE UNIQUE INDEX "Sale_orders_order_client_id_key" ON "Sale_orders"("order_client_id");
CREATE TABLE "new_Sale_products" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "quantity" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sale_order_id" INTEGER NOT NULL,
    CONSTRAINT "Sale_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_products_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Sale_products_sale_order_id_fkey" FOREIGN KEY ("sale_order_id") REFERENCES "Sale_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Sale_products" ("createdAt", "id", "product_id", "quantity", "user_id") SELECT "createdAt", "id", "product_id", "quantity", "user_id" FROM "Sale_products";
DROP TABLE "Sale_products";
ALTER TABLE "new_Sale_products" RENAME TO "Sale_products";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
