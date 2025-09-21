-- ===============================
-- Script para sembrar datos en la base de datos
-- ===============================

-- Eliminar tablas si existen para evitar conflictos
DROP TABLE IF EXISTS "Users";
DROP TABLE IF EXISTS "Ingredients";
DROP TABLE IF EXISTS "Ingredients_EOQ_model";
DROP TABLE IF EXISTS "Inventory_movements";
DROP TABLE IF EXISTS "Products";
DROP TABLE IF EXISTS "Order_clients";
DROP TABLE IF EXISTS "Sale_orders";
DROP TABLE IF EXISTS "Sale_products";

-- ===============================
-- Tabla Users
-- ===============================
CREATE TABLE "Users" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userName TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT,
    password TEXT NOT NULL,
    statusAccount TEXT NOT NULL DEFAULT 'active',
    role TEXT NOT NULL DEFAULT 'cliente',
    twoFactorSecret TEXT,
    twoFactorEnabled INTEGER NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Users" (userName, name, phone, password) VALUES
('administrador', 'Admin General', '123456789', 'admin1234'),
('usuario1', 'Juan Perez', '987654321', 'user123'),
('usuario2', 'Maria Lopez', '112233445', 'user456');

-- ===============================
-- Tabla Ingredients
-- ===============================
CREATE TABLE "Ingredients" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unit TEXT NOT NULL,
    pricePerUnit REAL NOT NULL,
    provider TEXT NOT NULL,
    currentQuantity REAL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Ingredients" (name, unit, pricePerUnit, provider, currentQuantity) VALUES
('Gelatina sin sabor', 'g', 50.00, 'Proveedor A', 5000),
('Azúcar', 'g', 20.00, 'Proveedor B', 10000),
('Colorante rojo', 'ml', 150.00, 'Proveedor C', 500),
('Colorante azul', 'ml', 150.00, 'Proveedor C', 500),
('Colorante amarillo', 'ml', 150.00, 'Proveedor C', 500),
('Sabor fresa', 'ml', 200.00, 'Proveedor D', 300),
('Sabor limón', 'ml', 200.00, 'Proveedor D', 300),
('Sabor naranja', 'ml', 200.00, 'Proveedor D', 300),
('Jarabe de maíz', 'g', 30.00, 'Proveedor E', 2000),
('Ácido cítrico', 'g', 100.00, 'Proveedor F', 200);


-- Tabla Products (corregida)
-- ===============================
DROP TABLE IF EXISTS "Products";

CREATE TABLE "Products" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    flavor TEXT,
    type TEXT,
    imageUrl TEXT,
    pricePerUnit REAL DEFAULT 0,
    currentQuantity REAL DEFAULT 0,
    createdAt TEXT, -- Este campo sigue siendo no nulo en tu esquema de Prisma
    updatedAt TEXT -- Este campo es opcional en tu esquema de Prisma
);

-- Insertar productos con valores para createdAt y updatedAt
INSERT INTO "Products" (name, flavor, type, imageUrl, pricePerUnit, currentQuantity, createdAt, updatedAt) VALUES
('Gelatina de fresa', 'fresa', 'gelatina', 'https://example.com/images/fresa.jpg', 5.0, 100, '2025-09-21T10:00:00Z', '2025-09-21T10:00:00Z'),
('Gelatina de limón', 'limón', 'gelatina', 'https://example.com/images/limon.jpg', 5.0, 100, '2025-09-21T10:01:00Z', '2025-09-21T10:01:00Z'),
('Gelatina de naranja', 'naranja', 'gelatina', 'https://example.com/images/naranja.jpg', 5.0, 100, '2025-09-21T10:02:00Z', '2025-09-21T10:02:00Z'),
('Gelatina mixta', 'mixta', 'gelatina', 'https://example.com/images/mixta.jpg', 5.0, 100, '2025-09-21T10:03:00Z', '2025-09-21T10:03:00Z'),
('Jugo natural fresa', 'fresa', 'jugo', 'https://example.com/images/jugo_fresa.jpg', 3.0, 50, '2025-09-21T10:04:00Z', '2025-09-21T10:04:00Z'),
('Jugo natural limón', 'limón', 'jugo', 'https://example.com/images/jugo_limon.jpg', 3.0, 50, '2025-09-21T10:05:00Z', '2025-09-21T10:05:00Z'),
('Jugo natural naranja', 'naranja', 'jugo', 'https://example.com/images/jugo_naranja.jpg', 3.0, 50, '2025-09-21T10:06:00Z', '2025-09-21T10:06:00Z');
-- ===============================
-- Tabla Order_clients
-- ===============================
CREATE TABLE "Order_clients" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES "Users"(id),
    FOREIGN KEY (product_id) REFERENCES "Products"(id)
);

-- ===============================
-- Tabla Sale_orders
-- ===============================
CREATE TABLE "Sale_orders" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_client_id INTEGER NOT NULL,
    totalCostOrder REAL NOT NULL DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "Users"(id),
    FOREIGN KEY (order_client_id) REFERENCES "Order_clients"(id)
);

-- ===============================
-- Tabla Sale_products
-- ===============================
CREATE TABLE "Sale_products" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "Users"(id),
    FOREIGN KEY (product_id) REFERENCES "Products"(id)
);

-- ===============================
-- Tabla Inventory_movements
-- ===============================
CREATE TABLE "Inventory_movements" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    ingredient_id INTEGER NOT NULL,
    movementType TEXT NOT NULL,
    reason TEXT NOT NULL,
    quantity REAL NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES "Users"(id),
    FOREIGN KEY (ingredient_id) REFERENCES "Ingredients"(id) ON DELETE CASCADE
);

-- Movimientos de inventario (corregidos)
INSERT INTO "Inventory_movements" (ingredient_id, user_id, movementType, reason, quantity) VALUES
-- Gelatina sin sabor (id=1)
(1, 1, 'salida', 'produccion', 500),
(1, 1, 'salida', 'produccion', 300),
(1, 1, 'salida', 'produccion', 400),
(1, 1, 'salida', 'produccion', 350),
(1, 1, 'salida', 'produccion', 250),
(1, 1, 'salida', 'produccion', 300),
(1, 1, 'salida', 'produccion', 200),
(1, 1, 'salida', 'produccion', 250),
(1, 1, 'salida', 'produccion', 150),
(1, 1, 'salida', 'produccion', 200),

-- Azúcar (id=2)
(2, 1, 'salida', 'produccion', 1000),
(2, 1, 'salida', 'produccion', 800),
(2, 1, 'salida', 'produccion', 700),
(2, 1, 'salida', 'produccion', 600),
(2, 1, 'salida', 'produccion', 500),
(2, 1, 'salida', 'produccion', 400),
(2, 1, 'salida', 'produccion', 300),
(2, 1, 'salida', 'produccion', 500),
(2, 1, 'salida', 'produccion', 200),
(2, 1, 'salida', 'produccion', 300),

-- Colorante rojo (id=3)
(3, 1, 'salida', 'produccion', 50),
(3, 1, 'salida', 'produccion', 30),
(3, 1, 'salida', 'produccion', 40),
(3, 1, 'salida', 'produccion', 35),
(3, 1, 'salida', 'produccion', 25),
(3, 1, 'salida', 'produccion', 30),
(3, 1, 'salida', 'produccion', 20),
(3, 1, 'salida', 'produccion', 25),
(3, 1, 'salida', 'produccion', 15),
(3, 1, 'salida', 'produccion', 20),

-- Colorante azul (id=4)
(4, 1, 'salida', 'produccion', 50),
(4, 1, 'salida', 'produccion', 30),
(4, 1, 'salida', 'produccion', 40),
(4, 1, 'salida', 'produccion', 35),
(4, 1, 'salida', 'produccion', 25),
(4, 1, 'salida', 'produccion', 30),
(4, 1, 'salida', 'produccion', 20),
(4, 1, 'salida', 'produccion', 25),
(4, 1, 'salida', 'produccion', 15),
(4, 1, 'salida', 'produccion', 20),

-- Colorante amarillo (id=5)
(5, 1, 'salida', 'produccion', 50),
(5, 1, 'salida', 'produccion', 30),
(5, 1, 'salida', 'produccion', 40),
(5, 1, 'salida', 'produccion', 35),
(5, 1, 'salida', 'produccion', 25),
(5, 1, 'salida', 'produccion', 30),
(5, 1, 'salida', 'produccion', 20),
(5, 1, 'salida', 'produccion', 25),
(5, 1, 'salida', 'produccion', 15),
(5, 1, 'salida', 'produccion', 20),

-- Sabor fresa (id=6)
(6, 1, 'salida', 'produccion', 20),
(6, 1, 'salida', 'produccion', 15),
(6, 1, 'salida', 'produccion', 25),
(6, 1, 'salida', 'produccion', 20),
(6, 1, 'salida', 'produccion', 15),
(6, 1, 'salida', 'produccion', 10),
(6, 1, 'salida', 'produccion', 15),
(6, 1, 'salida', 'produccion', 10),
(6, 1, 'salida', 'produccion', 10),
(6, 1, 'salida', 'produccion', 10),

-- Sabor limón (id=7)
(7, 1, 'salida', 'produccion', 20),
(7, 1, 'salida', 'produccion', 15),
(7, 1, 'salida', 'produccion', 25),
(7, 1, 'salida', 'produccion', 20),
(7, 1, 'salida', 'produccion', 15),
(7, 1, 'salida', 'produccion', 10),
(7, 1, 'salida', 'produccion', 15),
(7, 1, 'salida', 'produccion', 10),
(7, 1, 'salida', 'produccion', 10),
(7, 1, 'salida', 'produccion', 10),

-- Sabor naranja (id=8)
(8, 1, 'salida', 'produccion', 20),
(8, 1, 'salida', 'produccion', 15),
(8, 1, 'salida', 'produccion', 25),
(8, 1, 'salida', 'produccion', 20),
(8, 1, 'salida', 'produccion', 15),
(8, 1, 'salida', 'produccion', 10),
(8, 1, 'salida', 'produccion', 15),
(8, 1, 'salida', 'produccion', 10),
(8, 1, 'salida', 'produccion', 10),
(8, 1, 'salida', 'produccion', 10);
