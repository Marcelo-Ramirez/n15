-- Limpia todas las tablas en el orden correcto para evitar errores de clave foránea.
DELETE FROM "Ingredients_EOQ_model";
DELETE FROM "Sale_products";
DELETE FROM "Sale_orders";
DELETE FROM "Order_clients";
DELETE FROM "Inventory_movements";
DELETE FROM "Product_movements";
DELETE FROM "Products";
DELETE FROM "Ingredients";
DELETE FROM "Users";



-- Reinicia los contadores de autoincremento de las tablas
DELETE FROM sqlite_sequence WHERE name = 'Users';
DELETE FROM sqlite_sequence WHERE name = 'Ingredients';
DELETE FROM sqlite_sequence WHERE name = 'Products';
DELETE FROM sqlite_sequence WHERE name = 'Order_clients';
DELETE FROM sqlite_sequence WHERE name = 'Sale_orders';
DELETE FROM sqlite_sequence WHERE name = 'Sale_products';
DELETE FROM sqlite_sequence WHERE name = 'Product_movements';
DELETE FROM sqlite_sequence WHERE name = 'Inventory_movements';
DELETE FROM sqlite_sequence WHERE name = 'Ingredients_EOQ_model';
---
-- Inserta datos iniciales para cada tabla.
-- Se usa DATETIME('now') para los campos de fecha y hora.

-- Inserta un usuario de ejemplo
INSERT INTO "Users" (
  "userName",
  "name",
  "phone",
  "password",
  "statusAccount",
  "role",
  "twoFactorEnabled",
  "createdAt",
  "updatedAt"
) VALUES
('admin', 'Administrador', '1111111111', 'marcos123', 'active', 'admin', FALSE, DATETIME('now'), DATETIME('now')),
('ventas', 'Vendedor', '2222222222', 'marcos123', 'active', 'ventas', FALSE, DATETIME('now'), DATETIME('now')),
('almacen', 'Encargado de Almacén', '3333333333', 'marcos123', 'active', 'almacen', FALSE, DATETIME('now'), DATETIME('now'));

---
-- Inserta un ingrediente de ejemploINSERT INTO "Ingredients" (
INSERT INTO "Ingredients" (
  "name",
  "unit",
  "pricePerUnit",
  "provider",
  "currentQuantity",
  "createdAt",
  "updatedAt"
) VALUES
('Azúcar', 'kg', 1.85, 'Dulce Sol S.A.', 150.0, DATETIME('now'), DATETIME('now')),
('Mantequilla sin sal', 'kg', 7.50, 'Lácteos El Campo', 25.0, DATETIME('now'), DATETIME('now')),
('Huevos', 'docena', 2.30, 'Granja Avícola', 60.0, DATETIME('now'), DATETIME('now')),
('Polvo de hornear', 'kg', 5.90, 'Repostería Superior', 10.0, DATETIME('now'), DATETIME('now')),
('Sal', 'kg', 0.80, 'Salinera La Costa', 200.0, DATETIME('now'), DATETIME('now')),
('Cacao en polvo', 'kg', 9.20, 'Chocolates Puros', 15.0, DATETIME('now'), DATETIME('now')),
('Levadura fresca', 'kg', 4.00, 'Levaduras El Panadero', 5.0, DATETIME('now'), DATETIME('now'));
---
-- Inserta un producto de ejemplo
INSERT INTO "Products" (
  "name",
  "flavor",
  "type",
  "imageUrl",
  "pricePerUnit",
  "currentQuantity",
  "createdAt",
  "updatedAt"
) VALUES (
  'Galleta de Avena',
  'Avena',
  'Galleta',
  'http://ejemplo.com/galleta.jpg',
  1.50,
  100.0,
  DATETIME('now'),
  DATETIME('now')
);

---
INSERT INTO "Inventory_movements" (
  "user_id",
  "ingredient_id",
  "movementType",
  "reason",
  "quantity",
  "createdAt"
) VALUES
-- Harina de Trigo (id: 1)
(1, 1, 'entrada', 'Compra inicial de proveedor A', 100.0, DATETIME('now', '-20 days')),
(1, 1, 'salida', 'Uso para producción de pan', 25.0, DATETIME('now', '-19 days')),
(1, 1, 'entrada', 'Compra de emergencia', 50.0, DATETIME('now', '-15 days')),
(1, 1, 'salida', 'Uso para producción de pasteles', 15.0, DATETIME('now', '-14 days')),
(1, 1, 'salida', 'Desperdicio por derrame', 2.0, DATETIME('now', '-13 days')),
(1, 1, 'entrada', 'Reposición programada', 80.0, DATETIME('now', '-10 days')),
(1, 1, 'salida', 'Uso para galletas', 10.0, DATETIME('now', '-9 days')),
(1, 1, 'entrada', 'Devolución de lote', 5.0, DATETIME('now', '-8 days')),
(1, 1, 'salida', 'Uso en taller de repostería', 3.0, DATETIME('now', '-7 days')),
(1, 1, 'entrada', 'Compra habitual', 40.0, DATETIME('now', '-6 days')),

-- Azúcar (id: 2)
(1, 2, 'entrada', 'Compra a proveedor B', 75.0, DATETIME('now', '-19 days')),
(1, 2, 'salida', 'Uso en pastelería', 10.0, DATETIME('now', '-18 days')),
(1, 2, 'entrada', 'Reposición de stock', 30.0, DATETIME('now', '-16 days')),
(1, 2, 'salida', 'Producción de jarabes', 5.0, DATETIME('now', '-15 days')),
(1, 2, 'salida', 'Uso para decoración', 1.0, DATETIME('now', '-14 days')),
(1, 2, 'entrada', 'Compra habitual', 50.0, DATETIME('now', '-11 days')),
(1, 2, 'salida', 'Uso en bebidas', 8.0, DATETIME('now', '-10 days')),
(1, 2, 'entrada', 'Lote de prueba', 2.0, DATETIME('now', '-9 days')),
(1, 2, 'salida', 'Producción de glaseado', 4.0, DATETIME('now', '-8 days')),
(1, 2, 'entrada', 'Entrega urgente', 20.0, DATETIME('now', '-7 days')),

-- Mantequilla sin sal (id: 3)
(1, 3, 'entrada', 'Compra a distribuidor', 50.0, DATETIME('now', '-18 days')),
(1, 3, 'salida', 'Uso para masa de hojaldre', 15.0, DATETIME('now', '-17 days')),
(1, 3, 'entrada', 'Reposición semanal', 25.0, DATETIME('now', '-15 days')),
(1, 3, 'salida', 'Uso en cremas', 7.0, DATETIME('now', '-14 days')),
(1, 3, 'salida', 'Congelado para futuras preparaciones', 5.0, DATETIME('now', '-13 days')),
(1, 3, 'entrada', 'Entrega regular', 30.0, DATETIME('now', '-11 days')),
(1, 3, 'salida', 'Uso para pasteles de crema', 10.0, DATETIME('now', '-10 days')),
(1, 3, 'entrada', 'Compra especial', 10.0, DATETIME('now', '-9 days')),
(1, 3, 'salida', 'Uso en panadería', 6.0, DATETIME('now', '-8 days')),
(1, 3, 'entrada', 'Devolución de envío', 1.0, DATETIME('now', '-7 days')),

-- Huevos (id: 4)
(1, 4, 'entrada', 'Compra a Granja Avícola', 12.0, DATETIME('now', '-17 days')),
(1, 4, 'salida', 'Uso en panes', 4.0, DATETIME('now', '-16 days')),
(1, 4, 'entrada', 'Reposición de stock', 6.0, DATETIME('now', '-14 days')),
(1, 4, 'salida', 'Producción de merengue', 3.0, DATETIME('now', '-13 days')),
(1, 4, 'salida', 'Consumo interno', 1.0, DATETIME('now', '-12 days')),
(1, 4, 'entrada', 'Entrega semanal', 10.0, DATETIME('now', '-10 days')),
(1, 4, 'salida', 'Uso en bizcochos', 5.0, DATETIME('now', '-9 days')),
(1, 4, 'entrada', 'Lote adicional', 4.0, DATETIME('now', '-8 days')),
(1, 4, 'salida', 'Uso para frituras', 2.0, DATETIME('now', '-7 days')),
(1, 4, 'entrada', 'Compra rápida', 3.0, DATETIME('now', '-6 days')),

-- Polvo de hornear (id: 5)
(1, 5, 'entrada', 'Compra a distribuidor', 5.0, DATETIME('now', '-16 days')),
(1, 5, 'salida', 'Uso en muffins', 1.0, DATETIME('now', '-15 days')),
(1, 5, 'entrada', 'Reposición de stock', 2.0, DATETIME('now', '-14 days')),
(1, 5, 'salida', 'Uso en pasteles', 0.5, DATETIME('now', '-13 days')),
(1, 5, 'salida', 'Venta a cliente', 0.1, DATETIME('now', '-12 days')),
(1, 5, 'entrada', 'Entrega mensual', 3.0, DATETIME('now', '-10 days')),
(1, 5, 'salida', 'Uso en bizcochos', 0.8, DATETIME('now', '-9 days')),
(1, 5, 'entrada', 'Compra habitual', 1.0, DATETIME('now', '-8 days')),
(1, 5, 'salida', 'Uso para galletas', 0.2, DATETIME('now', '-7 days')),
(1, 5, 'entrada', 'Lote de prueba', 0.5, DATETIME('now', '-6 days')),

-- Sal (id: 6)
(1, 6, 'entrada', 'Compra a distribuidor', 50.0, DATETIME('now', '-15 days')),
(1, 6, 'salida', 'Uso en panadería', 10.0, DATETIME('now', '-14 days')),
(1, 6, 'entrada', 'Reposición programada', 30.0, DATETIME('now', '-13 days')),
(1, 6, 'salida', 'Uso en cocina', 5.0, DATETIME('now', '-12 days')),
(1, 6, 'salida', 'Uso para pasteles salados', 2.0, DATETIME('now', '-11 days')),
(1, 6, 'entrada', 'Compra habitual', 20.0, DATETIME('now', '-9 days')),
(1, 6, 'salida', 'Uso para condimentos', 3.0, DATETIME('now', '-8 days')),
(1, 6, 'entrada', 'Lote de respaldo', 10.0, DATETIME('now', '-7 days')),
(1, 6, 'salida', 'Uso en salsas', 1.0, DATETIME('now', '-6 days')),
(1, 6, 'entrada', 'Compra a granel', 40.0, DATETIME('now', '-5 days')),

-- Levadura fresca (id: 7)
(1, 7, 'entrada', 'Compra a proveedor de levaduras', 10.0, DATETIME('now', '-14 days')),
(1, 7, 'salida', 'Uso en masa para pizza', 2.0, DATETIME('now', '-13 days')),
(1, 7, 'entrada', 'Reposición semanal', 5.0, DATETIME('now', '-12 days')),
(1, 7, 'salida', 'Uso en pan dulce', 1.0, DATETIME('now', '-11 days')),
(1, 7, 'salida', 'Desperdicio', 0.5, DATETIME('now', '-10 days')),
(1, 7, 'entrada', 'Entrega regular', 3.0, DATETIME('now', '-8 days')),
(1, 7, 'salida', 'Uso en pan integral', 0.8, DATETIME('now', '-7 days')),
(1, 7, 'entrada', 'Compra habitual', 2.0, DATETIME('now', '-6 days')),
(1, 7, 'salida', 'Uso en masa madre', 0.5, DATETIME('now', '-5 days')),
(1, 7, 'entrada', 'Lote adicional', 1.0, DATETIME('now', '-4 days'));

---
-- Inserta un pedido del cliente.
INSERT INTO "Order_clients" (
  "client_id",
  "product_id",
  "quantity",
  "status",
  "createdAt"
) VALUES (
  1,
  1,
  5.0,
  'pending',
  DATETIME('now')
);

---
-- Inserta una orden de venta.
INSERT INTO "Sale_orders" (
  "user_id",
  "order_client_id",
  "totalCostOrder",
  "createdAt"
) VALUES (
  1,
  1,
  7.50,
  DATETIME('now')
);

---
-- Inserta un producto vendido.
INSERT INTO "Sale_products" (
  "user_id",
  "product_id",
  "quantity",
  "sale_order_id",
  "createdAt"
) VALUES (
  1,
  1,
  5.0,
  1,
  DATETIME('now')
);

---
-- Inserta un movimiento de producto.
INSERT INTO "Product_movements" (
  "user_id",
  "product_id",
  "movement_type",
  "quantity",
  "createdAt"
) VALUES (
  1,
  1,
  'salida',
  5.0,
  DATETIME('now')
);

---
-- Inserta el modelo EOQ (Cantidad Económica de Pedido) para un ingrediente.
INSERT INTO "Ingredients_EOQ_model" (
  "id_Ingredient",
  "orderingCost",
  "annualMaintenanceCost",
  "leadTimeDays",
  "dailyDemand",
  "annualDemand",
  "reorderPoint",
  "updatedAt"
) VALUES (
  1,
  10.0,
  0.5,
  7.0,
  2.0,
  500.0,
  14.0,
  DATETIME('now')
);