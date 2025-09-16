const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Verificando ingredientes existentes...');
    
    const existingCount = await prisma.ingredient.count();
    console.log(`📊 Ingredientes actuales: ${existingCount}`);
    
    if (existingCount > 0) {
      console.log('❌ Ya existen ingredientes. Eliminando todos...');
      await prisma.inventoryMovement.deleteMany({});
      await prisma.ingredient.deleteMany({});
      console.log('✅ Base de datos limpiada');
    }

    console.log('🌱 Creando ingredientes...');
    
    const ingredients = [
      { name: "Miel orgánica", currentQuantity: 5.2, unit: "kg", minStock: 2.0, pricePerUnit: 8.50, status: "normal" },
      { name: "Gelatina sin sabor", currentQuantity: 2.5, unit: "kg", minStock: 1.0, pricePerUnit: 12.00, status: "normal" },
      { name: "Pulpa de fresa", currentQuantity: 3.5, unit: "kg", minStock: 2.0, pricePerUnit: 4.20, status: "normal" },
      { name: "Pulpa de mango", currentQuantity: 1.2, unit: "kg", minStock: 2.0, pricePerUnit: 3.80, status: "critico" },
      { name: "Pulpa de maracuyá", currentQuantity: 2.8, unit: "kg", minStock: 1.5, pricePerUnit: 5.10, status: "normal" },
      { name: "Pulpa de piña", currentQuantity: 2.1, unit: "kg", minStock: 1.5, pricePerUnit: 3.60, status: "normal" },
      { name: "Pulpa de guayaba", currentQuantity: 0.9, unit: "kg", minStock: 1.5, pricePerUnit: 4.50, status: "critico" },
      { name: "Pulpa de mora", currentQuantity: 1.7, unit: "kg", minStock: 1.0, pricePerUnit: 6.20, status: "normal" },
      { name: "Pulpa de lulo", currentQuantity: 0.6, unit: "kg", minStock: 1.0, pricePerUnit: 5.80, status: "critico" },
      { name: "Pulpa de manzana", currentQuantity: 2.3, unit: "kg", minStock: 1.5, pricePerUnit: 3.90, status: "normal" },
      { name: "Pulpa de naranja", currentQuantity: 3.1, unit: "kg", minStock: 2.0, pricePerUnit: 3.20, status: "normal" },
      { name: "Pulpa de kiwi", currentQuantity: 1.4, unit: "kg", minStock: 1.0, pricePerUnit: 7.80, status: "normal" },
      { name: "Pulpa de coconut", currentQuantity: 1.8, unit: "kg", minStock: 1.2, pricePerUnit: 6.50, status: "normal" },
      { name: "Envolturas biodegradables", currentQuantity: 2500, unit: "unidades", minStock: 1000, pricePerUnit: 0.05, status: "normal" }
    ];

    for (const data of ingredients) {
      const ingredient = await prisma.ingredient.create({ data });
      console.log(`✅ ${ingredient.name} - ${ingredient.currentQuantity} ${ingredient.unit}`);
    }

    const finalCount = await prisma.ingredient.count();
    console.log(`🎉 ¡Listo! Se crearon ${finalCount} ingredientes`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
