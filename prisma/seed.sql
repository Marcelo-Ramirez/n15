-- Eliminar la tabla si ya existe
/*DROP TABLE IF EXISTS products;

-- Crear tabla products
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    unitPrice REAL NOT NULL,        -- precio de venta o costo unitario
    annualConsumption INTEGER NOT NULL, -- unidades vendidas
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insertar productos de la tabla ABC
INSERT INTO products (name, unitPrice, annualConsumption) VALUES
('Artículo 11asdlkfjasdfkljsakdlfjask', 8200, 3568),
('Artículo 13', 8450, 2830),
('Artículo 25', 12370, 1930),
('Artículo 22', 7990, 2975),
('Artículo 24', 9950, 2295),
('Artículo 16', 15450, 1456),
('Artículo 9sadnk', 19650, 978),
('Artículo 14asdkaslkjdlj', 9100, 960),
('Artículo 30lasdjoaisjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj', 8450, 875),
('Artículo 19', 4800, 952),
('Artículo 29', 6100, 350),
('Artículo 3', 2300, 690),
('Artículo 35', 2400, 657),
('Artículo 1', 3700, 385),
('Artículo 31', 3200, 389),
('Artículo 33', 1960, 621),
('Artículo 15', 3850, 280),
('Artículo 34', 2300, 459),
('Artículo 8', 3500, 286),
('Artículo 27', 1900, 526),
('Artículo 20', 1110, 860),
('Artículo 28', 1150, 700),
('Artículo 10', 1750, 415),
('Artículo 26', 1450, 489),
('Artículo 5', 3700, 180),
('Artículo 6', 195, 2790),
('Artículo 17', 965, 559),
('Artículo 23', 680, 742),
('Artículo 7', 809, 622),
('Artículo 18', 645, 612),
('Artículo 12', 2100, 169),
('Artículo 2', 1800, 150),
('Artículo 32', 450, 426),
('Artículo 21', 635, 221),
('Artículo 4', 450, 255);
*/

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