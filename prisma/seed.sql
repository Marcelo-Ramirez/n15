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
*/*/ *///