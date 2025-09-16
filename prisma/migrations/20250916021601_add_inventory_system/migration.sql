-- CreateTable
CREATE TABLE "ingredients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "current_quantity" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL,
    "min_stock" REAL NOT NULL,
    "price_per_unit" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'normal',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "inventory_movements" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ingredient_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "movement_type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "previous_quantity" REAL NOT NULL,
    "new_quantity" REAL NOT NULL,
    "unit_price" REAL,
    "total_cost" REAL,
    "notes" TEXT,
    "movement_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "inventory_movements_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "inventory_movements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_movements_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_batches" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batch_code" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "quantity_produced" INTEGER NOT NULL,
    "production_date" DATETIME NOT NULL,
    "created_by" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "production_batches_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "production_ingredients" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "batch_id" INTEGER NOT NULL,
    "ingredient_id" INTEGER NOT NULL,
    "quantity_used" REAL NOT NULL,
    "movement_id" INTEGER NOT NULL,
    CONSTRAINT "production_ingredients_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "production_batches" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "production_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "production_ingredients_movement_id_fkey" FOREIGN KEY ("movement_id") REFERENCES "inventory_movements" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "production_batches_batch_code_key" ON "production_batches"("batch_code");

-- CreateIndex
CREATE UNIQUE INDEX "production_ingredients_movement_id_key" ON "production_ingredients"("movement_id");
