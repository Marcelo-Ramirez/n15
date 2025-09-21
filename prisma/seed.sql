

-- ===============================
-- Tabla Ingredients
-- ===============================
DROP TABLE IF EXISTS ingredients;

CREATE TABLE ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    current_quantity REAL DEFAULT 0,
    unit TEXT NOT NULL,
    reorder_point REAL,
    price_per_unit REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar ingredientes de ejemplo con precios realistas en Bs
INSERT INTO ingredients (name, current_quantity, unit, reorder_point, price_per_unit) VALUES
('Gelatina sin sabor', 5000, 'g', 1000, 50.00),
('Azúcar', 10000, 'g', 2000, 20.00),
('Colorante rojo', 500, 'ml', 100, 150.00),
('Colorante azul', 500, 'ml', 100, 150.00),
('Colorante amarillo', 500, 'ml', 100, 150.00),
('Sabor fresa', 300, 'ml', 50, 200.00),
('Sabor limón', 300, 'ml', 50, 200.00),
('Sabor naranja', 300, 'ml', 50, 200.00),
('Jarabe de maíz', 2000, 'g', 500, 30.00),
('Ácido cítrico', 200, 'g', 50, 100.00);

-- ===============================
-- Tabla InventoryMovements
-- ===============================
DROP TABLE IF EXISTS inventory_movements;

CREATE TABLE inventory_movements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ingredient_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    movement_type TEXT NOT NULL,  -- 'entrada' o 'salida'
    reason TEXT NOT NULL,
    quantity REAL NOT NULL,
    previous_quantity REAL NOT NULL,
    new_quantity REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);

-- Movimientos de salida (10 por ingrediente, user_id = 1)
INSERT INTO inventory_movements (ingredient_id, user_id, movement_type, reason, quantity, previous_quantity, new_quantity) VALUES
-- Gelatina sin sabor (id=1)
(1, 1, 'salida', 'produccion', 500, 5000, 4500),
(1, 1, 'salida', 'produccion', 300, 4500, 4200),
(1, 1, 'salida', 'produccion', 400, 4200, 3800),
(1, 1, 'salida', 'produccion', 350, 3800, 3450),
(1, 1, 'salida', 'produccion', 250, 3450, 3200),
(1, 1, 'salida', 'produccion', 300, 3200, 2900),
(1, 1, 'salida', 'produccion', 200, 2900, 2700),
(1, 1, 'salida', 'produccion', 250, 2700, 2450),
(1, 1, 'salida', 'produccion', 150, 2450, 2300),
(1, 1, 'salida', 'produccion', 200, 2300, 2100),

-- Azúcar (id=2)
(2, 1, 'salida', 'produccion', 1000, 10000, 9000),
(2, 1, 'salida', 'produccion', 800, 9000, 8200),
(2, 1, 'salida', 'produccion', 700, 8200, 7500),
(2, 1, 'salida', 'produccion', 600, 7500, 6900),
(2, 1, 'salida', 'produccion', 500, 6900, 6400),
(2, 1, 'salida', 'produccion', 400, 6400, 6000),
(2, 1, 'salida', 'produccion', 300, 6000, 5700),
(2, 1, 'salida', 'produccion', 500, 5700, 5200),
(2, 1, 'salida', 'produccion', 200, 5200, 5000),
(2, 1, 'salida', 'produccion', 300, 5000, 4700),

-- Colorante rojo (id=3)
(3, 1, 'salida', 'produccion', 50, 500, 450),
(3, 1, 'salida', 'produccion', 30, 450, 420),
(3, 1, 'salida', 'produccion', 40, 420, 380),
(3, 1, 'salida', 'produccion', 35, 380, 345),
(3, 1, 'salida', 'produccion', 25, 345, 320),
(3, 1, 'salida', 'produccion', 30, 320, 290),
(3, 1, 'salida', 'produccion', 20, 290, 270),
(3, 1, 'salida', 'produccion', 25, 270, 245),
(3, 1, 'salida', 'produccion', 15, 245, 230),
(3, 1, 'salida', 'produccion', 20, 230, 210),

-- Colorante azul (id=4)
(4, 1, 'salida', 'produccion', 50, 500, 450),
(4, 1, 'salida', 'produccion', 30, 450, 420),
(4, 1, 'salida', 'produccion', 40, 420, 380),
(4, 1, 'salida', 'produccion', 35, 380, 345),
(4, 1, 'salida', 'produccion', 25, 345, 320),
(4, 1, 'salida', 'produccion', 30, 320, 290),
(4, 1, 'salida', 'produccion', 20, 290, 270),
(4, 1, 'salida', 'produccion', 25, 270, 245),
(4, 1, 'salida', 'produccion', 15, 245, 230),
(4, 1, 'salida', 'produccion', 20, 230, 210),

-- Colorante amarillo (id=5)
(5, 1, 'salida', 'produccion', 50, 500, 450),
(5, 1, 'salida', 'produccion', 30, 450, 420),
(5, 1, 'salida', 'produccion', 40, 420, 380),
(5, 1, 'salida', 'produccion', 35, 380, 345),
(5, 1, 'salida', 'produccion', 25, 345, 320),
(5, 1, 'salida', 'produccion', 30, 320, 290),
(5, 1, 'salida', 'produccion', 20, 290, 270),
(5, 1, 'salida', 'produccion', 25, 270, 245),
(5, 1, 'salida', 'produccion', 15, 245, 230),
(5, 1, 'salida', 'produccion', 20, 230, 210),

-- Sabor fresa (id=6)
(6, 1, 'salida', 'produccion', 20, 300, 280),
(6, 1, 'salida', 'produccion', 15, 280, 265),
(6, 1, 'salida', 'produccion', 25, 265, 240),
(6, 1, 'salida', 'produccion', 20, 240, 220),
(6, 1, 'salida', 'produccion', 15, 220, 205),
(6, 1, 'salida', 'produccion', 10, 205, 195),
(6, 1, 'salida', 'produccion', 15, 195, 180),
(6, 1, 'salida', 'produccion', 10, 180, 170),
(6, 1, 'salida', 'produccion', 10, 170, 160),
(6, 1, 'salida', 'produccion', 10, 160, 150),

-- Sabor limón (id=7)
(7, 1, 'salida', 'produccion', 20, 300, 280),
(7, 1, 'salida', 'produccion', 15, 280, 265),
(7, 1, 'salida', 'produccion', 25, 265, 240),
(7, 1, 'salida', 'produccion', 20, 240, 220),
(7, 1, 'salida', 'produccion', 15, 220, 205),
(7, 1, 'salida', 'produccion', 10, 205, 195),
(7, 1, 'salida', 'produccion', 15, 195, 180),
(7, 1, 'salida', 'produccion', 10, 180, 170),
(7, 1, 'salida', 'produccion', 10, 170, 160),
(7, 1, 'salida', 'produccion', 10, 160, 150),

-- Sabor naranja (id=8)
(8, 1, 'salida', 'produccion', 20, 300, 280),
(8, 1, 'salida', 'produccion', 15, 280, 265),
(8, 1, 'salida', 'produccion', 25, 265, 240),
(8, 1, 'salida', 'produccion', 20, 240, 220),
(8, 1, 'salida', 'produccion', 15, 220, 205),
(8, 1, 'salida', 'produccion', 10, 205, 195),
(8, 1, 'salida', 'produccion', 15, 195, 180),
(8, 1, 'salida', 'produccion', 10, 180, 170),
(8, 1, 'salida', 'produccion', 10, 170, 160),
(8, 1, 'salida', 'produccion', 10, 160, 150);
DROP TABLE IF EXISTS products;

CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    tipo TEXT,
    sabor TEXT,
    current_quantity REAL DEFAULT 0,
    image_path TEXT,
    cost_per_unit REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar productos de ejemplo con las nuevas columnas
INSERT INTO products (name, description, tipo, sabor, current_quantity, cost_per_unit) VALUES
('Gelatina de fresa', 'Gelatina de fresa deliciosa', 'gelatina', 'fresa', 100, 5.0),
('Gelatina de limón', 'Gelatina de limón refrescante', 'gelatina', 'limón', 100, 5.0),
('Gelatina de naranja', 'Gelatina de naranja natural', 'gelatina', 'naranja', 100, 5.0),
('Gelatina mixta', 'Gelatina mixta surtida', 'gelatina', 'mixta', 100, 5.0),
('Jugo natural fresa', 'Jugo natural fresa', 'jugo', 'fresa', 50, 3.0),
('Jugo natural limón', 'Jugo natural limón', 'jugo', 'limón', 50, 3.0),
('Jugo natural naranja', 'Jugo natural naranja', 'jugo', 'naranja', 50, 3.0);

DROP TABLE IF EXISTS sale_orders;

CREATE TABLE sale_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_client_id INTEGER NOT NULL,
    total_cost_order REAL NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_client_id) REFERENCES order_clients(id)
);

-- Ejemplo de inserción (supongamos que order_client_id ya existe)
INSERT INTO sale_orders (user_id, order_client_id, total_cost_order) VALUES
(1, 1, 75.00),
(1, 2, 45.00),
(1, 3, 30.00);

DROP TABLE IF EXISTS sale_products;

CREATE TABLE sale_products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Ejemplo de inserción
INSERT INTO sale_products (user_id, product_id, quantity) VALUES
(1, 1, 5),
(1, 2, 3),
(1, 3, 2);

-- ===============================
-- Tabla OrderClients (faltante)
-- ===============================
DROP TABLE IF EXISTS order_clients;

CREATE TABLE order_clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pendiente', -- pendiente, pagado, cancelado
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Insertar pedidos de ejemplo para user_id = 1
INSERT INTO order_clients (user_id, product_id, quantity, status) VALUES
(1, 1, 5, 'pendiente'),
(1, 2, 3, 'pendiente'),
(1, 3, 2, 'pagado'),
(1, 4, 1, 'pendiente'),
(1, 5, 6, 'pagado'),
(1, 6, 2, 'pendiente'),
(1, 7, 1, 'pendiente');
